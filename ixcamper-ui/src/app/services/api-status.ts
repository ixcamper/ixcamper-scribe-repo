import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiStatus {
  private http = inject(HttpClient);

  getStatus() {
    return this.http.get('http://localhost:8080/api/status');
  }
}
