/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as Types from '../types';

/**
 * Sort helper class.
 */
@Class.Describe()
export class Sort extends Class.Null {
  /**
   * Build a new sorting entity based on the specified sort map.
   * @param model Model type.
   * @param sort Sort map.
   * @returns Returns the new sorting entity.
   */
  @Class.Public()
  public static build(model: Types.Model, sort: Types.Sort): Types.Entity {
    const entity = <Types.Entity>{};
    for (const column in sort) {
      const schemas = Mapping.Helper.getPathColumns(model, column);
      const path = Types.Columns.Helper.getPath(schemas);
      switch (sort[column]) {
        case Types.Order.Ascending:
          entity[path] = 1;
          break;
        case Types.Order.Descending:
          entity[path] = -1;
          break;
      }
    }
    return entity;
  }
}
