import { NextRequest, NextResponse } from 'next/server'
import { runDailyPulse } from '@/lib/pulse-job'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for the cron job

export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel Cron Jobs
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { results, errors } = await runDailyPulse()

    return NextResponse.json({
      status: errors.length > 0 ? 'partial' : 'success',
      results,
      errors,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron pulse job failed:', err)
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
