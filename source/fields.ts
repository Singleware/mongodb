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
   * Build and get the grouping of fields based on the specified real and virtual column schemas.
   * @param real Real columns schema.
   * @param virtual Virtual schema.
   * @returns Returns the grouping entity.
   */
  @Class.Private()
  private static getGrouping(real: Mapping.Columns.RealRow, virtual: Mapping.Columns.VirtualRow): Mapping.Types.Entity {
    const source = <Mapping.Columns.RealRow | Mapping.Columns.VirtualRow>{ ...real, ...virtual };
    const grouping = <Mapping.Types.Entity>{};
    for (const id in source) {
      const schema = source[id];
      const name = (<Mapping.Types.Entity>schema).alias || schema.name;
      grouping[name] = { $first: `$${name}` };
    }
    grouping._id = '$_id';
    return grouping;
  }

  /**
   * Apply any relationship in the specified pipeline according to the model type and view mode.
   * @param pipeline Target pipeline.
   * @param model Model type.
   * @param view View mode.
   */
  @Class.Public()
  public static applyRelations(pipeline: Mapping.Types.Entity[], model: Mapping.Types.Model, view: string): void {
    const real = Mapping.Schema.getRealRow(model, view);
    const joint = Mapping.Schema.getJointRow(model, view);
    const virtual = Mapping.Schema.getVirtualRow(model, view);
    const grouping = this.getGrouping(real, virtual);
    for (const column in joint) {
      const schema = joint[column];
      if (schema.multiple) {
        pipeline.push({ $unwind: { path: `\$${schema.local}`, preserveNullAndEmptyArrays: true } });
      }
      pipeline.push({
        $lookup: {
          from: Mapping.Schema.getStorage(schema.model),
          let: { id: `$${schema.local}` },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [`$${schema.foreign}`, `$$id`]
                }
              }
            },
            {
              $group: this.getGrouping(Mapping.Schema.getRealRow(schema.model, view), Mapping.Schema.getVirtualRow(schema.model, view))
            }
          ],
          as: schema.virtual
        }
      });
      const group = { ...grouping };
      if (schema.multiple) {
        pipeline.push({ $unwind: { path: `\$${schema.virtual}`, preserveNullAndEmptyArrays: true } });
        group[schema.local] = { $push: `$${schema.local}` };
        group[schema.virtual] = { $push: `$${schema.virtual}` };
      }
      pipeline.push({ $group: group });
    }
  }

  /**
   * Build and get the primary filter based in the specified model type.
   * @param model Model type.
   * @param value Primary id value.
   * @returns Returns the primary filter.
   * @throws Throws an error when there is no primary column defined.
   */
  @Class.Public()
  public static getPrimaryFilter(model: Mapping.Types.Model, value: any): Mapping.Types.Entity {
    const primary = Mapping.Schema.getPrimaryColumn(model);
    const filters = <Mapping.Types.Entity>{};
    filters[primary.name] = {
      operator: Mapping.Statements.Operator.EQUAL,
      value: value
    };
    return filters;
  }

  /**
   * Apply the specified filters into the target pipeline.
   * @param pipeline Target pipeline.
   * @param model Model type.
   * @param filters Filters to be applied.
   */
  @Class.Public()
  public static applyFilters(pipeline: any[], model: Mapping.Types.Model, ...filters: Mapping.Statements.Filter[]): void {
    for (const filter of filters) {
      pipeline.push({ $match: Filters.build(model, filter) });
    }
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
   * Purge all null fields from the specified entity list.
   * @param model Entity model.
   * @param view View mode.
   * @param entities List of entities to be cleaned.
   * @returns Returns the cleaned entity list.
   */
  @Class.Public()
  public static purgeNull<T extends Mapping.Types.Entity>(model: Mapping.Types.Model, view: string, entities: T[]): T[] {
    const real = Mapping.Schema.getRealRow(model, view);
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
