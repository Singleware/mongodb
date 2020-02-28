/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
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
  public static ObjectId<T>(value: T | T[], type: Mapping.Types.Cast): (T | Engine.ObjectId) | (T | Engine.ObjectId)[] {
    if (value instanceof Array) {
      return value.map(value => <T | Engine.ObjectId>this.ObjectId(value, type));
    } else if (Engine.ObjectId.isValid(<any>value)) {
      return new Engine.ObjectId(<any>value);
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
  public static Binary<T>(value: T, type: Mapping.Types.Cast): Engine.Binary | undefined {
    if (value instanceof Array) {
      return new Engine.Binary(Buffer.from(value));
    } else if (value instanceof Engine.Binary) {
      return value;
    } else {
      return void 0;
    }
  }
}
