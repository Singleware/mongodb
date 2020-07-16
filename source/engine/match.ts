/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as Types from '../types';
import * as BSON from './bson';

/**
 * Match helper class.
 */
@Class.Describe()
export class Match extends Class.Null {
  /**
   * Try to convert the specified input value to a filterable.
   * @param value Input value.
   * @param schema Column schema.
   * @returns Returns the converted value or the specified input value.
   */
  @Class.Private()
  private static castValue<T extends string | number>(value: T, schema: Types.Columns.Real): T | BSON.ObjectId | Date {
    if (schema.model === BSON.ObjectId || schema.formats.includes(Types.Format.Id)) {
      return BSON.ObjectId.isValid(value) ? new BSON.ObjectId(value) : value;
    } else if (schema.model === Date || schema.formats.includes(Types.Format.Date)) {
      return !isNaN(Date.parse(<string>value)) ? new Date(Date.parse(<string>value)) : value;
    }
    return value;
  }

  /**
   * Try to convert the specified input array to a filterable array.
   * @param input Input array.
   * @param schema Column schema.
   * @returns Returns the array containing all converted and not converted values.
   * @throws Throws an type error when the specified value isn't an array.
   */
  @Class.Private()
  private static castArray<T extends string | number>(input: T[], schema: Types.Columns.Real): (T | BSON.ObjectId | Date)[] {
    if (!(input instanceof Array)) {
      throw new TypeError(`The filter input must be an array.`);
    } else {
      return input.map((value) => this.castValue(value, schema));
    }
  }

  /**
   * Attach a new operation in the given operations map.
   * @param schemas Column schemas.
   * @param operations Operations map.
   * @param operator Operator type.
   * @param value Operation value.
   */
  @Class.Private()
  private static attachOperation(schemas: Types.Columns.Any[], operations: Types.Entity, operator: Types.Operator, value: any): void {
    const path = Types.Columns.Helper.getPath(schemas);
    const schema = schemas[schemas.length - 1];
    switch (operator) {
      case Types.Operator.LessThan:
        operations[path] = { $lt: this.castValue(value, schema) };
        break;
      case Types.Operator.LessThanOrEqual:
        operations[path] = { $lte: this.castValue(value, schema) };
        break;
      case Types.Operator.Equal:
        operations[path] = { $eq: this.castValue(value, schema) };
        break;
      case Types.Operator.NotEqual:
        operations[path] = { $ne: this.castValue(value, schema) };
        break;
      case Types.Operator.GreaterThanOrEqual:
        operations[path] = { $gte: this.castValue(value, schema) };
        break;
      case Types.Operator.GreaterThan:
        operations[path] = { $gt: this.castValue(value, schema) };
        break;
      case Types.Operator.Contain:
        operations[path] = { $in: this.castArray(value, schema) };
        break;
      case Types.Operator.NotContain:
        operations[path] = { $nin: this.castArray(value, schema) };
        break;
      case Types.Operator.RegExp:
        operations[path] = { $regex: this.castValue(value, schema) };
        break;
      case Types.Operator.Between:
        operations[path] = {
          $gte: this.castValue(value[0], schema),
          $lte: this.castValue(value[1], schema)
        };
        break;
      default:
        throw new Error(`Invalid operator '${operator}' for the given path '${path}'.`);
    }
  }

  /**
   * Build a new matching operation based the specified match expression.
   * @param model Model type.
   * @param match Match expression.
   * @returns Returns the new matching operation.
   */
  @Class.Private()
  private static buildExpression(model: Types.Model, match: Types.Match): Types.Entity {
    const entity = <Types.Entity>{};
    for (const column in match) {
      const schemas = Mapping.Helper.getPathColumns(model, column);
      const operation = match[column];
      if (Mapping.Filters.Helper.isOperation(operation)) {
        this.attachOperation(schemas, entity, operation.operator, operation.value);
      } else {
        const entry = Object.entries(operation)[0];
        this.attachOperation(schemas, entity, <Types.Operator>entry[0], entry[1]);
      }
    }
    return entity;
  }

  /**
   * Build a new matching entity based on the specified matching expressions.
   * @param model Model type.
   * @param match Matching expressions.
   * @returns Returns the new matching entity.
   */
  @Class.Public()
  public static build(model: Types.Model, match: Types.Match | Types.Match[]): Types.Entity {
    if (match instanceof Array) {
      return { $or: match.map((match) => this.buildExpression(model, match)) };
    }
    return this.buildExpression(model, match);
  }
}
