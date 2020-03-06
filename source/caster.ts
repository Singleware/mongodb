/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as Engine from './engine';
import * as Types from './types';

/**
 * Caster helper class.
 */
@Class.Describe()
export class Caster extends Class.Null {
  /**
   * Converts the specified value to a valid Object Id.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the validated Object Id or the same value when the given input isn't a valid Object Id.
   */
  @Class.Public()
  public static ObjectId<T>(value: T, type: Mapping.Types.Cast): T | Engine.ObjectId {
    if (Engine.ObjectId.isValid(<any>value)) {
      return new Engine.ObjectId(<any>value);
    }
    return value;
  }

  /**
   * Converts the specified value to a valid Object Id array.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the validated Object Id Array or the same value when the given input isn't a valid Array.
   */
  @Class.Public()
  public static ObjectIdArray<T>(value: T[], type: Mapping.Types.Cast): (T | Engine.ObjectId)[] {
    if (value instanceof Array) {
      for (let index = 0; index < value.length; ++index) {
        value[index] = <T>this.ObjectId(value[index], type);
      }
    }
    return value;
  }

  /**
   * Converts the specified value to a valid Object Id Map.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the validated Object Id Map or the same value when the given input isn't a valid Map.
   */
  @Class.Public()
  public static ObjectIdMap<T>(value: Types.Map<T>, type: Mapping.Types.Cast): Types.Map<T | Engine.ObjectId> {
    if (value instanceof Object) {
      for (const key in value) {
        value[key] = <T>this.ObjectId(value[key], type);
      }
    }
    return value;
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
