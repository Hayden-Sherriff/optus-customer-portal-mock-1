# Testing the Optus Customer Portal

## Quick Start

```bash
npm install
npx ng serve --port 4200
```

Open `http://localhost:4200` in Chrome. The app redirects to `/dashboard` by default.

## Routes and Expected Behavior

| Route | Component | Expected behavior (no backend) |
|---|---|---|
| `/dashboard` | DashboardComponent | Shows "Loading your plans..." briefly, then error banner "Unable to load your plans. Please try again." (API 404 triggers error callback) |
| `/billing` | BillingComponent | Shows "Billing" heading and "Loading invoices..." indefinitely (API 404, no error handler, `isLoading` stays `true`) |
| `/account` | AccountComponent | Form renders immediately with Email/Phone inputs and disabled Save button. No API call on init. |

## Key Test Scenarios

### Dashboard Error State
- The dashboard uses `DestroyRef` + `takeUntilDestroyed()` with an eager `subscribe()` in the constructor
- The HTTP request fires immediately, and when it 404s the `error` callback sets `hasError = true` and `isLoading = false`
- **Gotcha**: If someone uses `AsyncPipe` inside an `@if (!isLoading)` block, the pipe never subscribes because `isLoading` starts as `true`, creating a circular dependency. Always use eager subscription for observables that control loading state.

### Billing Loading State
- Uses `DestroyRef` + `takeUntilDestroyed()` with eager subscribe
- `isLoading` starts `true`, set to `false` only on successful response
- Important: verify "No invoices found." does NOT flash during loading (guarded by `!isLoading && invoices.length === 0`)

### Account Form Validation
- Uses `NonNullableFormBuilder` with `inject()` DI
- Email field: `Validators.required` and `Validators.email`
- Phone field: `Validators.required`
- Validation messages appear via `@if` blocks after field is `touched`
- Save button disabled when form is invalid (`[disabled]="accountForm.invalid"`)
- Test flow: click email → blur → see "Email is required." → type invalid → see "Please enter a valid email address." → type valid → errors clear → fill phone → Save enables

### SPA Navigation
- Click nav links (Dashboard, Billing, Account) — should navigate without page reload
- Each component should render its content correctly
- Note: nav links have no spacing/styling by default — they appear joined together

## Build & Lint

```bash
npx ng build    # Production build
npx ng serve    # Dev server with hot reload
```

No lint command is configured. No unit tests exist.

## Architecture Notes

- Angular 18 with standalone components (no NgModule)
- Bootstrapped via `bootstrapApplication()` with `provideRouter()` and `provideHttpClient()`
- All components use `inject()` for dependency injection
- Dashboard and Billing use `DestroyRef` + `takeUntilDestroyed()` for subscription lifecycle
- Account uses `NonNullableFormBuilder` for typed reactive forms
- Templates use `@if` / `@for` control flow (not `*ngIf` / `*ngFor`)
- No backend exists — all `/api/*` endpoints return 404
- No CSS styles defined for component classes — everything renders unstyled

## Devin Secrets Needed

None — this is a frontend-only app with no authentication or external services.
