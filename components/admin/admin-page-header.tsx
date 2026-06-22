type AdminPageHeaderProps = {
  title: string
  description?: string
}

export function AdminPageHeader({
  title,
  description,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
