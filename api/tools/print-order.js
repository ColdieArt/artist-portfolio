/**
 * POST /api/tools/print-order
 *
 * Server-side endpoint for the Print Render Station.
 * Creates a Shopify Draft Order, sends the invoice email,
 * and logs everything to Airtable.
 *
 * Environment variables required:
 *   SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN,
 *   AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_PRINT_ORDERS_TABLE,
 *   PRINT_STATION_SECRET
 */

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── Parse body ──
  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Missing request body' });
  }

  // ── Auth ──
  const secret = process.env.PRINT_STATION_SECRET;
  if (!secret || data.secret !== secret) {
    return res.status(403).json({ error: 'Invalid secret' });
  }

  // ── Validate required fields ──
  const required = ['overlord', 'printSize', 'resolution', 'price', 'buyerName', 'buyerEmail', 'jsonFilename', 'pngFilename'];
  for (const field of required) {
    if (!data[field]) {
      return res.status(400).json({ error: 'Missing required field: ' + field });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.buyerEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // ── Step 1: Create Shopify Draft Order ──
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const shopifyToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

    let shopifyDraftOrderId = null;
    let shopifyInvoiceUrl = null;

    if (shopifyDomain && shopifyToken) {
      const draftOrder = await createShopifyDraftOrder(shopifyDomain, shopifyToken, data);
      shopifyDraftOrderId = draftOrder.id;
      shopifyInvoiceUrl = draftOrder.invoiceUrl;

      // ── Step 2: Send invoice email ──
      await sendDraftOrderInvoice(shopifyDomain, shopifyToken, shopifyDraftOrderId, data.buyerEmail);
    }

    // ── Step 3: Create Airtable record ──
    let airtableRecordId = null;
    const airtableKey = process.env.AIRTABLE_API_KEY;
    const airtableBase = process.env.AIRTABLE_BASE_ID;
    const airtableTable = process.env.AIRTABLE_PRINT_ORDERS_TABLE || 'Print Orders';

    if (airtableKey && airtableBase) {
      airtableRecordId = await createAirtableRecord(airtableKey, airtableBase, airtableTable, {
        ...data,
        shopifyDraftOrderId: shopifyDraftOrderId || '',
        shopifyInvoiceUrl: shopifyInvoiceUrl || '',
      });
    }

    return res.status(200).json({
      success: true,
      shopifyDraftOrderId: shopifyDraftOrderId,
      invoiceUrl: shopifyInvoiceUrl,
      airtableRecordId: airtableRecordId,
    });

  } catch (err) {
    console.error('Print order error:', err);
    return res.status(500).json({
      error: 'Order processing failed',
      detail: err.message,
    });
  }
};


// ── Shopify: Create Draft Order ──

async function createShopifyDraftOrder(domain, token, data) {
  const nameParts = data.buyerName.trim().split(/\s+/);
  const firstName = nameParts[0] || data.buyerName;
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const overlordLabel = capitalize(data.overlord.replace(/-/g, ' '));

  const query = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email: data.buyerEmail,
      note: [
        'Tech Epochalypse Print',
        overlordLabel + ' ' + data.printSize,
        'Composition: ' + data.jsonFilename,
        data.notes || '',
      ].filter(Boolean).join('\n'),
      lineItems: [
        {
          title: 'Tech Epochalypse Print: ' + overlordLabel + ' ' + data.printSize,
          quantity: 1,
          originalUnitPrice: String(data.price),
        },
      ],
      shippingLine: {
        title: 'Standard Shipping',
        price: '0.00',
      },
      billingAddress: {
        firstName: firstName,
        lastName: lastName,
      },
    },
  };

  const resp = await fetch('https://' + domain + '/admin/api/2025-04/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query: query, variables: variables }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Shopify API error ' + resp.status + ': ' + text);
  }

  const result = await resp.json();
  const draftOrderData = result.data && result.data.draftOrderCreate;

  if (!draftOrderData) {
    throw new Error('Shopify returned unexpected response: ' + JSON.stringify(result));
  }

  if (draftOrderData.userErrors && draftOrderData.userErrors.length > 0) {
    throw new Error('Shopify draft order error: ' + JSON.stringify(draftOrderData.userErrors));
  }

  return draftOrderData.draftOrder;
}


// ── Shopify: Send Invoice Email ──

async function sendDraftOrderInvoice(domain, token, draftOrderId, buyerEmail) {
  const query = `
    mutation draftOrderInvoiceSend($id: ID!, $email: EmailInput!) {
      draftOrderInvoiceSend(id: $id, email: $email) {
        draftOrder {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    id: draftOrderId,
    email: {
      to: buyerEmail,
      subject: 'Your Tech Epochalypse Print: Complete Your Purchase',
      customMessage: 'Your custom print has been rendered. Click below to complete your purchase and provide your shipping address.',
    },
  };

  const resp = await fetch('https://' + domain + '/admin/api/2025-04/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query: query, variables: variables }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Shopify invoice error ' + resp.status + ': ' + text);
  }

  const result = await resp.json();
  const invoiceData = result.data && result.data.draftOrderInvoiceSend;

  if (invoiceData && invoiceData.userErrors && invoiceData.userErrors.length > 0) {
    throw new Error('Shopify invoice error: ' + JSON.stringify(invoiceData.userErrors));
  }

  return result;
}


// ── Airtable: Create Record ──

async function createAirtableRecord(apiKey, baseId, tableName, data) {
  const resp = await fetch(
    'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(tableName),
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              composition_file: data.jsonFilename,
              png_file: data.pngFilename,
              overlord: data.overlord,
              print_size: data.printSize,
              resolution: data.resolution,
              price: parseFloat(data.price),
              buyer_name: data.buyerName,
              buyer_email: data.buyerEmail,
              notes: data.notes || '',
              render_date: new Date().toISOString().split('T')[0],
              original_timestamp: data.originalTimestamp || '',
              shopify_draft_order_id: data.shopifyDraftOrderId || '',
              shopify_invoice_url: data.shopifyInvoiceUrl || '',
              status: 'invoiced',
            },
          },
        ],
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Airtable error ' + resp.status + ': ' + text);
  }

  const result = await resp.json();
  if (result.records && result.records[0]) {
    return result.records[0].id;
  }
  return null;
}


// ── Helpers ──

function capitalize(str) {
  return str.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}
