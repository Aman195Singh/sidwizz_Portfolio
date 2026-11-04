---
name: feature-delivery
description: Deliver one V1 feature end-to-end for TanStack Start + Vite with accessible UI, type safety and tests.
---
# Feature Delivery Skill — TanStack Start + Vite

1. Map requirement to target file under `src/routes/` or `src/components/site.tsx`.
2. Inspect existing route implementations before writing code.
3. Plan file changes respecting TanStack Router conventions (`createFileRoute`, `<Link>`, `<HeadContent />`).
4. Validate all client-side inputs using Zod and React Hook Form.
5. Use Radix UI primitives (`src/components/ui/`) for accessible modals, drawers, tooltips, and forms.
6. Verify design system alignment with Tailwind CSS v4 in `src/styles.css`.
7. Import assets from `src/assets/*.jpg` for optimal Vite hashing and bundling.
8. Verify responsiveness (320px mobile to 1920px desktop) with zero horizontal overflow.
9. Run `npm test` and `npm run build` to ensure 100% test pass and zero build errors.
10. Verify dev server at `http://localhost:8080/`.
