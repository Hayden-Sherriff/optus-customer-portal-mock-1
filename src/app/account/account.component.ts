import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  accountForm!: FormGroup;


  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {}


  ngOnInit(): void {
    this.accountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }


  onSubmit(): void {
    if (this.accountForm.valid) {
      this.http.put('/api/account', this.accountForm.value).subscribe();
    }
  }
}
