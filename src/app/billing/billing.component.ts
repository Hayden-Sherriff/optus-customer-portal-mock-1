import { Component, DestroyRef, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './billing.component.html',
})
export class BillingComponent {
  invoices: Invoice[] = [];

  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.http.get<Invoice[]>('/api/invoices').pipe(
      map(invoices => invoices.sort((a, b) =>
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(invoices => {
      this.invoices = invoices;
    });
  }
}
