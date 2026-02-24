'use client'

import { useState } from 'react'
import InquiryForm from '@/components/InquiryForm'

export default function ContactColdie() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        <span>Contact Coldie</span>
      </button>
      <InquiryForm
        open={open}
        onClose={() => setOpen(false)}
        subject="General Inquiry"
      />
    </>
  )
}
