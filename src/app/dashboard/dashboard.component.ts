import { Component, DestroyRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';


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
export class DashboardComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  plans: UserPlan[] = [];
  isLoading = true;
  hasError = false;

  constructor() {
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
