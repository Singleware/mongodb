/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as BSON from './bson';

/**
 * Converters helper class.
 */
@Class.Describe()
export class Adapters extends Class.Null {
  /**
   * Converts the specified input value to an ObjectID output.
   * @param input Input value.
   * @returns Returns the ObjectID or undefined when the input was not valid.
   */
  @Class.Public()
  public static ObjectID(
    input: string | number | BSON.ObjectID | string[] | number[] | BSON.ObjectID[]
  ): BSON.ObjectID | BSON.ObjectID[] | undefined {
    if (input instanceof Array) {
      const list = [];
      for (const value of input) {
        if (value instanceof BSON.ObjectID) {
          list.push(value);
        } else if (BSON.ObjectID.isValid(value)) {
          list.push(new BSON.ObjectID(value));
        }
      }
      return <BSON.ObjectID[]>list;
    } else if (input instanceof BSON.ObjectID) {
      return input;
    } else if (BSON.ObjectID.isValid(input)) {
      return new BSON.ObjectID(input);
    } else {
      return void 0;
    }
  }
}
