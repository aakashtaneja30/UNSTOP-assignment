import { Component, OnInit } from '@angular/core';
import { SeatBookingService } from '../seat-booking.service';
import { Seat } from '../models/seat';

@Component({
  selector: 'app-seat-booking',
  templateUrl: './seat-booking.component.html',
  styleUrls: ['./seat-booking.component.css'],
})
export class SeatBookingComponent implements OnInit {
  seats: Seat[] = [];
  maxRowNum: number = 0;
  maxColumnNum: number = 0;
  numSeatsToBook: number = 1;
  showSeats: boolean = false;
  rowTwoDimensionalArray: Seat | null[][];

  constructor(private seatBookingService: SeatBookingService) {}

  ngOnInit(): void {
    this.getSeatsFromBackend();
  }

  getSeatsFromBackend(): void {
    this.seatBookingService.getSeats().subscribe((seats) => {
      this.seats = seats;
      this.calculateMaxRowAndColumn();
    });
  }

  calculateMaxRowAndColumn(): void {
    this.seats.forEach((seat) => {
      this.maxRowNum = Math.max(this.maxRowNum, seat.rowNum);
      this.maxColumnNum = Math.max(this.maxColumnNum, seat.columnNum);
    });

    this.rowTwoDimensionalArray = new Array(this.maxRowNum + 1)
      .fill(null)
      .map(() => new Array(this.maxColumnNum + 1).fill(null));

    this.seats.forEach((seat) => {
      const { rowNum, columnNum } = seat;
      this.rowTwoDimensionalArray[rowNum][columnNum] = seat;
    });
    this.showSeats = true;
  }

  onBookSeats(): void {
    if (!(this.numSeatsToBook > 0 && this.numSeatsToBook <= 7)) {
      alert('Invalid seats entered ');
      return;
    }
    this.seatBookingService
      .bookSeats(this.numSeatsToBook)
      .subscribe((bookedSeats) => {
        this.updateBookedSeats(bookedSeats);
      });
  }

  updateBookedSeats(bookedSeats: Seat[]): void {
    bookedSeats.forEach((bookedSeat) => {
      this.rowTwoDimensionalArray[bookedSeat?.rowNum][
        bookedSeat?.columnNum
      ].booked = true;
    });
  }

  clearAllBooking() {
    this.seatBookingService.resetSeats().subscribe();
    this.getSeatsFromBackend();
  }
}
