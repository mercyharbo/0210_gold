import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AdminPlaceholderCardProps = {
  title: string
  value?: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  children?: React.ReactNode
}

export function AdminPlaceholderCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  children,
}: AdminPlaceholderCardProps) {
  return (
    <Card className={`font-sans border-0 shadow-none ring-0 bg-neutral-50/80 p-5 rounded-xl ${className || ''}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-0 pb-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          {value !== undefined && (
            <span className="font-sans text-2xl font-bold text-foreground md:text-3xl">
              {value}
            </span>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white shrink-0">
            <Icon className="size-4" />
          </div>
        )}
      </CardHeader>
      {(description || children) && (
        <CardContent className="flex flex-col gap-3 p-0 pt-2">
          {description && (
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  )
}
