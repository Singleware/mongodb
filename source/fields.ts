/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Filters } from './filters';

/**
 * Field helper class.
 */
@Class.Describe()
export class Fields extends Class.Null {
  /**
   * Build and get the primary filter based in the specified model type.
   * @param model Model type.
   * @param value Primary id value.
   * @returns Returns the primary filter.
   * @throws Throws an error when there is no primary column defined.
   */
  @Class.Public()
  public static getPrimaryFilter(model: Mapping.Types.Model, value: any): Mapping.Types.Entity {
    const primary = <Mapping.Columns.Real>Mapping.Schema.getRealPrimaryColumn(model);
    if (!primary) {
      throw new Error(`There is no primary column to be used.`);
    }
    const filters = <any>{};
    filters[primary.name] = {
      operator: Mapping.Statements.Operator.EQUAL,
      value: value
    };
    return filters;
  }

  /**
   * Build and get the field grouping based on the specified real and virtual column schemas.
   * @param real Real columns schema.
   * @param virtual Virtual schema.
   * @returns Returns the grouping entity.
   */
  @Class.Public()
  public static getGrouping(real: Mapping.Columns.RealRow, virtual: Mapping.Columns.VirtualRow): Mapping.Types.Entity {
    const source = <Mapping.Columns.RealRow | Mapping.Columns.VirtualRow>{ ...real, ...virtual };
    const grouping = <Mapping.Types.Entity>{};
    for (const id in source) {
      const column = <Mapping.Types.Entity>source[id];
      const name = column.alias || column.name;
      grouping[name] = { $first: `$${name}` };
    }
    grouping._id = '$_id';
    return grouping;
  }

  /**
   * Build and get the sorting entity based on the specified sort object.
   * @param sort Columns to sort.
   * @returns Returns the sorting entity.
   */
  @Class.Public()
  public static getSorting(sort: Mapping.Statements.Sort): Mapping.Types.Entity {
    const sorting = <Mapping.Types.Entity>{};
    for (const column in sort) {
      switch (sort[column]) {
        case Mapping.Statements.Order.ASCENDING:
          sorting[column] = 1;
          break;
        case Mapping.Statements.Order.DESCENDING:
          sorting[column] = -1;
          break;
      }
    }
    return sorting;
  }

  /**
   * Apply the specified grouping and join list into the target pipeline.
   * @param pipeline Target pipeline.
   * @param grouping Default grouping.
   * @param joins List of joins.
   */
  @Class.Public()
  public static applyRelations(pipeline: Mapping.Types.Entity[], grouping: Mapping.Types.Entity, joins: Mapping.Statements.Join[]): void {
    for (const column of joins) {
      const group = { ...grouping };
      if (column.multiple) {
        pipeline.push({
          $unwind: {
            path: `\$${column.local}`,
            preserveNullAndEmptyArrays: true
          }
        });
      }
      pipeline.push({
        $lookup: {
          from: column.storage,
          localField: column.local,
          foreignField: column.foreign,
          as: column.virtual
        }
      });
      if (column.multiple) {
        pipeline.push({
          $unwind: {
            path: `\$${column.virtual}`,
            preserveNullAndEmptyArrays: true
          }
        });
        group[column.local] = { $push: `$${column.local}` };
        group[column.virtual] = { $push: `$${column.virtual}` };
      }
      pipeline.push({
        $group: group
      });
    }
  }

  /**
   * Apply the specified filters into the target pipeline.
   * @param model Model type.
   * @param pipeline Target pipeline.
   * @param filters Filters to be applied.
   */
  @Class.Public()
  public static applyFilters(model: Mapping.Types.Model, pipeline: any[], ...filters: Mapping.Statements.Filter[]): void {
    for (const filter of filters) {
      pipeline.push({
        $match: Filters.build(model, filter)
      });
    }
  }

  /**
   * Purge all null fields from the specified entity list.
   * @param real Real column schema.
   * @param entities Entity list to be purged.
   * @returns Returns the purged entity list.
   */
  @Class.Public()
  public static purgeNull<T extends Mapping.Types.Entity>(real: Mapping.Columns.RealRow, entities: T[]): T[] {
    let schema;
    for (let i = 0; i < entities.length; ++i) {
      for (const column in entities[i]) {
        if (entities[i][column] === null && (schema = real[column]) && !schema.formats.includes(Mapping.Types.Format.NULL)) {
          delete entities[i][column];
        }
      }
    }
    return entities;
  }
}
