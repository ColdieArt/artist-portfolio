'use client'

import { useState } from 'react'
import InquiryForm from './InquiryForm'

interface CollectInquiryButtonProps {
  overlordName: string
}

export default function CollectInquiryButton({ overlordName }: CollectInquiryButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center font-mono text-xs uppercase tracking-[0.15em] text-black bg-white px-4 py-3 hover:bg-white/90 transition-colors"
      >
        Inquire to Collect
      </button>
      <InquiryForm
        open={open}
        onClose={() => setOpen(false)}
        subject={`Individual Token - ${overlordName}`}
      />
    </>
  )
}
