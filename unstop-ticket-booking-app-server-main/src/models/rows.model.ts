import {Entity, model, property} from '@loopback/repository';

@model({name:'v_row'})
export class Rows extends Entity {

  @property({
    type: 'number',
    id:true,
    name:'row_num'
  })
  rowNum: number;

  @property({
    type: 'number',
    name:'vacant_seats'
  })
  vacantSeats: number;


  constructor(data?: Partial<Rows>) {
    super(data);
  }
}

export interface RowsRelations {
  // describe navigational properties here
}

export type RowsWithRelations = Rows & RowsRelations;
