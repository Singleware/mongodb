/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Matches } from './matches';

/**
 * Filters helper class.
 */
@Class.Describe()
export class Filters extends Class.Null {
  /**
   * Gets a new real level entity based on the specified column.
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
   * Gets a new virtual level entity based on the specified column.
   * @param column Level column schema.
   * @param levels Level list.
   * @returns Returns the level entity.
   */
  @Class.Private()
  private static getVirtualLevel(column: Mapping.Columns.Virtual, levels: any[]): any {
    const current = levels[levels.length - 1];
    return {
      name: current ? `${current.name}.${column.local}` : column.local,
      virtual: current ? `${current.name}.${column.name}` : column.name,
      multiple: column.multiple,
      filter: column.filter,
      column: column,
      previous: current
    };
  }

  /**
   * Builds and get a new grouping entity based on the specified model type and fields.
   * @param model Model type.
   * @param fields Fields to be selected.
   * @param path Path to determine whether this group is a subgroup.
   * @returns Returns the generated group.
   */
  @Class.Private()
  private static getGrouping(model: Mapping.Types.Model, fields: string[], path?: string): Mapping.Types.Entity {
    const group = <Mapping.Types.Entity>{};
    const columns = <Mapping.Columns.RealRow | Mapping.Columns.VirtualRow>{
      ...Mapping.Schema.getRealRow(model, ...fields),
      ...Mapping.Schema.getVirtualRow(model, ...fields)
    };
    for (const name in columns) {
      const schema = columns[name];
      const column = (<Mapping.Types.Entity>schema).alias || schema.name;
      group[column] = path ? `$${path}.${column}` : { $first: `$${column}` };
    }
    return group;
  }

  /**
   * Builds and get a new sorting entity based on the specified sorting map.
   * @param sort Sorting map.
   * @returns Returns the generated sorting.
   */
  @Class.Private()
  private static getSorting(sort: Mapping.Statements.Sort): Mapping.Types.Entity {
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
        pipeline.push({
          $unwind: {
            path: `\$${level.name}`,
            includeArrayIndex: `_${level.column.name}Index`,
            preserveNullAndEmptyArrays: true
          }
        });
        multiples.push(level);
      }
    }
    return multiples;
  }

  /**
   * Compose a subgroup to the given pipeline.
   * @param pipeline Current pipeline.
   * @param group Parent group.
   * @param fields Fields to be selected.
   * @param level Current level.
   * @param last Last level.
   */
  @Class.Private()
  private static composeSubgroup(pipeline: Mapping.Types.Entity[], group: Mapping.Types.Entity, fields: string[], level: any, last: any): void {
    const name = level.previous ? `_${level.column.name}` : level.column.name;
    const internal = this.getGrouping(<Mapping.Types.Model>level.column.model, fields, level.name);
    internal[last.column.name] = `$_${last.column.name}`;
    if (last.column.type === 'virtual') {
      internal[last.column.local] = `$_${last.column.local}`;
    }
    group[name] = { $push: internal };
    pipeline.push({ $group: group });
    if (!level.multiple && !level.all) {
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
    if (level.column.type === 'virtual') {
      const local = level.previous ? `_${(level.column as Mapping.Columns.Virtual).local}` : (level.column as Mapping.Columns.Virtual).local;
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
   * @param properties List of fields.
   * @param fields Fields to be selected.
   * @param level First decomposed level.
   * @param multiples List of decomposed levels.
   */
  @Class.Private()
  private static composeAll(pipeline: Mapping.Types.Entity[], properties: Mapping.Types.Entity, fields: string[], level: any, multiples: any[]): void {
    let multiple = multiples.pop();
    let currentId = '$_id';
    let last;
    do {
      const group = { ...properties };
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
        this.composeSubgroup(pipeline, group, fields, level, last);
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
   * @param fields Fields to be selected.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveForeignRelation(pipeline: Mapping.Types.Entity[], project: Mapping.Types.Entity, base: Mapping.Types.Model, model: Mapping.Types.Model, fields: string[], levels: any[]): void {
    const row = Mapping.Schema.getVirtualRow(model, ...fields);
    const group = this.getGrouping(base, fields);
    for (const name in row) {
      const schema = row[name];
      const level = this.getVirtualLevel(schema, levels);
      levels.push(level);
      const multiples = this.decomposeAll(pipeline, levels);
      pipeline.push({
        $lookup: {
          from: Mapping.Schema.getStorage(schema.model),
          let: { id: `$${level.name}` },
          pipeline: [
            {
              $match: { $expr: { $eq: [`$${schema.foreign}`, `$$id`] } }
            },
            ...this.getPipeline(schema.model, schema.filter || {}, fields)
          ],
          as: level.virtual
        }
      });
      if (!schema.all) {
        pipeline.push({
          $unwind: {
            path: `\$${level.virtual}`,
            preserveNullAndEmptyArrays: true
          }
        });
      }
      if (multiples.length > 0) {
        const current = multiples.pop();
        const newer = { ...group };
        for (const level of multiples) {
          const column = `_${level.column.name}Index`;
          newer[column] = { $first: `$${column}` };
        }
        this.composeAll(pipeline, newer, fields, current, multiples);
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
   * @param fields Fields to be selected
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveNestedRelations(pipeline: Mapping.Types.Entity[], project: Mapping.Types.Entity, base: Mapping.Types.Model, model: Mapping.Types.Model, fields: string[], levels: any[]): void {
    const real = Mapping.Schema.getRealRow(model, ...fields);
    for (const name in real) {
      const schema = real[name];
      const column = schema.alias || schema.name;
      if (schema.model && Mapping.Schema.isEntity(schema.model)) {
        levels.push(this.getRealLevel(schema, levels));
        const projection = this.applyRelationship(pipeline, base, schema.model, fields, levels);
        if (schema.formats.includes(Mapping.Types.Format.MAP)) {
          project[column] = true;
        } else {
          project[column] = projection;
        }
        levels.pop();
      } else {
        project[column] = true;
      }
    }
  }

  /**
   * Applies any relationship in the given model type into the specified pipeline.
   * @param pipeline Current pipeline.
   * @param base Base model type.
   * @param model Current model type.
   * @param fields Fields to be selected.
   * @param levels List of current levels.
   * @returns Returns the pipeline projection.
   */
  @Class.Private()
  private static applyRelationship(pipeline: Mapping.Types.Entity[], base: Mapping.Types.Model, model: Mapping.Types.Model, fields: string[], levels: any[]): Mapping.Types.Entity {
    const project = {};
    this.resolveForeignRelation(pipeline, project, base, model, fields, levels);
    this.resolveNestedRelations(pipeline, project, base, model, fields, levels);
    return project;
  }

  /**
   * Builds and get the primary id filter based on the specified model type.
   * @param model Model type.
   * @param value Primary id value.
   * @returns Returns the primary filter.
   */
  @Class.Public()
  public static getPrimaryIdMatch(model: Mapping.Types.Model, value: any): Mapping.Statements.Match {
    const primary = Mapping.Schema.getPrimaryColumn(model);
    const filters = <Mapping.Statements.Match>{};
    filters[primary.name] = {
      operator: Mapping.Statements.Operator.EQUAL,
      value: value
    };
    return filters;
  }

  /**
   * Builds and get the filter pipeline based on the specified model type, fields and filter.
   * @param model Model type.
   * @param fields Fields to be selected.
   * @param filter Fields filter.
   * @returns Returns the filter pipeline.
   */
  @Class.Public()
  public static getPipeline(model: Mapping.Types.Model, filter: Mapping.Statements.Filter, fields: string[]): Mapping.Types.Entity[] {
    const pipeline = <Mapping.Types.Entity[]>[];
    if (filter.pre) {
      pipeline.push({ $match: Matches.build(model, filter.pre) });
    }
    const project = this.applyRelationship(pipeline, model, model, fields, []);
    if (filter.post) {
      pipeline.push({ $match: Matches.build(model, filter.post) });
    }
    if (filter.sort) {
      pipeline.push({ $sort: this.getSorting(filter.sort) });
    }
    if (filter.limit) {
      if (filter.limit.start > 0) {
        pipeline.push({ $skip: filter.limit.start });
      }
      pipeline.push({ $limit: filter.limit.count });
    }
    if (project.length > 0) {
      pipeline.push({ $project: project });
    }
    return pipeline;
  }
}
