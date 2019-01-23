/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as BSON from './bson';

/**
 * Mongo DB filters class.
 */
@Class.Describe()
export class Filters extends Class.Null {
  /**
   * Build a filter entity from the specified filter expression.
   * @param model Model type.
   * @param filter Filter expression.
   * @returns Returns the generated filter entity.
   * @throws Throws an error when there is a nonexistent column in the specified filter.
   */
  @Class.Public()
  public static build(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Mapping.Types.Entity {
    const entity = <Mapping.Types.Entity>{};
    for (const name in filter) {
      const operation = filter[name];
      const schema = Mapping.Schema.getRealColumn(model, name);
      if (!schema) {
        throw new Error(`The column '${name}' does not exists.`);
      }
      if (schema.formats.includes(Mapping.Types.Format.ID) && BSON.ObjectID.isValid(operation.value)) {
        operation.value = new BSON.ObjectID(operation.value);
      }
      const column = schema.alias || schema.name;
      switch (operation.operator) {
        case Mapping.Statements.Operator.REGEX:
          entity[column] = { $regex: operation.value };
          break;
        case Mapping.Statements.Operator.LESS:
          entity[column] = { $lt: operation.value };
          break;
        case Mapping.Statements.Operator.LESS_OR_EQUAL:
          entity[column] = { $lte: operation.value };
          break;
        case Mapping.Statements.Operator.EQUAL:
          entity[column] = { $eq: operation.value };
          break;
        case Mapping.Statements.Operator.NOT_EQUAL:
          entity[column] = { $neq: operation.value };
          break;
        case Mapping.Statements.Operator.GREATER_OR_EQUAL:
          entity[column] = { $gte: operation.value };
          break;
        case Mapping.Statements.Operator.GREATER:
          entity[column] = { $gt: operation.value };
          break;
        case Mapping.Statements.Operator.BETWEEN:
          entity[column] = { $gte: operation.value[0], $lte: operation.value[1] };
          break;
        case Mapping.Statements.Operator.CONTAIN:
          entity[column] = { $in: [...operation.value] };
          break;
        case Mapping.Statements.Operator.NOT_CONTAIN:
          entity[column] = { $nin: [...operation.value] };
          break;
      }
    }
    return entity;
  }
}
