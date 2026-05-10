import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard';

@Component({
  standalone: true,
  imports: [DashboardComponent],
  selector: 'app-root',
  template: `<app-dashboard />`,
})
export class App {}
