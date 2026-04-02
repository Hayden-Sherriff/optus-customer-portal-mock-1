import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';


export interface UserPlan {
  name: string;
  data: string;
  calls: string;
  expiry: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  plans: UserPlan[] = [];
  isLoading = true;
  hasError = false;
  userName = '';
  private destroy$ = new Subject<void>();


  constructor(private http: HttpClient) {}


  ngOnInit(): void {
    this.http.get<UserPlan[]>('/api/plans').pipe(
      map(plans => plans.filter(p => p.expiry !== 'expired')),
      catchError(err => {
        this.hasError = true;
        this.isLoading = false;
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe(plans => {
      this.plans = plans;
      this.isLoading = false;
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
