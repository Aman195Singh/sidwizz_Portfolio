# 03 — Page Behaviour & Interaction Specs

## 1. Global Navigation (`Nav` Component)
- **Sticky Glassmorphism Header:** Stays fixed to the top with a subtle backdrop-blur and border bottom.
- **Brand Mark:** Soundwave SVG equalizer logo with "SIDD.WHIZZ" text linking back to `/`.
- **Active Route Highlighting:** Dynamic route matching using `useRouterState` from `@tanstack/react-router` adds accent pill indicators to the active page link.
- **Mobile Drawer:** Hamburger toggle opens a smooth animated slide-over menu with full touch targets and auto-closes on route transition.
- **Quick Action:** Prominent "Book Sid" button in the header directs immediately to `/contact`.

---

## 2. Scroll-Driven Animations (`Reveal`)
- Sections and cards are wrapped in `<Reveal delay={...}>` components.
- Uses browser-native `IntersectionObserver` with a 12% viewport threshold to trigger buttery-smooth upward fade-in transitions (`.reveal.in`).
- Non-blocking and GPU accelerated (`transform: translateY(...)`, `opacity`).
- Respects `prefers-reduced-motion` media queries.

---

## 3. Media Lightbox & Video Modals
- **Gallery Lightbox:**
  - Clicking any gallery photo opens a full-screen, high-resolution modal viewer.
  - Supports keyboard navigation: **Arrow Left / Right** to browse images, **Escape** to dismiss.
  - Background overlay click also closes the viewer.
- **Video Modals:**
  - Event video cards show playback badges. Clicking a card opens a modal video player with iframe or video streaming without disrupting page state.

---

## 4. Contact & Booking Inquiry Flow
- **Form Fields:** Organizer Name, Corporate / Organization Name, Work Email, Phone / WhatsApp, Event Date, Event Format, Approximate Audience Size, and Event Brief.
- **Validation:** Instant feedback on blur and submit via Zod schema validation.
- **Feedback:** Success message delivered via Sonner toast notification with clear next steps ("Thanks! Sid's team will contact you within 24 hours").
- **Fallbacks:** Direct links to WhatsApp chat and email in case an organizer needs immediate same-day confirmation.
