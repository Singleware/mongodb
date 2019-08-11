/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Aliases from './aliases';
import * as Engine from './engine';

import { Caster } from './caster';

/**
 * Schema helper class.
 */
@Class.Describe()
export class Schema extends Aliases.Schema {
  /**
   * Decorates the specified property to be an object Id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static ObjectId(): Aliases.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      super.Id()(scope, <string>property, descriptor);
      return super.Convert(Caster.ObjectId.bind(Caster))(scope, <string>property, descriptor);
    };
  }

  /**
   * Decorates the specified property to be the document object Id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static DocumentId(): Aliases.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      this.ObjectId()(scope, <string>property, descriptor);
      return super.Alias('_id')(scope, <string>property, descriptor);
    };
  }

  /**
   *  Decorates the specified property to be an array column that accepts only Object Ids.
   * @param unique Determines whether the array items must be unique or not.
   * @param minimum Minimum items.
   * @param maximum Maximum items.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static ArrayIds(unique?: boolean, minimum?: number, maximum?: number): Aliases.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      super.Array(Engine.ObjectId, unique, minimum, maximum)(scope, <string>property, descriptor);
      return super.Convert(Caster.ObjectId.bind(Caster))(scope, <string>property, descriptor);
    };
  }

  /**
   * Decorates the specified property to be an Object Id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Binary(): Aliases.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      super.Binary()(scope, <string>property, descriptor);
      return super.Convert(Caster.Binary.bind(Caster))(scope, <string>property, descriptor);
    };
  }
}
