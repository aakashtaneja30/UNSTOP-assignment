import {
  Count,
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  patch
} from '@loopback/rest';
import {BookSeatDto, Seats} from '../models';
import {SeatsRepository} from '../repositories';
import { service } from '@loopback/core';
import { SeatBookService } from '../services';

export class SeatController {
  constructor(
    @repository(SeatsRepository)
    public seatsRepository : SeatsRepository,
    @service(SeatBookService)
    public seatBookService: SeatBookService
  ) {}

  @post('/seats/book')
  @response(200, {
    description: 'Seats model instance',
    content: {'application/json': {schema: getModelSchemaRef(Seats)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BookSeatDto, {
            title: 'BookSeat',
          }),
        },
      },
    })
    seats: BookSeatDto,
  ): Promise<Seats[]> {
    return this.seatBookService.bookSeats(seats.seatCount);
  }

  @get('/seats')
  @response(200, {
    description: 'Array of Seats model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Seats, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Seats) filter?: Filter<Seats>,
  ): Promise<Seats[]> {
    return this.seatsRepository.find(filter);
  }

  @post('/seats/reset')
  @response(200, {
    description: 'Array of Seats model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Seats, {includeRelations: true}),
        },
      },
    },
  })
  async reset(
  ): Promise<Count> {
    return this.seatsRepository.updateAll({booked:false});
  }

}







