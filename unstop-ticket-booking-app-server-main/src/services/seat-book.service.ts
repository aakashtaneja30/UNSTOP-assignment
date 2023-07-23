import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {RowsRepository, SeatsRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Seats} from '../models';

const MAX_SEATS_TO_BOOK = 7;

@injectable({scope: BindingScope.TRANSIENT})
export class SeatBookService {
  constructor(
    @repository(SeatsRepository)
    public seatsRepository: SeatsRepository,
    @repository(RowsRepository)
    public rowRepository: RowsRepository,
  ) {}

  /**
   * The function `bookSeats` books a specified number of seats, throwing an error if the number of
   * seats is invalid or not available.
   * @param {number} numberOfSeats - The `numberOfSeats` parameter is the number of seats that the user
   * wants to book.
   * @returns a Promise.
   */
  async bookSeats(numberOfSeats: number) {
    if (numberOfSeats > MAX_SEATS_TO_BOOK) {
      throw new HttpErrors.BadRequest('maximum 7 seats allowed');
    }
    if (numberOfSeats <= 0) {
      throw new HttpErrors.BadRequest('minimum 1 seat required');
    }
    const totalAvailableSeat = (await this.getTotalVacantSeats()).count;

    if (numberOfSeats > totalAvailableSeat) {
      throw new HttpErrors.BadRequest('Seats Not Available');
    }

    if (numberOfSeats == totalAvailableSeat) {

      return this.bookAllRemainingSeats();
    }

    return await this.bookNumberOfSeats(numberOfSeats);
  }

  /**
   * The function returns the total number of vacant seats by counting the seats with the "booked"
   * property set to false.
   * @returns The `getTotalVacantSeats` function is returning the total count of vacant seats from the
   * `seatsRepository` where the `booked` property is set to `false`.
   */
  private async getTotalVacantSeats() {
    return await this.seatsRepository.count({booked: false});
  }

  /**
   * The function books all remaining vacant seats by updating their "booked" status to true.
   * @returns an array of vacant seats that have been successfully booked.
   */
  private async bookAllRemainingSeats() {
    const vacantSeats = await this.seatsRepository.find({
      where: {booked: false},
    });
    await this.seatsRepository.updateAll({booked: true}, {booked: false});

    vacantSeats.forEach(seat => (seat.booked = true));
    return vacantSeats;
  }

  /**
   * The function books a specified number of seats in a row if available, otherwise it books the seats
   * in different rows.
   * @param {number} numSeat - The parameter `numSeat` represents the number of seats that need to be
   * booked.
   * @returns The function `bookNumberOfSeats` returns either the result of
   * `this.bookTicketsByRowNumber(row.rowNum, numSeat)` if a row with enough vacant seats is found, or
   * the result of `this.bookTicketsInDifferentRows(numSeat)` if no row with enough vacant seats is
   * found.
   */
  private async bookNumberOfSeats(numSeat: number) {
    const row = await this.rowRepository.findOne({
      where: {vacantSeats: {gte: numSeat}},
      order: ['vacantSeats ASC'],
    });

    if (row) {
      //row found
      //book tickets in this row
      return this.bookTicketsByRowNumber(row.rowNum, numSeat);
    } else {
      return this.bookTicketsInDifferentRows(numSeat);
    }
  }

  /**
   * The function books a specified number of tickets in different rows, prioritizing rows with the
   * minimum difference in vacant seats.
   * @param {number} numSeats - The parameter `numSeats` represents the number of seats that need to be
   * booked.
   * @returns The function `bookTicketsInDifferentRows` returns a Promise that resolves to an array of
   * `Seats` objects.
   */
  async bookTicketsInDifferentRows(numSeats: number) {
    const rows = await this.rowRepository.find({order: ['rowNum ASC']});

    const vacantSeatsArr = rows.map(row => row.vacantSeats);

    const rowsToBook =
      this.findSubsetIndexesWithMinDifference(vacantSeatsArr, numSeats) ?? [];

    let remainingSeats = numSeats;

    const promiseArr: Promise<Seats[]>[] = [];

    for (let i = 0; i < rowsToBook?.length; i++) {
      let numTicketToBookInCurrentRow = Math.min(
        remainingSeats,
        vacantSeatsArr[rowsToBook[i]],
      );
      promiseArr.push(
        this.bookTicketsByRowNumber(rowsToBook[i], numTicketToBookInCurrentRow),
      );
      remainingSeats -= numTicketToBookInCurrentRow;
    }

    const resolvedPromiseArr = await Promise.all(promiseArr);

    return resolvedPromiseArr.flat();
  }

  /**
   * The function books a specified number of seats in a specific row, updating their status to booked.
   * @param {number} row - The row number of the seats you want to book.
   * @param {number} numSeats - The parameter `numSeats` represents the number of seats to be booked in
   * a row.
   * @returns an array of seats that have been booked.
   */
  private async bookTicketsByRowNumber(row: number, numSeats: number) {
    if(numSeats==0){
      return [];
    }
    const seats = await this.seatsRepository.find({
      where: {booked: false, rowNum: row},
      order: ['columnNum ASC'],
      limit: numSeats,
    });

    const seatIds = seats.map(seat => seat.id);

    this.seatsRepository.updateAll({booked: true}, {id: {inq: seatIds}});

    seats.forEach(seat => (seat.booked = true));

    return seats;
  }
 
   /**
    * The function `findSubsetIndexesWithMinDifference` takes an array of numbers `arr` and a target
    * number `k`, and returns an array of indexes that represent a subset of `arr` with the minimum
    * difference between the sum of its elements and `k`.
    * @param {number[]} arr - An array of numbers.
    * @param {number} k - The parameter `k` represents the target sum that we want to find subsets with
    * minimum difference to.
    * @returns The function `findSubsetIndexesWithMinDifference` returns an array of numbers, which are
    * the indexes of the subset of `arr` that has the minimum difference between the sum of its
    * elements and `k`.
    */
   findSubsetIndexesWithMinDifference(arr: number[], k: number): number[] {

    let start = 0;
    let end = 0;
    let sum = 0;
    let minDiff = Infinity;
    let startIndex = 0;
    let endIndex = 0;
  
    while (end < arr.length) {
      sum += arr[end];
  
      while (sum >= k) {
        const diff = end - start;
  
        if (diff < minDiff) {
          minDiff = diff;
          startIndex = start;
          endIndex = end;
        }
  
        sum -= arr[start];
        start++;
      }
  
      end++;
    }

    const answer=[];

    for(let i=startIndex;i<=endIndex;i++){
      if(arr[i]!=0){
        answer.push(i);
      }
    }
    return answer;

  }
}
