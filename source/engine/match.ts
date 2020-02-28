/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from '../types';
import * as BSON from './bson';

/**
 * Match helper class.
 */
@Class.Describe()
export class Match extends Class.Null {
  /**
   * Try to convert the specified input array to an ObjectID array.
   * @param input Input array.
   * @param schema Column schema.
   * @returns Returns the array containing all converted and not converted values
   * @throws Throws an type error when the specified value isn't an array.
   */
  @Class.Private()
  private static castArray<T extends string | number>(input: T[], schema: Types.Columns.Real): (T | BSON.ObjectId | Date)[] {
    if (!(input instanceof Array)) {
      throw new TypeError(`The filter input must be an array.`);
    } else {
      if (schema.model === BSON.ObjectId) {
        return input.map(value => {
          return BSON.ObjectId.isValid(value) ? new BSON.ObjectId(value) : value;
        });
      } else if (schema.model === Date) {
        return input.map(value => {
          const timestamp = Date.parse(<string>value);
          return !isNaN(timestamp) ? new Date(timestamp) : value;
        });
      }
      return input;
    }
  }

  /**
   * Try to convert the specified input value to an ObjectID.
   * @param value Input value.
   * @param schema Column schema.
   * @returns Returns the converted value when the operation was successful, otherwise returns the input value.
   */
  @Class.Private()
  private static castValue<T extends string | number>(value: T, schema: Types.Columns.Real): T | BSON.ObjectId | Date {
    if (schema.formats.includes(Types.Format.Id)) {
      if (BSON.ObjectId.isValid(value)) {
        return new BSON.ObjectId(<string>value);
      }
    } else if (schema.formats.includes(Types.Format.Date)) {
      const timestamp = Date.parse(<string>value);
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }
    return value;
  }

  /**
   * Build a new match entity from the specified match expression.
   * @param model Model type.
   * @param match Match expression.
   * @returns Returns the new match entity.
   */
  @Class.Private()
  private static buildMatch(model: Types.Model, match: Types.Match): Types.Entity {
    const entity = <Types.Entity>{};
    for (const name in match) {
      const schema = Types.Schema.getRealColumn(model, name);
      const column = schema.alias || schema.name;
      const operation = match[name];
      switch (operation.operator) {
        case Types.Operator.LessThan:
          entity[column] = {
            $lt: this.castValue(operation.value, schema)
          };
          break;
        case Types.Operator.LessThanOrEqual:
          entity[column] = {
            $lte: this.castValue(operation.value, schema)
          };
          break;
        case Types.Operator.Equal:
          entity[column] = {
            $eq: this.castValue(operation.value, schema)
          };
          break;
        case Types.Operator.NotEqual:
          entity[column] = {
            $ne: this.castValue(operation.value, schema)
          };
          break;
        case Types.Operator.GreaterThanOrEqual:
          entity[column] = {
            $gte: this.castValue(operation.value, schema)
          };
          break;
        case Types.Operator.GreaterThan:
          entity[column] = {
            $gt: this.castValue(operation.value, schema)
          };
          break;
        case Types.Operator.Between:
          entity[column] = {
            $gte: this.castValue(operation.value[0], schema),
            $lte: this.castValue(operation.value[1], schema)
          };
          break;
        case Types.Operator.Contain:
          entity[column] = {
            $in: this.castArray(operation.value, schema)
          };
          break;
        case Types.Operator.NotContain:
          entity[column] = {
            $nin: this.castArray(operation.value, schema)
          };
          break;
        case Types.Operator.RegExp:
          entity[column] = {
            $regex: this.castValue(operation.value, schema)
          };
          break;
      }
    }
    return entity;
  }

  /**
   * Build a new match entity from the specified match expression.
   * @param model Model type.
   * @param match Match expression.
   * @returns Returns a new match entity.
   */
  @Class.Public()
  public static build(model: Types.Model, match: Types.Match | Types.Match[]): Types.Entity {
    if (match instanceof Array) {
      return { $or: match.map(match => this.buildMatch(model, match)) };
    } else {
      return this.buildMatch(model, match);
    }
  }
}
