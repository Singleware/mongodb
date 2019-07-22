/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as BSON from './bson';

/**
 * Converters helper class.
 */
@Class.Describe()
export class Converters extends Class.Null {
  /**
   * Converts the specified input value to an ObjectID output.
   * @param input Input value.
   * @returns Returns the ObjectID output or undefined when the input was not valid.
   */
  @Class.Public()
  public static ObjectID<T extends string | number | BSON.ObjectID>(input: T | T[]): BSON.ObjectID | BSON.ObjectID[] | undefined {
    if (input instanceof BSON.ObjectID) {
      return input;
    } else if (input instanceof Array) {
      const list = [];
      for (const value of input) {
        if (value instanceof BSON.ObjectID) {
          list.push(value);
        } else if (BSON.ObjectID.isValid(value)) {
          list.push(new BSON.ObjectID(value));
        }
      }
      return list;
    } else if (BSON.ObjectID.isValid(input)) {
      return new BSON.ObjectID(input);
    } else {
      return void 0;
    }
  }

  /**
   * Converts the specified input value to a Binary output.
   * @param input Input value.
   * @returns Returns the Binary output or undefined when the input was not valid.
   */
  @Class.Public()
  public static Binary<T extends Array<number> | BSON.Binary>(input: T): BSON.Binary | undefined {
    if (input instanceof BSON.Binary) {
      return input;
    } else if (input instanceof Array) {
      return new BSON.Binary(Buffer.from(input));
    } else {
      return void 0;
    }
  }
}
