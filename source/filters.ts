/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

/**
 * Mongo DB filters class.
 */
@Class.Describe()
export class Filters {
  /**
   * Build a filter entity from the specified filter expression.
   * @param filter Filter expression.
   * @returns Returns the generated filter entity.
   */
  @Class.Public()
  public static build(filter: Mapping.Expression): Mapping.Entity {
    const entity = <Mapping.Entity>{};
    for (const column in filter) {
      const operation = filter[column];
      switch (operation.operator) {
        case Mapping.Operators.LESS:
          entity[column] = { $lt: operation.value };
          break;
        case Mapping.Operators.LESS_OR_EQUAL:
          entity[column] = { $lte: operation.value };
          break;
        case Mapping.Operators.EQUAL:
          entity[column] = { $eq: operation.value };
          break;
        case Mapping.Operators.NOT_EQUAL:
          entity[column] = { $neq: operation.value };
          break;
        case Mapping.Operators.GREATER_OR_EQUAL:
          entity[column] = { $gte: operation.value };
          break;
        case Mapping.Operators.GREATER:
          entity[column] = { $gt: operation.value };
          break;
        case Mapping.Operators.BETWEEN:
          entity[column] = { $gte: operation.value[0], $lte: operation.value[1] };
          break;
        case Mapping.Operators.CONTAIN:
          entity[column] = { $in: [...operation.value] };
          break;
        case Mapping.Operators.NOT_CONTAIN:
          entity[column] = { $nin: [...operation.value] };
          break;
      }
    }
    return entity;
  }
}
