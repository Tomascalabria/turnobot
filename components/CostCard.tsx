'use client'

import { ReactNode } from 'react'
import { formatARS } from '@/lib/pricing'

interface CostCardProps {
  icon: string
  title: string
  subtitle: string
  cost: number
  isCheapest: boolean
  children?: ReactNode
  disclaimer?: string
  info?: ReactNode
}

export default function CostCard({
  icon,
  title,
  subtitle,
  cost,
  isCheapest,
  children,
  disclaimer,
  info,
}: CostCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-4 flex flex-col gap-2 bg-white ${
        isCheapest ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
      }`}
    >
      {isCheapest && (
        <span className="absolute -top-3 left-4 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
          Más barato
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{formatARS(cost)}</p>

      {info}

      {children && (
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer select-none text-blue-600 hover:underline">
            Ajustar parámetros
          </summary>
          <div className="mt-2 flex flex-col gap-2">{children}</div>
        </details>
      )}

      {disclaimer && <p className="text-xs text-gray-400 leading-snug">{disclaimer}</p>}
    </div>
  )
}
