'use client'

interface CollectInquiryButtonProps {
  overlordName: string
}

export default function CollectInquiryButton({ overlordName }: CollectInquiryButtonProps) {
  const subject = encodeURIComponent(`Collect Inquiry: Individual Token - ${overlordName}`)

  return (
    <button
      onClick={() => { window.location.href = `mailto:coldieart@gmail.com?subject=${subject}` }}
      className="w-full text-center font-mono text-xs uppercase tracking-[0.15em] text-black bg-white px-4 py-3 hover:bg-white/90 transition-colors cursor-pointer"
    >
      Inquire to Collect
    </button>
  )
}
