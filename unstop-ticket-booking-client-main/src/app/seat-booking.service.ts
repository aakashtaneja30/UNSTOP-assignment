import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seat } from './models/seat';

@Injectable({
  providedIn: 'root'
})
export class SeatBookingService {
  private apiUrl = 'https://unstop-ticket-booking-server.onrender.com'; // Replace with your actual backend API URL

  constructor(private http: HttpClient) { }

  getSeats(): Observable<Seat[]> {
    return this.http.get<Seat[]>(this.apiUrl + '/seats');
  }

  bookSeats(seatCount: number): Observable<Seat[]> {
    return this.http.post<Seat[]>(this.apiUrl + '/seats/book', { seatCount });
  }

  resetSeats(): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/seats/reset', {});
  }
}
