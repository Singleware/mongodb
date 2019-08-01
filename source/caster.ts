/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as Engine from './engine';

/**
 * Caster helper class.
 */
@Class.Describe()
export class Caster extends Class.Null {
  /**
   * Converts the specified value to a valid Object Id.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the validated ObjectID.
   */
  @Class.Public()
  public static ObjectId<T extends string | number | Engine.ObjectId>(value: T | (T | T[])[], type: Mapping.Types.Cast): T | (T | T[])[] {
    if (value instanceof Array) {
      return <T[] | T[][]>value.map(value => this.ObjectId(value, type));
    } else if (Engine.ObjectId.isValid(value)) {
      return <T>new Engine.ObjectId(value);
    } else {
      return value;
    }
  }

  /**
   * Converts the specified value to a valid Binary.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the valid Binary.
   */
  @Class.Public()
  public static Binary<T extends number[] | Engine.Binary>(value: T, type: Mapping.Types.Cast): Engine.Binary | undefined {
    if (value instanceof Array) {
      return new Engine.Binary(Buffer.from(value));
    } else if (value instanceof Engine.Binary) {
      return value;
    } else {
      return void 0;
    }
  }
}
