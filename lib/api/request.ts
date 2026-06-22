export type ParsedBodyResult =
  | {
      success: true
      body?: unknown
    }
  | {
      success: false
    }

export async function parseJsonBody(request: Request): Promise<ParsedBodyResult> {
  const rawBody = await request.text()

  if (!rawBody.trim()) {
    return { success: true }
  }

  try {
    return {
      success: true,
      body: JSON.parse(rawBody) as unknown,
    }
  } catch {
    return { success: false }
  }
}

export function normalizeEndpoint(pathSegments: string[] = []) {
  return pathSegments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/')
}
