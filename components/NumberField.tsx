'use client'

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number
  placeholder?: string
}

export default function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder,
}: NumberFieldProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-600">
      <span>{label}</span>
      <input
        type="number"
        className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-gray-900"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </label>
  )
}
