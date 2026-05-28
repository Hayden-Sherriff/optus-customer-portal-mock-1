import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  accountForm: FormGroup;
  errorMessage = '';
  isLoading = false;


  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {}


  ngOnInit(): void {
    this.accountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

    this.loadAccount();
  }


  loadAccount(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.http.get<{ email: string; phone: string }>('/api/account').subscribe({
      next: (account) => {
        this.accountForm.patchValue(account);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your account details. Please try again.';
        this.isLoading = false;
      }
    });
  }


  onSubmit(): void {
    if (this.accountForm.valid) {
      this.errorMessage = '';
      this.http.put('/api/account', this.accountForm.value).subscribe({
        error: () => {
          this.errorMessage = 'Unable to save your account changes. Please try again.';
        }
      });
    }
  }
}
