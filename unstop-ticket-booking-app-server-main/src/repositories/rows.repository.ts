import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SqlDataSource} from '../datasources';
import {Rows, RowsRelations} from '../models';

export class RowsRepository extends DefaultCrudRepository<
  Rows,
  typeof Rows.prototype.rowNum,
  RowsRelations
> {
  constructor(
    @inject('datasources.sql') dataSource: SqlDataSource,
  ) {
    super(Rows, dataSource);
  }
}
