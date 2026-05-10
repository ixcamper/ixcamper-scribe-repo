import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      console.error('Scribe API Error:', error.status, error.message);
      // You could trigger a toast notification here
      return throwError(() => error);
    }),
  );
};
