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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {value !== undefined && (
            <span className="font-sans text-2xl font-bold  text-foreground md:text-3xl">
              {value}
            </span>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold shrink-0">
            <Icon className="size-5" />
          </div>
        )}
      </CardHeader>
      {(description || children) && (
        <CardContent className="flex flex-col gap-3">
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  )
}
