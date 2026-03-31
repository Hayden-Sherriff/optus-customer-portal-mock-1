# Testing the Optus Customer Portal

## Overview
This is an Angular 18 standalone app with 3 routes: Dashboard, Billing, Account. There is no backend API, so all HTTP calls to `/api/*` will fail — this is expected.

## Dev Server Setup
```bash
npm install
npx ng serve --host 0.0.0.0 --port 4200
```
The app will be available at `http://localhost:4200/`. It redirects `/` to `/dashboard`.

## Testing Routes

### Dashboard (`/dashboard`)
- Shows an error banner "Unable to load your plans. Please try again." because `/api/plans` fails (no backend)
- If it shows "Loading your plans..." indefinitely, there may be a deadlock bug with async pipe subscription gating
- The component uses imperative `subscribe()` with `DestroyRef` + `takeUntilDestroyed` for cleanup

### Billing (`/billing`)
- Shows "Invoices" heading with a table
- Table displays "No invoices found." via `@empty` block (since `/api/invoices` fails and the array stays empty)
- Uses `DestroyRef` + `takeUntilDestroyed` pattern

### Account (`/account`)
- Shows a reactive form with Email and Phone fields
- To test validation: click the email field, then click away (blur) — should show "Please enter a valid email address."
- Click the phone field, then click away — should show "Phone number is required."
- "Save Changes" button should be disabled when form is invalid
- Uses `NonNullableFormBuilder` for type-safe forms

## Console Error Checking
- Open DevTools (F12) and check the Console tab
- Expected: "Angular is running in development mode." info message
- Expected: `HttpErrorResponse` from `/api/plans` (this is normal — no backend)
- Expected: favicon.ico 404 (harmless)
- NOT expected: `NullInjectorError`, `NG0XXX` errors, or uncaught exceptions

## Key Angular 18 Patterns to Verify
- `@if` / `@for` / `@empty` control flow blocks (replaced `*ngIf` / `*ngFor`)
- Standalone components with explicit `imports` arrays
- `inject()` function for DI (no constructor injection)
- `bootstrapApplication()` in `main.ts` (no NgModule)

## Build Verification
```bash
npx ng build
```
Should complete with 0 errors.

## Devin Secrets Needed
None — this app runs entirely locally with no authentication or external services.
