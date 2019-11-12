/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Aliases from '../aliases';
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
  private static castArray<T extends string | number>(input: T[], schema: Aliases.Columns.Real): (T | BSON.ObjectId)[] {
    if (!(input instanceof Array)) {
      throw new TypeError(`The filter input must be an array.`);
    } else if (schema.model === BSON.ObjectId) {
      return input.map(value => (BSON.ObjectId.isValid(value) ? new BSON.ObjectId(value) : value));
    } else {
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
  private static castValue<T extends string | number>(value: T, schema: Aliases.Columns.Real): T | BSON.ObjectId {
    if (schema.formats.includes(Aliases.Format.Id) && BSON.ObjectId.isValid(<any>value)) {
      return new BSON.ObjectId(<any>value);
    } else {
      return value;
    }
  }

  /**
   * Build a new match entity from the specified match expression.
   * @param model Model type.
   * @param match Match expression.
   * @returns Returns the new match entity.
   */
  @Class.Private()
  private static buildMatch(model: Aliases.Model, match: Aliases.Match): Aliases.Entity {
    const entity = <Aliases.Entity>{};
    for (const name in match) {
      const schema = Aliases.Schema.getRealColumn(model, name);
      const column = schema.alias || schema.name;
      const operation = match[name];
      switch (operation.operator) {
        case Aliases.Operator.LessThan:
          entity[column] = {
            $lt: this.castValue(operation.value, schema)
          };
          break;
        case Aliases.Operator.LessThanOrEqual:
          entity[column] = {
            $lte: this.castValue(operation.value, schema)
          };
          break;
        case Aliases.Operator.Equal:
          entity[column] = {
            $eq: this.castValue(operation.value, schema)
          };
          break;
        case Aliases.Operator.NotEqual:
          entity[column] = {
            $ne: this.castValue(operation.value, schema)
          };
          break;
        case Aliases.Operator.GreaterThanOrEqual:
          entity[column] = {
            $gte: this.castValue(operation.value, schema)
          };
          break;
        case Aliases.Operator.GreaterThan:
          entity[column] = {
            $gt: this.castValue(operation.value, schema)
          };
          break;
        case Aliases.Operator.Between:
          entity[column] = {
            $gte: this.castValue(operation.value[0], schema),
            $lte: this.castValue(operation.value[1], schema)
          };
          break;
        case Aliases.Operator.Contain:
          entity[column] = {
            $in: this.castArray(operation.value, schema)
          };
          break;
        case Aliases.Operator.NotContain:
          entity[column] = {
            $nin: this.castArray(operation.value, schema)
          };
          break;
        case Aliases.Operator.RegExp:
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
  public static build(model: Aliases.Model, match: Aliases.Match | Aliases.Match[]): Aliases.Entity {
    if (match instanceof Array) {
      return { $or: match.map(match => this.buildMatch(model, match)) };
    } else {
      return this.buildMatch(model, match);
    }
  }
}
