import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


export interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}


@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit {
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
