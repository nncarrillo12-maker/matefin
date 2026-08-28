"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

const inputBase =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />
}

export function SelectInput({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(inputBase, "appearance-none pr-8", className)}>
      {children}
    </select>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; accent?: "credito" | "inversion" }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card p-1.5"
    >
      {options.map((o) => {
        const isActive = value === o.value
        const accentClass =
          o.accent === "credito"
            ? "bg-credito text-credito-foreground"
            : o.accent === "inversion"
              ? "bg-inversion text-inversion-foreground"
              : "bg-primary text-primary-foreground"
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? accentClass : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
