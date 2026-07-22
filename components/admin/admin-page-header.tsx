type AdminPageHeaderProps = {
  title: string
  description?: string
}

export function AdminPageHeader({
  title,
  description,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5 font-sans">
      <h1 className="text-lg font-sans font-semibold text-foreground md:text-xl">
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
