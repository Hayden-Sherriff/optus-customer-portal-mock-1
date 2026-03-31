import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface UserPlan {
  name: string;
  data: string;
  calls: string;
  expiry: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  plans: UserPlan[] = [];
  isLoading = true;
  hasError = false;

  ngOnInit(): void {
    this.http.get<UserPlan[]>('/api/plans').pipe(
      map(plans => plans.filter(p => p.expiry !== 'expired')),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: plans => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
}
