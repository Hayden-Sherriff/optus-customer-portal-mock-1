import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';


export interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}


@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <h2>Billing</h2>
    @if (invoices.length > 0) {
      <ul>
        @for (invoice of invoices; track invoice.id) {
          <li>
            {{ invoice.dueDate | date:'mediumDate' }} —
            {{ invoice.amount | currency }}
            <span class="status" [attr.data-status]="invoice.status">
              ({{ invoice.status }})
            </span>
          </li>
        }
      </ul>
    } @else {
      <p>No invoices found.</p>
    }
  `,
})
export class BillingComponent implements OnInit {
  invoices: Invoice[] = [];

  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);


  ngOnInit(): void {
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
