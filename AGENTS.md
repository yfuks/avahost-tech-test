# AGENTS.md — Ava Guest App & Ticketing

This document guides AI agents and developers working on the **Ava** project: a mobile app for travelers who chat with Ava, the AI co-host for concierge services and property management.

---

## 1. Project overview

**Ava** is an AI assistant that:

- Answers questions about the accommodation (e.g. bed size, amenities, check-in).
- Handles incidents (e.g. internet issues).
- Creates and tracks support tickets when needed.
- **Never discloses sensitive data without stay confirmation.**

A mock is provided for the backend with data for a typical listing. All sensitive data rules apply to this mock.

---

## 2. User types — scenarios are not the same

There are **two distinct user types**; each has its own context and scenarios. Do not mix their flows or permissions.

| User type | App / surface | Auth | Main scenario |
|-----------|----------------|------|----------------|
| **Guest (traveler)** | **Mobile app (Expo)** | **Not connected** — no login. Identified only by confirmation code when they need sensitive data or to create/follow a ticket. | Chat with Ava: ask about the listing, confirm stay with code, report internet issue (strict 3-step flow), request ticket follow-up. Sensitive data only after code `HM8BSDEMO`. |
| **Admin (ops)** | **Back office (Next.js)** | Admin user (e.g. staff). | Manage tickets: list tickets, change status (`created` → `in_progress` → `resolved`). No chat with Ava; no confirmation code. Uses NestJS API (GET/PATCH tickets). |

- **Guest (mobile):** Unauthenticated user. No account. Confirmation code is the only “proof” of stay; it gates sensitive data and ticket creation/follow-up. All Ava rules (sensitive data, internet incident steps) apply here.
- **Admin (back office):** Authenticated staff. No confirmation code, no Ava chat. Only ticket CRUD and status updates. The guest app must reflect status changes (e.g. when admin sets a ticket to `resolved`, the traveler sees it in the chat/follow-up).

When implementing or describing flows, always specify whether the scenario is for the **guest on mobile** or the **admin on back office**.

---

## 3. Sensitive data & stay confirmation

- Ava must **never** use or reveal sensitive data until the stay is **confirmed**.
- The traveler must provide the confirmation code: **`HM8BSDEMO`**.
- **Without this code:**
  - Ava answers **only** with **public listing data** (`publicListingData` from the mock).
  - If the user asks for something that requires sensitive info (e.g. Wi‑Fi password, lockbox code), Ava **asks for the confirmation code** and does not reveal that data until it is provided and validated.

Sensitive data lives in `privateHostData` in the mock (e.g. Wi‑Fi credentials, lockbox code, emergency contacts). Public data is everything under `publicListingData`.

---

## 4. Mandatory scenario — Internet incident (guest only)

For every follow-up from the traveler about an internet problem, the flow **must** follow these steps **in this order**. Ava must **never skip a step or invent information**.

1. **Remind Wi‑Fi credentials**  
   After stay confirmation, give the Wi‑Fi network name and password from the mock.

2. **Self-repair procedure**  
   If it still doesn’t work, give the troubleshooting steps from the mock (`troubleshootingProcedure`: unplug the box, wait 20 seconds, plug back in, wait 2 minutes).

3. **Create a ticket via the NestJS API**  
   If the issue persists, create a ticket (e.g. `POST /tickets`) and then:
   - Allow the traveler to **track** the ticket (e.g. `GET /tickets/:id`).
   - Use the **real status** from the API (`created` | `in_progress` | `resolved`).
   - When the status becomes **`resolved`**, Ava must **inform the traveler** with a clear message (e.g. “Your ticket has been resolved.”).

Implement the flow so that each “relance” (follow-up) from the user advances through these steps in order, without jumping ahead or making up data.

---

## 5. Project structure

| Part | Stack | Role |
|------|--------|------|
| **Guest app** | **Expo** (React Native) | Single main screen: **Chat**. Traveler can: ask about the listing, confirm stay with the code, report an internet problem, ask for ticket follow-up. |
| **Database** | **Supabase** | Table `tickets` (see schema below). |
| **API** | **NestJS** | Ticketing API with the 3 endpoints below. |
| **Admin / back office** | **Next.js** | Simple UI (or CLI) so staff can change ticket status. Guest app must reflect status changes (e.g. via polling or similar). |

### Supabase — `tickets` table

- `id`: uuid (PK)
- `listing_id`: text, e.g. `"DEMO"`
- `category`: text, e.g. `"internet"`
- `status`: `"created"` | `"in_progress"` | `"resolved"`
- `updated_at`: timestamp

### NestJS API — endpoints

- **POST /tickets** — Create a ticket (body: e.g. `listing_id`, `category`).
- **GET /tickets/:id** — Get one ticket (for guest follow-up and admin).
- **PATCH /tickets/:id** — Update a ticket (e.g. status); used by admin and/or backend.

---

## 6. Technical choices

- **LLM:** OpenAI (avoid uncertainty; stick to one model/provider).
- **Goal:** Ship quickly. No tests, no CI. Validate manually (e.g. run app and API from the command line, click through flows).

---

## 7. React best practices (Expo + Next.js)

Use these for the **Expo** guest app and the **Next.js** admin panel.

- **Components:** Prefer small, single-responsibility components. Keep presentational vs. logic separation where it helps (e.g. custom hooks for API/chat state).
- **State:** Use React state (e.g. `useState` / `useReducer`) or a minimal store (e.g. Context, or Zustand if needed). Avoid over-engineering.
- **Data fetching:** In Next.js admin, use `fetch` or a simple client (e.g. `fetch` to the NestJS API). In Expo, same idea: one clear place for API calls (e.g. a `tickets` service).
- **Lists:** Use `key` from stable IDs (e.g. ticket `id`). Avoid index as key when list can change.
- **Forms / inputs:** Controlled inputs where needed (e.g. confirmation code, message input). Validate confirmation code before exposing sensitive data or creating tickets.
- **Async / errors:** Handle loading and error states in the UI (e.g. “Loading…”, “Wrong code”, “Failed to create ticket”). No silent failures.
- **Expo:** Prefer Expo APIs and managed workflow where possible. Keep one entry screen (e.g. Chat) as per spec.
- **Next.js:** Use App Router or Pages as chosen; keep admin simple (e.g. list tickets, form to PATCH status).

---

## 8. NestJS best practices

Use these for the **NestJS** ticketing API.

- **Structure:** Organize by feature (e.g. `TicketsModule`, `TicketsController`, `TicketsService`). Keep DTOs for request/response validation.
- **Endpoints:**  
  - `POST /tickets` — create ticket, return created resource (with `id`, `status: 'created'`, etc.).  
  - `GET /tickets/:id` — return one ticket or 404.  
  - `PATCH /tickets/:id` — accept at least `status`; return updated ticket.
- **Validation:** Use `class-validator` (and `ValidationPipe`) on DTOs for body and params where useful (e.g. `status` enum).
- **Database:** Use Supabase as the data store. Prefer a small abstraction (e.g. `TicketsService` calling Supabase client) so endpoints stay thin.
- **IDs:** Use UUID for `id`. Generate server-side on create; use `:id` in GET/PATCH.
- **Errors:** Return appropriate HTTP status codes (e.g. 400 for bad input, 404 for missing ticket). Consistent error shape helps the guest app and admin.
- **CORS:** Enable CORS for the Expo app and Next.js admin origins so they can call the API from the browser/device.

---

## 9. Quick reference

| Item | Value |
|------|--------|
| User types | **Guest** (mobile, not connected) vs **Admin** (back office); scenarios differ (see §2) |
| Confirmation code | `HM8BSDEMO` |
| Listing id (mock) | `DEMO` |
| Ticket category (internet) | `internet` |
| Ticket statuses | `created`, `in_progress`, `resolved` |
| Sensitive data | Only after code validation; from `privateHostData` in mock |
| Internet flow | 1) Wi‑Fi credentials → 2) Self-repair → 3) Create ticket + follow-up + “resolved” message |

---

*Keep this file updated when the project or rules change so agents and developers stay aligned.*
