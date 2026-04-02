import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


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
  templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit, OnDestroy {
  invoices: Invoice[] = [];
  private destroy$ = new Subject<void>();


  constructor(private http: HttpClient) {}


  ngOnInit(): void {
    this.http.get<Invoice[]>('/api/invoices').pipe(
      map(invoices => invoices.sort((a, b) =>
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )),
      takeUntil(this.destroy$)
    ).subscribe(invoices => {
      this.invoices = invoices;
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
