/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Aliases from '../aliases';

import { Match } from './match';

/**
 * Pipeline helper class.
 */
@Class.Describe()
export class Pipeline extends Class.Null {
  /**
   * Gets a new real level entity based on the specified column.
   * @param column Level column schema.
   * @param levels Level list.
   * @returns Returns the generated level entity.
   */
  @Class.Private()
  private static getRealLevel(column: Aliases.Columns.Real, levels: any[]): any {
    const current = levels[levels.length - 1];
    return {
      name: current ? `${current.name}.${column.name}` : column.name,
      multiple: column.formats.includes(Aliases.Format.Array),
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
  private static getVirtualLevel(column: Aliases.Columns.Virtual, levels: any[]): any {
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
   * Builds and get a new grouping entity based on the specified model type and viewed fields.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param path Path to determine whether is a subgroup.
   * @returns Returns the generated group.
   */
  @Class.Private()
  private static getGrouping(model: Aliases.Model, fields: string[], path?: string): Aliases.Entity {
    const group = <Aliases.Entity>{};
    const columns = <Aliases.Columns.RealRow | Aliases.Columns.VirtualRow>{
      ...Aliases.Schema.getRealRow(model, ...fields),
      ...Aliases.Schema.getVirtualRow(model, ...fields)
    };
    for (const name in columns) {
      const schema = columns[name];
      const column = (<Aliases.Entity>schema).alias || schema.name;
      group[column] = path ? `$${path}.${column}` : { $first: `$${column}` };
    }
    return group;
  }

  /**
   * Builds and get a new projection entity based on the specified model type and viewed fields.
   * @param group Current group.
   * @returns Returns the generated group.
   */
  @Class.Private()
  private static getProjection(group: Aliases.Entity): Aliases.Entity {
    const project = <Aliases.Entity>{};
    for (const name in group) {
      project[name] = { $ifNull: [`$${name}`, '$$REMOVE'] };
    }
    return project;
  }

  /**
   * Builds and get a new sorting entity based on the specified sorting map.
   * @param sort Sorting map.
   * @returns Returns the generated sorting.
   */
  @Class.Private()
  private static getSorting(sort: Aliases.Sort): Aliases.Entity {
    const sorting = <Aliases.Entity>{};
    for (const column in sort) {
      switch (sort[column]) {
        case Aliases.Order.Ascending:
          sorting[column] = 1;
          break;
        case Aliases.Order.Descending:
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
  private static getComposedId(id: string, ...levels: any[]): Aliases.Entity {
    const compound = <Aliases.Entity>{
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
  private static decomposeAll(pipeline: Aliases.Entity, levels: any[]): any[] {
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
   * @param fields Viewed fields.
   * @param level Current level.
   * @param last Last level.
   */
  @Class.Private()
  private static composeSubgroup(pipeline: Aliases.Entity[], group: Aliases.Entity, fields: string[], level: any, last: any): void {
    const name = level.previous ? `_${level.column.name}` : level.column.name;
    const internal = this.getGrouping(<Aliases.Model>level.column.model, fields, level.name);
    internal[last.column.name] = `$_${last.column.name}`;
    if (last.column.type === 'virtual') {
      internal[last.column.local] = `$_${last.column.local}`;
    }
    group[name] = { $push: internal };
    pipeline.push({ $group: group });
    pipeline.push({ $project: this.getProjection(group) });
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
  private static composeGroup(pipeline: Aliases.Entity[], group: Aliases.Entity, level: any): void {
    const name = level.previous ? `_${level.column.name}` : level.column.name;
    if (level.column.type === 'virtual') {
      const local = level.previous
        ? `_${(level.column as Aliases.Columns.Virtual).local}`
        : (level.column as Aliases.Columns.Virtual).local;
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
    pipeline.push({ $project: this.getProjection(group) });
  }

  /**
   * Compose all decomposed levels to the given pipeline.
   * @param pipeline Current pipeline.
   * @param properties List of fields.
   * @param fields Viewed fields.
   * @param level First decomposed level.
   * @param multiples List of decomposed levels.
   */
  @Class.Private()
  private static composeAll(pipeline: Aliases.Entity[], properties: Aliases.Entity, fields: string[], level: any, multiples: any[]): void {
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
   * @param fields Viewed fields.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveForeignRelation(
    pipeline: Aliases.Entity[],
    project: Aliases.Entity,
    base: Aliases.Model,
    model: Aliases.Model,
    fields: string[],
    levels: any[]
  ): void {
    const row = Aliases.Schema.getVirtualRow(model, ...fields);
    const group = this.getGrouping(base, fields);
    for (const name in row) {
      const schema = row[name];
      const level = this.getVirtualLevel(schema, levels);
      levels.push(level);
      const multiples = this.decomposeAll(pipeline, levels);
      pipeline.push({
        $lookup: {
          from: Aliases.Schema.getStorageName(schema.model),
          let: { id: `$${level.name}` },
          pipeline: [
            {
              $match: { $expr: { $eq: [`$${schema.foreign}`, `$$id`] } }
            },
            ...this.build(schema.model, schema.query || {}, fields)
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
  private static resolveNestedRelations(
    pipeline: Aliases.Entity[],
    project: Aliases.Entity,
    base: Aliases.Model,
    model: Aliases.Model,
    fields: string[],
    levels: any[]
  ): void {
    const real = Aliases.Schema.getRealRow(model, ...fields);
    for (const name in real) {
      const schema = real[name];
      const column = schema.alias || schema.name;
      if (schema.model && Aliases.Schema.isEntity(schema.model)) {
        levels.push(this.getRealLevel(schema, levels));
        const projection = this.applyRelationship(pipeline, base, schema.model, fields, levels);
        if (schema.formats.includes(Aliases.Format.Map)) {
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
   * @param fields Viewed fields.
   * @param levels List of current levels.
   * @returns Returns the pipeline projection.
   */
  @Class.Private()
  private static applyRelationship(
    pipeline: Aliases.Entity[],
    base: Aliases.Model,
    model: Aliases.Model,
    fields: string[],
    levels: any[]
  ): Aliases.Entity {
    const project = {};
    this.resolveForeignRelation(pipeline, project, base, model, fields, levels);
    this.resolveNestedRelations(pipeline, project, base, model, fields, levels);
    return project;
  }

  /**
   * Build a new pipeline entity based on the specified model type, fields and query filter.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param query Query filter.
   * @returns Returns the new pipeline entity.
   */
  @Class.Public()
  public static build(model: Aliases.Model, query: Aliases.Query, fields: string[]): Aliases.Entity[] {
    const pipeline = <Aliases.Entity[]>[];
    if (query.pre) {
      pipeline.push({ $match: Match.build(model, query.pre) });
    }
    const project = this.applyRelationship(pipeline, model, model, fields, []);
    if (query.post) {
      pipeline.push({ $match: Match.build(model, query.post) });
    }
    if (query.sort) {
      pipeline.push({ $sort: this.getSorting(query.sort) });
    }
    if (query.limit) {
      if (query.limit.start > 0) {
        pipeline.push({ $skip: query.limit.start });
      }
      pipeline.push({ $limit: query.limit.count });
    }
    if (fields.length > 0) {
      pipeline.push({ $project: project });
    }
    return pipeline;
  }
}
