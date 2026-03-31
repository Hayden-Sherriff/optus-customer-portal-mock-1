import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';


export interface UserPlan {
  name: string;
  data: string;
  calls: string;
  expiry: string;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  plans$: Observable<UserPlan[]>;
  isLoading = true;
  hasError = false;
  userName = '';


  constructor(private http: HttpClient) {}


  ngOnInit(): void {
    this.plans$ = this.http.get<UserPlan[]>('/api/plans').pipe(
      tap(() => this.isLoading = false),
      map(plans => plans.filter(p => p.expiry !== 'expired')),
      catchError(err => {
        this.hasError = true;
        this.isLoading = false;
        throw err;
      })
    );
  }
}
