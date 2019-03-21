/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as BSON from './bson';

/**
 * Filters helper class.
 */
@Class.Describe()
export class Filters extends Class.Null {
  /**
   * Converts the specified input array to an array of ObjectID when possible.
   * @param input Input array.
   * @param schema Real column schema.
   * @returns Returns the original array or the converted array.
   */
  @Class.Private()
  private static castArray<T extends string | number>(input: T[], schema: Mapping.Columns.Real): T[] | BSON.ObjectID[] {
    if (!schema.formats.includes(Mapping.Types.Format.ARRAY) || schema.model !== BSON.ObjectID) {
      return input;
    }
    const list = [];
    for (const value of input) {
      if (BSON.ObjectID.isValid(value)) {
        list.push(new BSON.ObjectID(value));
      }
    }
    return list;
  }

  /**
   * Converts the specified input value to an ObjectID when possible.
   * @param value Input value.
   * @param schema Real column schema.
   * @returns Returns the original value or the converted value.
   */
  @Class.Private()
  private static castValue<T>(value: T, schema: Mapping.Columns.Real): T | BSON.ObjectID {
    if (schema.formats.includes(Mapping.Types.Format.ID) && (typeof value === 'string' || typeof value === 'number')) {
      if (BSON.ObjectID.isValid(value)) {
        return new BSON.ObjectID(value);
      }
    }
    return value;
  }

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
      const schema = Mapping.Schema.getRealColumn(model, name);
      const column = schema.alias || schema.name;
      const operation = filter[name];
      switch (operation.operator) {
        case Mapping.Statements.Operator.REGEX:
          entity[column] = { $regex: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.LESS:
          entity[column] = { $lt: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.LESS_OR_EQUAL:
          entity[column] = { $lte: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.EQUAL:
          entity[column] = { $eq: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.NOT_EQUAL:
          entity[column] = { $neq: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.GREATER_OR_EQUAL:
          entity[column] = { $gte: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.GREATER:
          entity[column] = { $gt: Filters.castValue(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.BETWEEN:
          entity[column] = { $gte: Filters.castValue(operation.value[0], schema), $lte: Filters.castValue(operation.value[1], schema) };
          break;
        case Mapping.Statements.Operator.CONTAIN:
          entity[column] = { $in: Filters.castArray(operation.value, schema) };
          break;
        case Mapping.Statements.Operator.NOT_CONTAIN:
          entity[column] = { $nin: Filters.castArray(operation.value, schema) };
          break;
      }
    }
    return entity;
  }
}
