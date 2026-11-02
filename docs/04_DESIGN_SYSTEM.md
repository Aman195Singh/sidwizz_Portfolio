# 04 — Design System

## Brand
Original selected direction: deep purple/near-black concert aesthetic, magenta glow, electric-yellow accent, clean white typography. Energetic, not visually noisy.

## Initial tokens
```css
:root {
  --background: #090611;
  --surface: #151021;
  --surface-raised: #211632;
  --foreground: #F8F6FC;
  --muted: #B9B1C8;
  --primary: #C026D3;
  --accent: #F5E642;
  --border: rgba(255,255,255,.12);
  --focus: #F5E642;
}
```
Validate contrast and actual approved brand assets before production.

## Components
Container, Section, Header, MobileNav, Footer, Button, IconButton, FormField, Input, Textarea, Select, Checkbox, ServiceCard, EventCard, TestimonialCard, ArticleCard, VideoCard, MediaLightbox, Alert, Toast, Skeleton, EmptyState, ErrorState, AdminShell, Sidebar, DataTable, StatusBadge, EditorForm, MediaPicker, PublishControls, AvailabilityCalendar, AvailabilityLegend.

## Rules
Two font families maximum; use next/font. Glow is accent only. Focus visible. Respect reduced motion. No autoplay audio. Keyboard accessible. Do not use colour alone for status. Test 360, 390, 768, 1024, 1280, 1440px with no horizontal overflow.
