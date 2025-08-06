"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"


interface Payment {
  payment_id: string
  amount: string
  currency: string
  merchant_id: string
  description: string
  stellar_address?: string
  status: string
  metadata?: Record<string, any>
  expires_at?: string
}

export default function PaymentCheckout() {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [secsLeft, setSecsLeft] = useState(0)
  const [copied, setCopied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "https://mellamate.onrender.com"

  // Extract payment id either from ?pid= or last path segment
  const paymentId = typeof window !== "undefined" ? (() => {
    const url = new URL(window.location.href)
    const q = url.searchParams.get('pid') || url.searchParams.get('payment_id')
    if (q) return q
    return url.pathname.split('/').pop() || ''
  })() : ''

  useEffect(() => {
    if (!paymentId) return
    fetch(`${backendUrl}/api/v1/payments/${paymentId}`, {

    })
      .then((r) => r.json())
      .then((p) => {
        setPayment(p)
        // initialize timer (10 mins default)
        const expires = p.expires_at ? new Date(p.expires_at).getTime() : Date.now() + 10 * 60 * 1000;
        setSecsLeft(Math.max(0, Math.floor((expires - Date.now()) / 1000)))
      })
      .catch((e) => setError(e.message))
    }, [paymentId, backendUrl])

  // countdown tick
  useEffect(() => {
    if (secsLeft <= 0) return
    const id = setInterval(() => setSecsLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [secsLeft])

  const handleConfirm = () => {
    if (!payment || processing) return
    setProcessing(true)
    fetch(`${backendUrl}/api/v1/payments/${payment.payment_id}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet_address: "demo", secret_key: "demo" }),
    })
      .then((r) => r.json())
      .then((data) => {
        postMessageToParent({ payment_id: payment.payment_id, status: data.status ?? "completed" })
      })
      .catch((e) => setError(e.message))
      .finally(() => setProcessing(false))
  }

  const postMessageToParent = (payload: any) => {
    if (window.opener) {
      window.opener.postMessage(payload, "*")
    } else if (window.parent !== window) {
      window.parent.postMessage(payload, "*")
    }
    // give time for parent to receive before closing (if in popup)
    setTimeout(() => window.close(), 500)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
    )
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">Loading payment…</div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl bg-[#0F1B46] text-white">
        {/* Header */}
        <div className="px-6 py-3 bg-gradient-to-r from-[#5F3BFF] to-[#A328FF] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-white text-[#5F3BFF] flex items-center justify-center font-bold">M</div>
            <div>
              <div className="font-semibold">Mellamate Pay</div>
              <div className="text-xs opacity-70 -mt-0.5">Secure Stellar Payment</div>
            </div>
          </div>
          <button onClick={() => window.close()} className="text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Summary rows */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="opacity-70">Event:</span><span>{payment.metadata?.event ?? '—'}</span></div>
            <div className="flex justify-between"><span className="opacity-70">Package:</span><span>{payment.description || '—'}</span></div>
            <div className="flex justify-between"><span className="opacity-70">Amount:</span><span className="font-semibold">{payment.amount} {payment.currency}</span></div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="opacity-70 text-sm">Time remaining</div>
            <div className="font-mono text-2xl">{Math.floor(secsLeft/60)}:{String(secsLeft%60).padStart(2,'0')}</div>
          </div>

          {/* Address */}
          {payment.stellar_address && (
            <div className="text-sm">
              <div className="opacity-70 mb-1">Payment Address:</div>
              <div className="relative bg-[#182559] rounded-md p-3 break-all font-mono text-xs">
                {payment.stellar_address}
                <button
                  onClick={() => {navigator.clipboard.writeText(payment.stellar_address!); setCopied(true); setTimeout(()=>setCopied(false),1500)}}
                  className="absolute top-2 right-2 text-xs opacity-70 hover:opacity-100">📋</button>
                {copied && <span className="absolute -bottom-5 right-0 text-[10px]">Copied!</span>}
              </div>
            </div>
          )}

          {/* CTA */}
          <Button disabled={!payment || processing} onClick={handleConfirm} className="w-full bg-[#2769FF] hover:bg-[#1f5ae0]">
            {processing ? 'Processing…' : 'Connect Mellamate Wallet'}
          </Button>

          <div className="text-center text-[10px] opacity-60 pt-2">
            Don’t have a wallet? <a href="https://wallet.mellamate.io" target="_blank" className="underline">Create one</a>
            <br />Powered by Mellamate &nbsp;|&nbsp; Secured by Stellar
          </div>
        </div>
      </div>
    </div>
  )

}
