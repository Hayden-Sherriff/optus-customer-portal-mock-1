import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" />
      @if (accountForm.controls.email.touched && accountForm.controls.email.invalid) {
        <div class="error">A valid email is required.</div>
      }

      <label for="phone">Phone</label>
      <input id="phone" type="tel" formControlName="phone" />
      @if (accountForm.controls.phone.touched && accountForm.controls.phone.invalid) {
        <div class="error">Phone is required.</div>
      }

      <button type="submit" [disabled]="accountForm.invalid">Save</button>
    </form>
  `,
})
export class AccountComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  accountForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.http.put('/api/account', this.accountForm.value).subscribe();
    }
  }
}
