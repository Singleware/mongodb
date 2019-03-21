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
   * Gets a new real level entity based on the specified level information.
   * @param column Level column schema.
   * @param levels Level list.
   * @returns Returns the generated level entity.
   */
  @Class.Private()
  private static getRealLevel(column: Mapping.Columns.Real, levels: any[]): any {
    const current = levels[levels.length - 1];
    return {
      name: current ? `${current.name}.${column.name}` : column.name,
      multiple: column.formats.includes(Mapping.Types.Format.ARRAY),
      column: column,
      previous: current
    };
  }

  /**
   * Gets a new virtual level entity based on the specified level information.
   * @param column Level column schema.
   * @param levels Level list.
   * @returns Returns the level entity.
   */
  @Class.Private()
  private static getVirtualLevel(column: Mapping.Columns.Joint, levels: any[]): any {
    const current = levels[levels.length - 1];
    return {
      name: current ? `${current.name}.${column.local}` : column.local,
      virtual: current ? `${current.name}.${column.name}` : column.name,
      multiple: column.multiple,
      column: column,
      previous: current
    };
  }

  /**
   * Gets a new row group based on the specified model type and view modes.
   * @param model Model type.
   * @param views Views modes.
   * @param path Path to determine whether this group is a subgroup.
   * @returns Returns the generated row group.
   */
  @Class.Private()
  private static getGrouping(model: Mapping.Types.Model, views: string[], path?: string): Mapping.Types.Entity {
    const group = <Mapping.Types.Entity>{};
    const columns = <Mapping.Columns.RealRow | Mapping.Columns.VirtualRow>{
      ...Mapping.Schema.getRealRow(model, ...views),
      ...Mapping.Schema.getVirtualRow(model, ...views)
    };
    for (const name in columns) {
      const schema = columns[name];
      const column = (<Mapping.Types.Entity>schema).alias || schema.name;
      group[column] = path ? `$${path}.${column}` : { $first: `$${column}` };
    }
    return group;
  }

  /**
   * Gets a new compound Id based on the specified id and the list of levels.
   * @param id Main id field.
   * @param levels List of levels.
   * @returns Returns the composed id object.
   */
  @Class.Private()
  private static getComposedId(id: string, ...levels: any[]): Mapping.Types.Entity {
    const compound = <Mapping.Types.Entity>{
      _id: `${id}`
    };
    for (const level of levels) {
      compound[level.column.name] = `$_${level.column.name}Index`;
    }
    return compound;
  }

  /**
   * Decompose all groups in the specified list of levels to the given pipeline.
   * @param pipeline Current pipeline.
   * @param levels List of levels.
   * @returns Returns the list of decomposed levels.
   */
  @Class.Private()
  private static decomposeAll(pipeline: Mapping.Types.Entity, levels: any[]): any[] {
    let multiples = [];
    for (const level of levels) {
      if (level.multiple) {
        const unwind = {
          path: `\$${level.name}`,
          includeArrayIndex: `_${level.column.name}Index`,
          preserveNullAndEmptyArrays: true
        };
        pipeline.push({ $unwind: unwind });
        multiples.push(level);
      }
    }
    return multiples;
  }

  /**
   * Compose a subgroup to the given pipeline.
   * @param pipeline Current pipeline.
   * @param group Parent group.
   * @param views Current view modes.
   * @param level Current level.
   * @param last Last level.
   */
  @Class.Private()
  private static composeSubgroup(pipeline: Mapping.Types.Entity[], group: Mapping.Types.Entity, views: string[], level: any, last: any): void {
    const name = level.previous ? `_${level.column.name}` : level.column.name;
    const internal = this.getGrouping(<Mapping.Types.Model>level.column.model, views, level.name);
    internal[last.column.name] = `$_${last.column.name}`;
    if (last.column.type === 'joint') {
      internal[last.column.local] = `$_${last.column.local}`;
    }
    group[name] = { $push: internal };
    pipeline.push({ $group: group });
    if (!level.multiple) {
      pipeline.push({ $unwind: { path: `$${name}` } });
    }
  }

  /**
   * Compose a group into the pipeline.
   * @param pipeline Current pipeline.
   * @param group Current group.
   * @param level Current level.
   */
  @Class.Private()
  private static composeGroup(pipeline: Mapping.Types.Entity[], group: Mapping.Types.Entity, level: any): void {
    const name = level.previous ? `_${level.column.name}` : level.column.name;
    if (level.column.type === 'joint') {
      const local = level.previous ? `_${(level.column as Mapping.Columns.Joint).local}` : (level.column as Mapping.Columns.Joint).local;
      if (level.multiple) {
        group[name] = { $push: `$${level.virtual}` };
        group[local] = { $push: `$${level.name}` };
      } else {
        group[name] = { $first: `$${level.virtual}` };
        group[local] = { $first: `$${level.name}` };
      }
    } else if (level.multiple) {
      group[name] = { $push: `$${level.name}` };
    } else {
      group[name] = { $first: `$${level.name}` };
    }
    pipeline.push({ $group: group });
  }

  /**
   * Compose all decomposed levels to the given pipeline.
   * @param pipeline Current pipeline.
   * @param fields List of fields.
   * @param views View modes.
   * @param level First decomposed level.
   * @param multiples List of decomposed levels.
   */
  @Class.Private()
  private static composeAll(pipeline: Mapping.Types.Entity[], fields: Mapping.Types.Entity, views: string[], level: any, multiples: any[]): void {
    let multiple = multiples.pop();
    let currentId = '$_id';
    let last;
    do {
      const group = { ...fields };
      if (level.previous) {
        group['_realId'] = { $first: currentId };
      }
      if (multiple === level) {
        multiple = multiples.pop();
      }
      if (multiple) {
        group['_id'] = this.getComposedId(currentId, ...multiples, multiple);
        currentId = '$_realId';
      } else {
        group['_id'] = currentId;
      }
      if (last) {
        this.composeSubgroup(pipeline, group, views, level, last);
      } else {
        this.composeGroup(pipeline, group, level);
      }
      last = level;
      level = level.previous;
    } while (level);
  }

  /**
   * Resolve any foreign relationship in the given model type to the specified pipeline.
   * @param pipeline Current pipeline.
   * @param project Current projection.
   * @param base Base model type.
   * @param model Current model type.
   * @param views View mode.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveForeignRelation(
    pipeline: Mapping.Types.Entity[],
    project: Mapping.Types.Entity,
    base: Mapping.Types.Model,
    model: Mapping.Types.Model,
    views: string[],
    levels: any[]
  ): void {
    const joint = Mapping.Schema.getJointRow(model, ...views);
    const fields = this.getGrouping(base, views);
    for (const name in joint) {
      const schema = joint[name];
      const level = this.getVirtualLevel(schema, levels);
      levels.push(level);
      const multiples = this.decomposeAll(pipeline, levels);
      const internal = [
        {
          $match: { $expr: { $eq: [`$${schema.foreign}`, `$$id`] } }
        }
      ];
      this.applyRelations(internal, schema.model, views);
      pipeline.push(
        {
          $lookup: {
            from: Mapping.Schema.getStorage(schema.model),
            let: { id: `$${level.name}` },
            pipeline: internal,
            as: level.virtual
          }
        },
        {
          $unwind: {
            path: `\$${level.virtual}`,
            preserveNullAndEmptyArrays: true
          }
        }
      );
      if (multiples.length > 0) {
        const current = multiples.pop();
        const newer = { ...fields };
        for (const level of multiples) {
          const column = `_${level.column.name}Index`;
          newer[column] = { $first: `$${column}` };
        }
        this.composeAll(pipeline, newer, views, current, multiples);
      }
      levels.pop();
      project[schema.name] = true;
    }
  }

  /**
   * Resolve any nested relationship in the given model type to the specified pipeline.
   * @param pipeline Current pipeline.
   * @param project Current projection.
   * @param base Base model type.
   * @param model Current model type.
   * @param views View modes.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveNestedRelations(
    pipeline: Mapping.Types.Entity[],
    project: Mapping.Types.Entity,
    base: Mapping.Types.Model,
    model: Mapping.Types.Model,
    views: string[],
    levels: any[]
  ): void {
    const real = Mapping.Schema.getRealRow(model, ...views);
    for (const name in real) {
      const schema = real[name];
      const column = schema.alias || schema.name;
      if (schema.model && Mapping.Schema.isEntity(schema.model)) {
        levels.push(this.getRealLevel(schema, levels));
        project[column] = this.resolveRelations(pipeline, base, schema.model, views, levels);
        levels.pop();
      } else {
        project[column] = true;
      }
    }
  }

  /**
   * Resolve any relationship in the given model type to the specified pipeline.
   * @param pipeline Current pipeline.
   * @param base Base model type.
   * @param model Current model type.
   * @param views View modes.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveRelations(pipeline: Mapping.Types.Entity[], base: Mapping.Types.Model, model: Mapping.Types.Model, views: string[], levels: any[]): Mapping.Types.Entity {
    const project = {};
    this.resolveForeignRelation(pipeline, project, base, model, views, levels);
    this.resolveNestedRelations(pipeline, project, base, model, views, levels);
    return project;
  }

  /**
   * Apply any relationship in the specified pipeline according to the model type and view mode.
   * @param pipeline Target pipeline.
   * @param model Model type.
   * @param views View modes.
   */
  @Class.Public()
  public static applyRelations(pipeline: Mapping.Types.Entity[], model: Mapping.Types.Model, views: string[]): void {
    const project = this.resolveRelations(pipeline, model, model, views, []);
    pipeline.push({ $project: project });
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
}
