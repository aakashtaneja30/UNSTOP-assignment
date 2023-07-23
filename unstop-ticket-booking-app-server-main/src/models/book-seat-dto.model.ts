import {Model, model, property} from '@loopback/repository';

@model()
export class BookSeatDto extends Model {
  @property({
    type: 'number',
  })
  seatCount: number;


  constructor(data?: Partial<BookSeatDto>) {
    super(data);
  }
}

export interface BookSeatDtoRelations {
  // describe navigational properties here
}

export type BookSeatDtoWithRelations = BookSeatDto & BookSeatDtoRelations;
