/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Source from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

/**
 * Mongo DB filters class.
 */
@Class.Describe()
export class Filters {
  /**
   * Build a filter entity from the specified filter expression.
   * @param model Model type.
   * @param filter Filter expression.
   * @returns Returns the generated filter entity.
   */
  @Class.Public()
  public static build(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression): Mapping.Entity {
    const entity = <Mapping.Entity>{};
    for (const column in filter) {
      const schema = Mapping.Schema.getColumn(model, column);
      const operation = filter[column];
      if (schema && schema.types.indexOf(Mapping.Format.ID) !== -1 && Source.ObjectId.isValid(operation.value)) {
        operation.value = new Source.ObjectId(operation.value);
      }
      switch (operation.operator) {
        case Mapping.Operator.LESS:
          entity[column] = { $lt: operation.value };
          break;
        case Mapping.Operator.LESS_OR_EQUAL:
          entity[column] = { $lte: operation.value };
          break;
        case Mapping.Operator.EQUAL:
          entity[column] = { $eq: operation.value };
          break;
        case Mapping.Operator.NOT_EQUAL:
          entity[column] = { $neq: operation.value };
          break;
        case Mapping.Operator.GREATER_OR_EQUAL:
          entity[column] = { $gte: operation.value };
          break;
        case Mapping.Operator.GREATER:
          entity[column] = { $gt: operation.value };
          break;
        case Mapping.Operator.BETWEEN:
          entity[column] = { $gte: operation.value[0], $lte: operation.value[1] };
          break;
        case Mapping.Operator.CONTAIN:
          entity[column] = { $in: [...operation.value] };
          break;
        case Mapping.Operator.NOT_CONTAIN:
          entity[column] = { $nin: [...operation.value] };
          break;
      }
    }
    return entity;
  }
}
