# 10 — Booking and Contact Workflows (TanStack Start + Vite)

## 1. Booking & Enquiry Fields
- **Organizer Information:** Organizer Name, Corporate / Entity Name, Work Email, Phone / WhatsApp (with country code).
- **Event Information:** Event Date, City / Venue Location, Event Format (Tech Summit, Gala, Conclave, Festival, Wedding, etc.), Estimated Audience Size.
- **Brief / Message:** Key objectives, specific requirements, hosting duration.
- **Client Validation:** Instant inline feedback powered by `react-hook-form` and `@hookform/resolvers/zod`.

---

## 2. Submission & Feedback Flow
1. **User Submission:** User fills out form on `/contact` (or opens booking drawer from "Book Sid" buttons).
2. **Client Validation:** Zod schema validates email syntax, phone format, and required fields.
3. **Pending State:** Submit button disables and displays loading indicator to prevent accidental duplicate submissions.
4. **Instant Toast:** Sonner toast displays confirmation:
   > *"Enquiry Received! Siddharth's team will get back to you within 24 hours."*
5. **Direct Channel Fallback:** Form explicitly surfaces direct WhatsApp and email reach-out buttons for organizers with urgent date requirements.

---

## 3. Availability & Confirmation Policy
- **Advisory Only:** Any date enquiry submitted online is an initial lead/enquiry, NOT an automatic booking confirmation.
- **Private Data Protection:** The public site never reveals other clients' names, event budgets, or internal organizer notes.
- **Owner Review:** All bookings are finalized directly by Siddharth Maurya's management team.
