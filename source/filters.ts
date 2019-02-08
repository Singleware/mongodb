/**
 * Copyright (C) 2018 Silas B. Domingos
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
   * Gets the corresponding column schema from the specified model type and column name.
   * @param model Model type.
   * @param name Column name.
   * @returns Returns the column schema.
   * @throws Throws an exception when te specified column does not exists.
   */
  @Class.Private()
  private static getSchema(model: Mapping.Types.Model, name: string): Mapping.Columns.Real {
    const schema = Mapping.Schema.getRealColumn(model, name);
    if (!schema) {
      throw new Error(`The column '${name}' does not exists.`);
    }
    return schema;
  }

  /**
   * Check whether the specified value type can be converted to another one.
   * @param value Value to be converted.
   * @param schema Real column schema.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static castValue<T>(value: T, schema: Mapping.Columns.Real): T | typeof BSON.ObjectID {
    if (schema.formats.includes(Mapping.Types.Format.ARRAY) && value instanceof Array && schema.model === BSON.ObjectID) {
      for (let i = 0; i < value.length; ++i) {
        if (BSON.ObjectID.isValid(value[i])) {
          value[i] = new BSON.ObjectID(value[i]);
        }
      }
    } else if (schema.formats.includes(Mapping.Types.Format.ID) && (typeof value === 'string' || typeof value === 'number')) {
      if (BSON.ObjectID.isValid(<any>value)) {
        value = <any>new BSON.ObjectID(<any>value);
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
      const operation = filter[name];
      const schema = Filters.getSchema(model, name);
      const column = schema.alias || schema.name;
      const value = Filters.castValue(operation.value, schema);
      switch (operation.operator) {
        case Mapping.Statements.Operator.REGEX:
          entity[column] = { $regex: value };
          break;
        case Mapping.Statements.Operator.LESS:
          entity[column] = { $lt: value };
          break;
        case Mapping.Statements.Operator.LESS_OR_EQUAL:
          entity[column] = { $lte: value };
          break;
        case Mapping.Statements.Operator.EQUAL:
          entity[column] = { $eq: value };
          break;
        case Mapping.Statements.Operator.NOT_EQUAL:
          entity[column] = { $neq: value };
          break;
        case Mapping.Statements.Operator.GREATER_OR_EQUAL:
          entity[column] = { $gte: value };
          break;
        case Mapping.Statements.Operator.GREATER:
          entity[column] = { $gt: value };
          break;
        case Mapping.Statements.Operator.BETWEEN:
          entity[column] = { $gte: value[0], $lte: value[1] };
          break;
        case Mapping.Statements.Operator.CONTAIN:
          entity[column] = { $in: [...value] };
          break;
        case Mapping.Statements.Operator.NOT_CONTAIN:
          entity[column] = { $nin: [...value] };
          break;
      }
    }
    return entity;
  }
}
