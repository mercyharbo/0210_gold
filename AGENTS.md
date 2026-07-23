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
