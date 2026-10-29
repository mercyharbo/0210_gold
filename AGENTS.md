<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Implementation Rules

Follow these rules strictly when building or editing the frontend.

## Spacing
- Do not use `mt-*` or `mb-*` for spacing unless there is no better option.
- Use parent-level spacing instead:
  - `gap-*`
  - `space-y-*`
  - `space-x-*`
  - Grid/flex layout spacing
- Prefer clean layout structure over manually pushing elements around.
- Avoid random spacing values. Keep spacing consistent across sections and components.

## Typography and Text Casing
- Do not use Tailwind’s `uppercase` class unless specifically requested or the design clearly requires it.
- Do not force all text to lowercase.
- Write normal content using proper sentence case and natural capitalization (e.g., `Can I help you?`).
- Capitalize words where normal grammar, labels, names, headings, buttons, and UI copy require it.
- Only use all-uppercase text when specifically requested or when a provided design attachment uses it.
- Do not use `tracking-tight`, `tracking-wide`, `tracking-wider`, `tracking-widest`, or any `tracking-*` class.
- Minimum text size should be `text-xs`. Avoid text that is too tiny or hard to read.
- Keep typography clean, readable, and natural.
- Use font weight intentionally: `font-medium`, `font-semibold`, or `font-bold` only where needed.

## Colors
- Do not use `zinc-*`.
- Use `gray-*` as the default neutral color scale unless another neutral color is explicitly requested.
- Keep colors consistent with the brand/theme and avoid using too many colors in one interface.

## Layout and Components
- Build reusable components where it makes sense.
- Keep components clean, readable, and easy to maintain. Avoid over-engineering simple UI sections.
- Use semantic HTML where possible.
- Keep sections responsive across mobile, tablet, and desktop using `max-w-*`, `container`, `mx-auto`, `px-*`, `gap-*`, and responsive grid/flex layouts properly.

## UI Style
- The interface should feel clean, modern, premium, and human-made.
- Avoid designs that look generic, overdone, or obviously AI-generated.
- Avoid unnecessary gradients, glowing effects, glassmorphism, and excessive animations unless requested.
- Use subtle borders, shadows, rounded corners, and whitespace where appropriate. Keep the design polished but not noisy.

## Tailwind Usage
- Use Tailwind CSS consistently.
- Avoid long messy class names when a component can be split or simplified.
- Group layout, spacing, typography, color, and state classes in a readable way.
- Avoid arbitrary values like `mt-[37px]`, `text-[11px]`, or `w-[93%]` unless truly necessary. Prefer Tailwind’s default spacing, sizing, and color scale.

## Responsiveness
- Design mobile-first. Make every section look good on small screens before scaling up.
- Ensure buttons, cards, forms, navbars, modals, and tables work properly on mobile.
- Avoid horizontal overflow. Use responsive classes like `sm:`, `md:`, `lg:`, and `xl:` intentionally.

## Interaction
- Keep animations subtle and useful.
- Use hover, focus, and active states where needed.
- Ensure buttons and links have clear interactive states. Do not add unnecessary motion or distracting effects.

## Code Quality
- Write clean, production-ready code.
- Remove unused imports, unused variables, dead code, and console logs.
- Keep naming clear and meaningful. Avoid repeating the same UI pattern unnecessarily.
- Make the code easy for another developer to understand. Prefer clarity over cleverness.

## Accessibility
- Use proper button, link, heading, label, and form semantics.
- Images should have meaningful `alt` text unless decorative.
- Inputs should have labels or accessible names.
- Ensure good contrast between text and background. Do not rely only on color to communicate meaning.

## Final Expectation
Before finishing, review the UI and code against these rules. If any rule is broken, fix it before responding.

# Request, State, and Code Organization Rules

These rules apply to every future feature and migration in this repository.
Use the `nextjs-api-state` skill for frontend request and state architecture.

## Traceable Requests
- Use SWR for client-side GET requests through focused read hooks, such as `hooks/use-user-endpoint.ts`. Keep request keys, query parameters, response types, and SWR configuration there.
- Import and call `useApiRequest` directly inside the component or form that owns a mutation. Keep `execute`, the HTTP method, endpoint, and payload visible in that file's event handler.
- Never hide feature mutations inside read hooks, endpoint hooks, Zustand stores, or one-off mutation hooks such as `useUpdateUser`.
- The shared implementation of `useApiRequest` stays in `hooks/use-api-request.ts`; the restriction above concerns feature-level call sites.
- Reuse the existing API transport, fetcher, and typed error handling. Do not introduce competing request wrappers.
- Browser application requests use same-origin `/api/**`. Keep backend origins and secrets server-only. FastAPI owns authorization, validation, business rules, and authoritative totals.
- Where OAuth redirects or session-cookie protocols require the official provider SDK, keep those SDK calls visible in the owning auth form and document the exception. Do not force protocol operations through an incompatible wrapper.

## State Ownership and Prop Drilling
- Use small, feature-specific Zustand stores for shared UI state: selected IDs, filters, dialogs, workflow steps, and cross-component controls.
- Components needing shared state select it directly from the relevant store. Do not pass it through intermediate components that do not use it.
- Keep stores in the existing `stores/` directory. Do not introduce a competing `store/` directory.
- SWR owns fetched data, read loading/errors, caching, pagination, and revalidation. Do not duplicate these in Zustand.
- `useApiRequest` owns mutation loading/errors per hook instance. Never restore a global request-lifecycle store.
- Use React Hook Form for substantial forms, reusable field components, and form context where needed.
- Use `useState` only for genuinely local component state. Reduce unnecessary local state without moving every input or boolean into a global store.
- Derive values from existing state rather than storing duplicates. Subscribe only to required store fields/actions and use shallow selectors where appropriate.
- Provide explicit store reset actions. Clear user-scoped caches and temporary UI state on logout or account changes.
- Never persist passwords, tokens, OTPs, or sensitive form drafts in Zustand or browser storage.
- Props remain appropriate for reusable presentation components and short parent-child communication.

## Small Files and Predictable Folders
- Keep handwritten feature files below 200 lines. Split components and responsibilities before files become difficult to follow. Generated files, lockfiles, and vendored shadcn primitives are exempt; do not compress code to meet the limit.
- Keep route pages thin. Extract forms, dialogs, sections, and tables into named components.
- Follow the existing structure: `components/<feature>/` for feature UI, `components/ui/` for shadcn primitives, `hooks/` for focused reads and reusable hooks, `stores/` for shared UI state, `types/` for shared/generated contracts, and `lib/` for transport, validation, server helpers, and pure utilities.
- Keep FastAPI routes thin. Separate schemas, database models, services, and authorization dependencies by responsibility.
- Reuse existing infrastructure before adding files or abstractions. Avoid giant components, monolithic stores, vague utility files, circular imports, and duplicate implementations.
- Apply these conventions incrementally to touched features; do not restructure unrelated code.

## UI, Errors, and Verification
- Reuse shadcn components while preserving the FM LUXE identity and all frontend rules above. Prefer parent flex/grid `gap-*` spacing.
- Show field errors inline, focus the first invalid field, prevent duplicate submissions, and preserve input after failures.
- Reset forms and close dialogs only after confirmed success. Revalidate affected SWR keys after mutations; distinguish a successful write followed by a failed refresh from a failed write.
- Use typed contracts, `unknown` with guards, and runtime validation at external boundaries. Avoid `any`.
- Verify changed behavior with focused checks and run a production build at meaningful phase checkpoints. Do not repeat broad checks after they pass unless subsequent changes justify them.
- Before handoff, check request traceability, state ownership, file length, unused code, documentation, and the frontend rules above.

# FastAPI Documentation Rules

- Update FastAPI's OpenAPI documentation in the same change as every added or changed endpoint. Documentation is part of implementation, not a later cleanup task.
- Use explicit Pydantic request and response models. Describe fields, types, required/optional status, nullability, defaults, validation constraints, formats, and enum values accurately.
- Document each endpoint's purpose, HTTP method, path, operation ID, tags, authentication requirements, required roles, and any relevant side effects.
- Document path/query parameters, request headers, body structure, and supported content types. Explain pagination, filtering, sorting, and upload requirements where applicable.
- Include realistic, sanitized request and response examples, including nested structures and the actual success/error envelopes. Never include real credentials, tokens, or customer data.
- Declare actual success and failure status codes and response schemas, including field-validation errors, authentication/permission failures, missing resources, conflicts, and dependency failures where applicable. Do not rely on undocumented default error responses.
- Document behavior needed for correct integration, such as units/currency, timestamps, idempotency, webhook signature requirements, and state transitions when relevant to that endpoint.
- Express authentication through OpenAPI security schemes so Swagger UI clearly shows protected endpoints and supports authorization.
- Keep `/docs`, `/redoc`, and `/openapi.json` consistent with runtime behavior. Verify examples and schemas against actual responses with focused checks.
- Regenerate frontend OpenAPI TypeScript types whenever the public contract changes. Do not manually edit generated types or maintain conflicting handwritten copies.
- Update backend setup documentation when configuration, startup commands, or integration requirements change. An endpoint is not complete until another developer can understand and exercise its documented contract.
