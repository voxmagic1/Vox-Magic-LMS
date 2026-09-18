'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2, Copy, ArrowRight } from 'lucide-react'

export default function PaymentCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen brand-gradient flex items-center justify-center"><Loader2 className="h-12 w-12 text-white animate-spin" /></div>}>
      <PaymentCallbackInner />
    </Suspense>
  )
}

function PaymentCallbackInner() {
  const q = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState('loading')
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('Confirming your payment…')

  useEffect(() => {
    const transaction_id = q.get('transaction_id')
    const tx_ref = q.get('tx_ref')
    const status = q.get('status')
    if (!transaction_id || !tx_ref || status === 'cancelled') {
      setState('failed'); setMsg('Payment was cancelled or incomplete.'); return
    }
    fetch('/api/payments/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id, tx_ref }),
    }).then(r => r.json()).then(x => {
      if (x.ok) {
        setState('success'); setData(x)
        if (x.token) localStorage.setItem('vm_token', x.token)
      } else {
        setState('failed'); setMsg(x.message || 'We could not confirm this payment. Please contact support.')
      }
    }).catch(() => { setState('failed'); setMsg('Verification failed. Please contact support.') })
  }, [q])

  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        {state === 'loading' && (
          <div className="py-10">
            <Loader2 className="h-12 w-12 mx-auto text-brand-blue animate-spin" />
            <p className="mt-6 text-lg font-medium">{msg}</p>
          </div>
        )}
        {state === 'failed' && (
          <div className="py-6">
            <XCircle className="h-14 w-14 mx-auto text-brand-red" />
            <h1 className="font-display text-2xl mt-4 text-brand-navy">Payment not confirmed</h1>
            <p className="mt-2 text-muted-foreground">{msg}</p>
            <Button className="mt-6 bg-brand-purple hover:bg-brand-purple-light" onClick={() => router.push('/')}>Back to Home</Button>
          </div>
        )}
        {state === 'success' && (
          <div className="py-2">
            <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
            <h1 className="font-display text-3xl mt-4 text-brand-navy">Payment Confirmed</h1>
            {data?.kind === 'registration' ? (
              <div className="mt-4 text-left">
                <p className="text-muted-foreground text-center">Your registration is confirmed. Your admission letter has been generated and your student portal is ready.</p>
                <div className="mt-6 rounded-xl border bg-brand-cream p-5">
                  <p className="text-sm text-muted-foreground">Your portal login</p>
                  <p className="font-medium mt-1">Email: <span className="text-brand-purple">{data?.student?.email}</span></p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">Temporary password:</span>
                    <code className="bg-white px-2 py-1 rounded border text-brand-red font-semibold">{data?.tempPassword}</code>
                    <button className="text-brand-blue" onClick={() => navigator.clipboard.writeText(data?.tempPassword || '')}><Copy className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">(Mock email) Save these credentials — you will use them to log into your student portal.</p>
                </div>
                <Button className="mt-6 w-full bg-brand-blue hover:bg-brand-blue-dark" onClick={() => router.push('/?view=login')}>
                  Go to Student Login <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-muted-foreground">Your tuition payment has been received. Thank you!</p>
                <Button className="mt-6 w-full bg-brand-blue hover:bg-brand-blue-dark" onClick={() => router.push('/?view=login')}>Go to My Portal <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
