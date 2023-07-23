import {Entity, model, property} from '@loopback/repository';

@model({name:'seat'})
export class Seats extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property({
    type: 'number',
    required: true,
    name:'row_num'
    
  })
  rowNum: number;

  @property({
    type: 'number',
    required: true,
    name:'col_num'
  })
  columnNum: number;

  @property({
    type: 'boolean',
    required: true,
    name:'booked'
  })
  booked: boolean;


  constructor(data?: Partial<Seats>) {
    super(data);
  }
}

export interface SeatsRelations {
  // describe navigational properties here
}

export type SeatsWithRelations = Seats & SeatsRelations;
