'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/types'

export default function RegisterPage() {
  const router  = useRouter()
  const [step, setStep] = useState<'info' | 'plan'>('info')
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'FREE' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 'info') { setStep('plan'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al registrarse')
      setLoading(false)
      return
    }

    router.push('/login?registered=1')
  }

  const plans = Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Crear cuenta</h1>
        <p className="text-center text-gray-500 mb-8">
          {step === 'info' ? 'Tus datos' : 'Elegí tu plan'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'info' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input name="name" type="text" value={form.name} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {step === 'plan' && (
            <div className="space-y-3">
              {plans.map(([key, plan]) => (
                <label key={key}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    form.plan === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" name="plan" value={key}
                    checked={form.plan === key}
                    onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    className="mt-1 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {plan.name}
                      {plan.price > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ${plan.price.toLocaleString('es-AR')}/mes
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex gap-3">
            {step === 'plan' && (
              <button type="button" onClick={() => setStep('info')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
                Atrás
              </button>
            )}
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creando cuenta...' : step === 'info' ? 'Siguiente →' : 'Crear cuenta'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Ingresá</a>
        </p>
      </div>
    </div>
  )
}
