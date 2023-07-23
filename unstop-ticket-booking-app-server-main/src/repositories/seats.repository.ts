import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqlDataSource} from '../datasources';
import {Seats, SeatsRelations} from '../models';

export class SeatsRepository extends DefaultCrudRepository<
  Seats,
  typeof Seats.prototype.id,
  SeatsRelations
> {
  constructor(
    @inject('datasources.sql') dataSource: SqlDataSource,
  ) {
    super(Seats, dataSource);
  }
}
