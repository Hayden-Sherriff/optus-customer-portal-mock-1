import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  private http = inject(HttpClient);
  private fb = inject(NonNullableFormBuilder);

  accountForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.http.put('/api/account', this.accountForm.getRawValue()).subscribe();
    }
  }
}
