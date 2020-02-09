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
   * Get all viewed fields based on the specified model type and the given fields to select.
   * @param model Model type.
   * @param fields Fields to select.
   * @returns Returns the view list.
   */
  @Class.Private()
  private static getView(model: Aliases.Model, fields: string[]): string[] {
    const view = new Set([Aliases.Schema.getColumnName(Aliases.Schema.getPrimaryColumn(model))]);
    const schemas = <Aliases.Columns.RealRow | Aliases.Columns.VirtualRow>{
      ...Aliases.Schema.getRealRow(model, ...fields),
      ...Aliases.Schema.getVirtualRow(model, ...fields)
    };
    for (const name in schemas) {
      const schema = schemas[name];
      if (schema.type === Aliases.Types.Column.Virtual) {
        view.add((<Aliases.Columns.Virtual>schema).local);
      }
      view.add(Aliases.Schema.getColumnName(schemas[name]));
    }
    return [...view.values()];
  }

  /**
   * Gets a new real level based on the specified column schema and the given fields to select.
   * @param schema Level column schema.
   * @param levels Level list.
   * @param fields Fields to select.
   * @returns Returns the generated level entity.
   */
  @Class.Private()
  private static getRealLevel(schema: Aliases.Columns.Real, levels: any[], fields: string[]): any {
    const current = levels[levels.length - 1];
    return {
      name: current ? `${current.name}.${schema.name}` : schema.name,
      fields: Aliases.Schema.getNestedFields(schema, fields),
      multiple: schema.formats.includes(Aliases.Format.Array),
      column: schema,
      previous: current
    };
  }

  /**
   * Gets a new virtual level based on the specified column schema and the given fields to select.
   * @param schema Level column schema.
   * @param levels Level list.
   * @param fields Fields to select.
   * @returns Returns the generated level entity.
   */
  @Class.Private()
  private static getVirtualLevel(schema: Aliases.Columns.Virtual, levels: any[], fields: string[]): any {
    const current = levels[levels.length - 1];
    return {
      name: current ? `${current.name}.${schema.local}` : schema.local,
      virtual: current ? `${current.name}.${schema.name}` : schema.name,
      fields: fields.length > 0 ? Aliases.Schema.getNestedFields(schema, fields) : schema.fields || [],
      multiple: schema.multiple,
      column: schema,
      previous: current
    };
  }

  /**
   * Get a new group rule based on the specified model type and viewed fields.
   * @param view Viewed fields.
   * @param path Path to determine whether it's a subgroup.
   * @returns Returns the generated group rule entity.
   */
  @Class.Private()
  private static getGroupRule(view: string[], path?: string): Aliases.Entity {
    const rule = <Aliases.Entity>{};
    for (const field of view) {
      rule[field] = path ? `$${path}.${field}` : { $first: `$${field}` };
    }
    return rule;
  }

  /**
   * Get a new project rule based on the specified model type and viewed fields.
   * @param view Viewed fields.
   * @returns Returns the generated project rule entity.
   */
  @Class.Private()
  private static getProjectRule(view: string[]): Aliases.Entity {
    const rule = <Aliases.Entity>{};
    for (const field of view) {
      rule[field] = { $ifNull: [`$${field}`, '$$REMOVE'] };
    }
    return rule;
  }

  /**
   * Get a new sort rule based on the specified sort map.
   * @param sort Sort map.
   * @returns Returns the generated sort rule entity.
   */
  @Class.Private()
  private static getSortRule(sort: Aliases.Sort): Aliases.Entity {
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
   * Gets a new compound Id based on the specified main field Id and the list of levels.
   * @param id Main field Id.
   * @param levels List of levels.
   * @returns Returns the composed Id entity.
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
   * Compose a subgroup into the given pipeline.
   * @param pipeline Current pipeline.
   * @param group Parent group.
   * @param fields Fields to select.
   * @param level Current level.
   * @param last Last level.
   */
  @Class.Private()
  private static composeSubgroup(pipeline: Aliases.Entity[], group: Aliases.Entity, level: any, last: any): void {
    const name = level.previous ? `_${level.column.name}` : level.column.name;
    const model = Aliases.Schema.getEntityModel(level.column.model);
    const internal = this.getGroupRule(this.getView(model, level.fields), level.name);
    internal[last.column.name] = `$_${last.column.name}`;
    if (last.column.type === 'virtual') {
      internal[last.column.local] = `$_${last.column.local}`;
    }
    group[name] = { $push: internal };
    pipeline.push({ $group: group });
    pipeline.push({ $project: this.getProjectRule(Object.keys(group)) });
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
    pipeline.push({ $project: this.getProjectRule(Object.keys(group)) });
  }

  /**
   * Compose all decomposed levels to the given pipeline.
   * @param pipeline Current pipeline.
   * @param properties List of fields.
   * @param fields Fields to select.
   * @param level First decomposed level.
   * @param multiples List of decomposed levels.
   */
  @Class.Private()
  private static composeAll(pipeline: Aliases.Entity[], properties: Aliases.Entity, level: any, multiples: any[]): void {
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
        this.composeSubgroup(pipeline, group, level, last);
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
   * @param model Model type.
   * @param view Viewed fields.
   * @param fields Fields to select.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveForeignRelation(
    pipeline: Aliases.Entity[],
    project: Aliases.Entity,
    model: Aliases.Model,
    view: string[],
    fields: string[],
    levels: any[]
  ): void {
    const row = Aliases.Schema.getVirtualRow(model, ...fields);
    const group = this.getGroupRule(view);
    for (const name in row) {
      const schema = row[name];
      const resolved = Aliases.Schema.getEntityModel(schema.model);
      const level = this.getVirtualLevel(schema, levels, fields);
      levels.push(level);
      const multiples = this.decomposeAll(pipeline, levels);
      pipeline.push({
        $lookup: {
          from: Aliases.Schema.getStorageName(resolved),
          let: { id: `$${level.name}` },
          pipeline: [
            {
              $match: { $expr: { $eq: [`$${schema.foreign}`, `$$id`] } }
            },
            ...this.build(resolved, schema.query || {}, level.fields)
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
        this.composeAll(pipeline, newer, current, multiples);
      }
      levels.pop();
      project[schema.name] = true;
    }
  }

  /**
   * Resolve any nested relationship in the given model type to the specified pipeline.
   * @param pipeline Current pipeline.
   * @param project Current projection.
   * @param model Model type.
   * @param view Viewed fields.
   * @param fields Fields to selected.
   * @param levels List of current levels.
   */
  @Class.Private()
  private static resolveNestedRelations(
    pipeline: Aliases.Entity[],
    project: Aliases.Entity,
    model: Aliases.Model,
    view: string[],
    fields: string[],
    levels: any[]
  ): void {
    const real = Aliases.Schema.getRealRow(model, ...fields);
    for (const name in real) {
      const schema = real[name];
      const column = Aliases.Schema.getColumnName(schema);
      if (schema.model && Aliases.Schema.isEntity(schema.model)) {
        const resolved = Aliases.Schema.getEntityModel(schema.model);
        const level = this.getRealLevel(schema, levels, fields);
        levels.push(level);
        const nested = this.applyRelationship(pipeline, resolved, view, level.fields, levels);
        if (schema.formats.includes(Aliases.Format.Map)) {
          project[column] = true;
        } else {
          project[column] = nested;
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
   * @param fields Fields to select.
   * @param levels List of current levels.
   * @returns Returns the pipeline projection.
   */
  @Class.Private()
  private static applyRelationship(
    pipeline: Aliases.Entity[],
    model: Aliases.Model,
    view: string[],
    fields: string[],
    levels: any[]
  ): Aliases.Entity {
    const project = {};
    this.resolveForeignRelation(pipeline, project, model, view, fields, levels);
    this.resolveNestedRelations(pipeline, project, model, view, fields, levels);
    return project;
  }

  /**
   * Build a new pipeline entity based on the specified model type, fields and query filter.
   * @param model Model type.
   * @param fields Fields to select.
   * @param query Query filter.
   * @returns Returns the new pipeline entity.
   */
  @Class.Public()
  public static build(model: Aliases.Model, query: Aliases.Query, fields: string[]): Aliases.Entity[] {
    const pipeline = <Aliases.Entity[]>[];
    if (query.pre) {
      pipeline.push({ $match: Match.build(model, query.pre) });
    }
    const view = this.getView(model, fields);
    const project = this.applyRelationship(pipeline, model, view, fields, []);
    if (query.post) {
      pipeline.push({ $match: Match.build(model, query.post) });
    }
    if (query.sort) {
      pipeline.push({ $sort: this.getSortRule(query.sort) });
    }
    if (query.limit) {
      if (query.limit.start > 0) {
        pipeline.push({ $skip: query.limit.start });
      }
      pipeline.push({ $limit: query.limit.count });
    }
    if (view.length > 0) {
      pipeline.push({ $project: project });
    }
    return pipeline;
  }
}
