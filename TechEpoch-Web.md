# Tech Epochalypse — Web Platform

## What the Project Does

Tech Epochalypse is the web platform for **KnowYourOverlord.art**, an interactive digital art series by the artist **Coldie**. It presents five kinetic 3D portraits of influential tech figures — Elon Musk, Mark Zuckerberg, Sam Altman, Jeff Bezos, and Jensen Huang — plus a sixth "Collective" piece that merges all five.

Each portrait is a fully interactive WebGL experience (built with Three.js and custom shaders) embedded in its own HTML page. Users can drag, rotate, adjust depth layers, toggle animations, remove and reset pieces, and export their own unique compositions as images. Exported images are uploaded to cloud storage and cataloged via Airtable, forming a community gallery of user-created iterations.

The site wraps these artworks in a noir, surveillance-themed narrative — "classified dossiers" on the overlords, redacted text, scanlines, particle backgrounds — framing the tech figures as nodes in a network the viewer is investigating.

Beyond the main site, a **Portrait Agent** tool uses the Anthropic Claude API and the Moltbook social platform to crowdsource creative direction from AI agents before generating new portrait concepts.

## File Structure

```
artist-portfolio/
├── index.html                         # Legacy single-page portfolio (original site)
├── package.json                       # Root deps (AWS S3 SDK)
├── vercel.json                        # Root Vercel config
├── wrangler.toml / wrangler.jsonc     # Root Cloudflare Worker config
│
├── api/                               # Vercel serverless functions (root-level)
│   ├── portfolio.js                   #   GET /api/portfolio — overlord data API
│   ├── gallery.js                     #   GET /api/gallery — list exported images
│   ├── image.js                       #   GET /api/image — serve images from S3
│   ├── submit.js                      #   POST /api/submit — upload + Airtable record
│   └── upload.js                      #   POST /api/upload — image upload to S3
│
├── background/                        # Background images for original portfolio
├── images/                            # Signature/branding images
│
├── tech-epochalypse/                  # Static HTML prototype (pre-Next.js)
│   ├── index.html, about.html, ...    #   Hand-coded pages
│   ├── style.css                      #   Single stylesheet
│   └── data/collectors.json           #   Collector data
│
├── tech-epochalypse-site/             # Main Next.js application
│   ├── package.json                   #   Next 14, React 18, Three.js, Tailwind
│   ├── next.config.js                 #   Static export (output: 'export')
│   ├── tailwind.config.ts             #   Custom theme: noir palette, animations
│   ├── tsconfig.json                  #   TypeScript config
│   ├── vercel.json                    #   Vercel deploy config with API rewrites
│   ├── postcss.config.js              #   PostCSS for Tailwind
│   │
│   ├── src/
│   │   ├── app/                       #   Next.js App Router pages
│   │   │   ├── layout.tsx             #     Root layout (nav, footer, TL embeds)
│   │   │   ├── page.tsx               #     Homepage — hero, dossiers, series overview
│   │   │   ├── globals.css            #     Global styles (grain, scanlines, animations)
│   │   │   ├── about/page.tsx         #     About the artist
│   │   │   ├── overlords/page.tsx     #     Overlord grid listing
│   │   │   ├── overlords/[slug]/page.tsx  # Individual overlord with embedded artwork
│   │   │   ├── series/page.tsx        #     Art series overview
│   │   │   ├── gallery/page.tsx       #     Community export gallery
│   │   │   ├── collectors/            #     Founding collectors/patrons page
│   │   │   ├── mainframe/             #     Central hub (exploits, submissions, feed)
│   │   │   ├── the-pulse/page.tsx     #     Live data/news feed for overlords
│   │   │   └── kinetic-3d-patronage/  #     Patronage info page
│   │   │
│   │   ├── components/                #   React components
│   │   │   ├── Navigation.tsx         #     Site navigation
│   │   │   ├── Footer.tsx             #     Site footer
│   │   │   ├── ParticleNetwork.tsx    #     Animated particle background
│   │   │   ├── BioCoder.tsx           #     Surveillance data overlay on hero
│   │   │   ├── ScrollReveal.tsx       #     Scroll-triggered reveal animations
│   │   │   ├── ArtworkViewer.tsx      #     Iframe-based artwork embed
│   │   │   ├── InteractiveFaceViewer.tsx  # Three.js face viewer
│   │   │   ├── GalleryViewer.tsx      #     Community gallery display
│   │   │   ├── UserExports.tsx        #     User export/save functionality
│   │   │   ├── InquiryForm.tsx        #     Contact/collect inquiry form
│   │   │   ├── CollectInquiryButton.tsx   # CTA for collecting art
│   │   │   ├── ContactColdie.tsx      #     Contact form component
│   │   │   ├── OverlordNewsFeed.tsx   #     News feed for overlord updates
│   │   │   └── pulse/                 #     Pulse page components
│   │   │       ├── OverlordCard.tsx
│   │   │       ├── PulseChart.tsx
│   │   │       ├── PulseNarrative.tsx
│   │   │       └── PulseOverview.tsx
│   │   │
│   │   ├── data/                      #   Static JSON data
│   │   │   ├── overlords.json         #     All 6 overlord definitions
│   │   │   ├── collectors.json        #     Founding collector profiles
│   │   │   └── gallery.json           #     Gallery configuration
│   │   │
│   │   └── lib/
│   │       └── pulse-client.ts        #     Client for live pulse data
│   │
│   ├── public/                        #   Static assets
│   │   ├── artworks/*.html            #     Interactive WebGL artwork files
│   │   └── images/overlords/          #     Overlord thumbnails and media
│   │
│   ├── api/                           #   Vercel serverless functions (site-level)
│   │   ├── gallery.js, image.js       #     Same gallery/image API endpoints
│   │   ├── submit.js, upload.js       #     Same submit/upload endpoints
│   │
│   ├── worker/                        #   Cloudflare Worker API
│   │   ├── wrangler.toml              #     Worker config — R2 bucket, Airtable secrets
│   │   ├── src/index.ts               #     Worker routes: upload, gallery, submit, contact
│   │   └── package.json               #     Worker dependencies
│   │
│   └── out/                           #   Static export output (generated)
│
├── portrait-agent/                    # AI portrait generation agent (Moltbook edition)
│   ├── run.py                         #   Main orchestrator
│   ├── agents.py                      #   Agent/subject definitions
│   ├── discussion.py                  #   Moltbook post composition + feedback synthesis
│   ├── generators.py                  #   Portrait generation via Claude API
│   ├── moltbook.py                    #   Moltbook API client
│   ├── requirements.txt               #   Python deps (anthropic SDK)
│   └── skill/SKILL.md                 #   Skill documentation
│
├── portrait-series/                   # Earlier version of portrait agent
│   └── (same structure as portrait-agent)
│
└── .github/workflows/
    └── deploy.yml                     # CI/CD — Vercel deploy on push to main
```

## Decisions Made and Why

### Next.js with Static Export
The site uses Next.js 14 with `output: 'export'` to generate a fully static site. This was chosen because the artworks themselves are self-contained HTML/WebGL files that don't need server-side rendering. Static export means the site can be deployed to any CDN (Vercel, Cloudflare Pages) with zero server costs and maximum performance.

### App Router over Pages Router
Next.js App Router was chosen for its layout nesting (shared navigation/footer across all pages), simpler data loading patterns, and future-proof architecture. The `overlords/[slug]` dynamic route cleanly maps each overlord to its own page.

### Tailwind CSS for Theming
Tailwind provides rapid iteration on the noir visual identity — custom colors (bone, charcoal), custom animations (pixel-drift, scanlines, grain overlays), and responsive design without maintaining a separate CSS architecture. The entire visual language is encoded in `tailwind.config.ts`.

### Artworks as Standalone HTML Files
Each overlord portrait is a self-contained HTML file with embedded Three.js and custom WebGL shaders, served from `/public/artworks/`. This keeps the interactive art completely decoupled from the React app — artworks can be developed, tested, and updated independently. They're loaded via iframes in the Next.js pages.

### Dual API Layer (Vercel Functions + Cloudflare Worker)
The project has both Vercel serverless functions (`api/`) and a Cloudflare Worker (`worker/`). The Cloudflare Worker handles image storage (R2 bucket), gallery listings, community submissions (Airtable integration), and a contact form with Turnstile CAPTCHA and Resend email. Vercel functions provide a simpler portfolio data API. This split allows using Cloudflare R2 for cheap image storage while keeping the site on Vercel.

### Airtable for Submission Tracking
Community art exports are cataloged in Airtable via the Worker API. Airtable was chosen as a lightweight, no-code-friendly database that the artist can review and curate directly without building an admin interface.

### Transient Labs Embed Integration
The layout loads the Transient Labs embed SDK for on-chain NFT functionality — allowing artworks to be collected/minted directly from the site. This connects the web experience to the blockchain art market.

### Portrait Agent (Moltbook + Claude API)
The `portrait-agent/` directory is an experimental AI-assisted creative tool. It posts portrait concepts to Moltbook (a social platform for AI agents), collects feedback from other AI agents, synthesizes that feedback using Claude, and generates new portrait concepts. This reflects a decision to use AI collaboration as part of the creative process — art shaped by machine discourse.

### Static Data Files over a CMS
Overlord definitions, collector profiles, and gallery config live as JSON files in `src/data/`. This keeps the build simple and version-controlled. The data changes infrequently enough that a CMS would add unnecessary complexity.

## What's Next

- **Mainframe Hub Build-out** — The mainframe page is scaffolded with sections for active exploits/bounties, community remix submissions, a raw signals gallery, and a live social feed ("The Wire"). These sections need full implementation with real data sources and interactivity.
- **The Pulse — Live Data Integration** — The pulse page and its components (PulseChart, PulseNarrative, OverlordCard) are in place but need connection to live data feeds for real-time overlord tracking and visualization.
- **Community Gallery Curation** — The upload/submit pipeline to R2 + Airtable is built. Next steps include building a public-facing gallery page that pulls from the API and displays curated community exports.
- **Combined Overlord ("The Collective")** — The sixth overlord entry exists with "unlisted" status and a SWAP MODE concept where users can cycle facial elements across all five overlords. This artwork needs to be fully built and launched.
- **On-Chain Collection Drops** — Transient Labs integration is loaded but individual collection/minting flows per overlord need to be wired up with contract addresses and drop parameters.
- **Portrait Agent Iteration** — The Moltbook-based portrait agent pipeline is functional. Future work could feed generated portrait concepts back into the website as new content or exhibition pieces.
- **Additional Overlords / Series Expansion** — The data model supports adding new overlords and art series. The architecture is ready for the collection to grow beyond the initial five.
