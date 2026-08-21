import type { ReactNode } from 'react'

interface FieldProps {
  id: string
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function Field({ id, label, hint, required, children }: FieldProps) {
  return (
    <div className="mt-5">
      <label className="label" htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-rose-700">必須</span>}
      </label>
      {hint && <p className="field-hint">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}
