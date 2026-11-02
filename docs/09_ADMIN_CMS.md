# 09 — Admin Dashboard Specification

## Navigation
Overview; Profile & About; Services; Portfolio/Events; Gallery/Media; Videos; Testimonials; Media Kit; Blogs; Availability; Booking Requests; Contact Messages; Website Settings; SEO Settings.

## Standard editor
List/search/filter → create/edit → Zod validation → save draft → authenticated preview → publish/unpublish → revalidate public route. Include loading, empty, success, error and unsaved-change states.

## Overview
Real counts only: new enquiries, contact messages, published content totals, upcoming availability entries. Do not show fabricated traffic metrics.

## Media manager
Upload to Neon Object Storage, record object key and metadata in Neon DB, edit alt/caption/rights, view usage references, block deletion if referenced. Private/public access must be explicit.

## Booking queue
Filter by status/date; view submitted details; private notes; status transitions. `accepted` is internal pipeline status, not automatic contractual booking confirmation.

## Availability
Month/list views. Set Available/Tentative/Unavailable and optional public/private notes. Public view exposes only date/status/public note.

## Publishing
Draft never public. Preview owner-authenticated, `noindex`, `no-store`. Publish triggers revalidation for impacted routes and sitemap.
