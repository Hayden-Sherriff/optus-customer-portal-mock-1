# Angular 14 → 18 Migration Guide

This document details every change made during the migration of the Optus Customer Portal Mock from Angular 14 to Angular 18.

---

## Table of Contents

1. [Root-Level Infrastructure Changes](#root-level-infrastructure-changes)
2. [Dashboard Module](#dashboard-module)
3. [Billing Module](#billing-module)
4. [Account Module](#account-module)
5. [Summary of Breaking Changes](#summary-of-breaking-changes)

---

## Root-Level Infrastructure Changes

### 1. Package Dependencies (`package.json`)

All Angular packages upgraded from `^14.3.0` to `^18.0.0`:

| Package | Before | After |
|---------|--------|-------|
| `@angular/*` | `^14.3.0` | `^18.0.0` |
| `@angular-devkit/build-angular` | `^14.3.0` | `^18.0.0` |
| `@angular/cli` | `~14.3.0` | `^18.0.0` |
| `rxjs` | `~6.6.0` | `~7.8.0` |
| `zone.js` | `~0.11.4` | `~0.14.3` |
| `typescript` | `~4.7.2` | `~5.4.2` |

### 2. Bootstrap: NgModule → Standalone (`main.ts`)

**Before (Angular 14):** The app bootstrapped via `platformBrowserDynamic().bootstrapModule(AppModule)`.

**After (Angular 18):** Uses `bootstrapApplication()` with a standalone `AppComponent` and an `ApplicationConfig`:

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### 3. AppModule Removed → `app.config.ts` + `app.routes.ts`

**Before:** `app.module.ts` declared all components, imported `BrowserModule`, `HttpClientModule`, `ReactiveFormsModule`, and `AppRoutingModule`.

**After:** `app.module.ts` deleted. Replaced by:

- **`app.config.ts`** — Provides application-wide services using functional APIs:
  ```typescript
  export const appConfig: ApplicationConfig = {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient()
    ]
  };
  ```

- **`app.routes.ts`** — Defines routes as a standalone `Routes` array:
  ```typescript
  export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'billing', component: BillingComponent },
    { path: 'account', component: AccountComponent }
  ];
  ```

### 4. AppComponent → Standalone

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {}
```

### 5. New Configuration Files

| File | Purpose |
|------|---------|
| `angular.json` | Workspace config using `@angular-devkit/build-angular:application` builder (replaces the older `browser` builder) |
| `tsconfig.json` | Updated to `target: ES2022`, `module: ES2022`, strict mode enabled |
| `tsconfig.app.json` | App-specific TS config extending the base |
| `src/index.html` | HTML entry point for the SPA |

### 6. Provider Function Migration

| Before (NgModule imports) | After (Functional providers) |
|---------------------------|------------------------------|
| `HttpClientModule` | `provideHttpClient()` |
| `RouterModule.forRoot(routes)` | `provideRouter(routes)` |
| N/A | `provideZoneChangeDetection({ eventCoalescing: true })` |

---

## Dashboard Module

**Files:** `src/app/dashboard/dashboard.component.ts`, `src/app/dashboard/dashboard.component.html`

### Changes

#### 1. Standalone Component Migration + Observable → Imperative Subscription
```typescript
// Before (Angular 14)
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  plans$: Observable<UserPlan[]>;
  // ...
  ngOnInit(): void {
    this.plans$ = this.http.get<UserPlan[]>('/api/plans').pipe(
      tap(() => this.isLoading = false),
      map(plans => plans.filter(p => p.expiry !== 'expired')),
      catchError(err => { throw err; })
    );
  }
}

// After (Angular 18)
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  plans: UserPlan[] = [];
  private destroy$ = new Subject<void>();
  // ...
  ngOnInit(): void {
    this.http.get<UserPlan[]>('/api/plans').pipe(
      map(plans => plans.filter(p => p.expiry !== 'expired')),
      catchError(err => { this.hasError = true; this.isLoading = false; return of([]); }),
      takeUntil(this.destroy$)
    ).subscribe(plans => {
      this.plans = plans;
      this.isLoading = false;
    });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
```

**Why imperative subscription?** The original used `plans$ | async` in the template inside an `@if (!isLoading)` block, creating a deadlock: the `async` pipe never subscribes because the block isn't rendered while `isLoading` is `true`, but `isLoading` only becomes `false` when the subscription emits. Switching to imperative subscription with a plain `plans: UserPlan[]` array decouples the data fetch from template rendering.

#### 2. Proper Observable Error Handling
```typescript
// Before
catchError(err => { throw err; })

// After
catchError(err => {
  this.hasError = true;
  this.isLoading = false;
  return of([]);
})
```

#### 3. Template: `*ngIf` → `@if`
```html
<!-- Before -->
<div *ngIf="isLoading" class="loading-spinner">
  Loading your plans...
</div>

<!-- After -->
@if (isLoading) {
  <div class="loading-spinner">
    Loading your plans...
  </div>
}
```

#### 4. Template: `*ngFor` → `@for` with mandatory `track`
```html
<!-- Before -->
<div *ngFor="let plan of (plans$ | async); trackBy: trackByPlan"
     class="plan-card">

<!-- After -->
@for (plan of plans; track plan.name) {
  <div class="plan-card">
    ...
  </div>
}
```

**Note:** `@for` requires an inline `track` expression (not a `trackBy` function reference). The old `trackByPlan` method and `AsyncPipe` import were removed.

---

## Billing Module

**Files:** `src/app/billing/billing.component.ts`, `src/app/billing/billing.component.html` (new)

### Changes

#### 1. Standalone Component Migration
```typescript
// Before
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit { ... }

// After
@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit, OnDestroy { ... }
```

#### 2. Explicit Pipe Imports
`CurrencyPipe` and `DatePipe` from `@angular/common` are now imported directly into the component (previously inherited via `CommonModule` in the NgModule).

#### 3. OnDestroy Interface Declaration
```typescript
// Before — ngOnDestroy was defined but OnDestroy wasn't in the implements clause
export class BillingComponent implements OnInit { ... }

// After
export class BillingComponent implements OnInit, OnDestroy { ... }
```

#### 4. Unused Import Cleanup
Removed unused `switchMap` from `rxjs/operators` import.

#### 5. New Template with `@if` / `@for`
Created `billing.component.html` using Angular 18 control flow:
```html
@if (invoices.length === 0) {
  <p>No invoices found.</p>
} @else {
  <div class="invoices-list">
    @for (invoice of invoices; track invoice.id) {
      <div class="invoice-card">
        <p>Invoice #{{ invoice.id }}</p>
        <p>Amount: {{ invoice.amount | currency }}</p>
        <p>Due: {{ invoice.dueDate | date }}</p>
        <p>Status: {{ invoice.status }}</p>
      </div>
    }
  </div>
}
```

---

## Account Module

**Files:** `src/app/account/account.component.ts`, `src/app/account/account.component.html` (new)

### Changes

#### 1. Standalone Component Migration
```typescript
// Before
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit { ... }

// After
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit { ... }
```

#### 2. ReactiveFormsModule Direct Import
Standalone components must import `ReactiveFormsModule` directly to use reactive form directives (`formGroup`, `formControlName`, etc.). Previously this was provided by the NgModule.

#### 3. Strict Property Initialization
```typescript
// Before
accountForm: FormGroup;

// After
accountForm!: FormGroup;
```
The definite assignment assertion (`!`) tells TypeScript the property will be initialized in `ngOnInit`.

#### 4. New Template with `@if` for Validation
Created `account.component.html` using Angular 18 control flow for form validation errors:
```html
@if (accountForm.get('email')?.invalid && accountForm.get('email')?.touched) {
  <span class="error">Valid email is required.</span>
}
```

---

## Summary of Breaking Changes

| # | Breaking Change | Angular Version | Affected Modules |
|---|----------------|-----------------|------------------|
| 1 | NgModule → Standalone components | 15+ | All |
| 2 | `bootstrapModule()` → `bootstrapApplication()` | 15+ | Root |
| 3 | `HttpClientModule` → `provideHttpClient()` | 15+ | Root |
| 4 | `RouterModule.forRoot()` → `provideRouter()` | 15+ | Root |
| 5 | Explicit pipe/directive imports in standalone components | 15+ | Dashboard, Billing, Account |
| 6 | `*ngIf` → `@if` control flow syntax | 17+ | Dashboard, Billing, Account |
| 7 | `*ngFor` → `@for` with mandatory `track` expression | 17+ | Dashboard, Billing |
| 8 | `trackBy` function → inline `track` expression | 17+ | Dashboard |
| 9 | Strict property initialization (`strictPropertyInitialization`) | 14+ (strict) | Dashboard, Account |
| 10 | RxJS 6.x → 7.x | 15+ | All |
| 11 | TypeScript 4.7 → 5.4 | 18 | All |
| 12 | zone.js 0.11.x → 0.14.x | 18 | Root |
| 13 | `@angular-devkit/build-angular:browser` → `application` builder | 17+ | Root (angular.json) |
