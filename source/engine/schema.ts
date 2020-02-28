/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Aliases from '../types';
import * as BSON from './bson';

/**
 * Schema helper class.
 */
@Class.Describe()
export class Schema extends Class.Null {
  /**
   * Sets the specified target property if the specified source property has some data.
   * @param to Target property.
   * @param target Target entity.
   * @param from Source property.
   * @param source Source entity.
   */
  @Class.Private()
  private static setProperty(to: string, target: Aliases.Entity, from: string, source: Aliases.Entity): void {
    if (source[from] !== void 0) {
      target[to] = source[from];
    }
  }

  /**
   * Build a new document schema based on the model in the specified column schema.
   * @param column Column schema.
   * @returns Returns the new document schema.
   */
  @Class.Private()
  private static buildDocumentSchema(column: Aliases.Columns.Real): Aliases.Columns.RealRow {
    if (column.model && Aliases.Schema.isEntity(column.model)) {
      return this.build(Aliases.Schema.getRealRow(Aliases.Schema.getEntityModel(column.model)));
    } else {
      return this.build({});
    }
  }

  /**
   * Build a new property schema based on the specified column schema.
   * @param column Column Schema.
   * @returns Return the generated schema properties.
   * @throws Throws an error when the column type is unsupported.
   */
  @Class.Private()
  private static buildPropertySchema(column: Aliases.Columns.Real): Aliases.Entity {
    const entity = <Aliases.Entity>{ bsonType: [] };
    for (const type of column.formats) {
      switch (type) {
        case Aliases.Format.Id:
          entity.bsonType.push('objectId');
          break;
        case Aliases.Format.Null:
          entity.bsonType.push('null');
          break;
        case Aliases.Format.Binary:
          entity.bsonType.push('binData');
          break;
        case Aliases.Format.Boolean:
          entity.bsonType.push('bool');
          break;
        case Aliases.Format.Integer:
          entity.bsonType.push('int');
          this.setProperty('minimum', entity, 'minimum', column);
          this.setProperty('maximum', entity, 'maximum', column);
          break;
        case Aliases.Format.Decimal:
          entity.bsonType.push('double');
          this.setProperty('minimum', entity, 'minimum', column);
          this.setProperty('maximum', entity, 'maximum', column);
          break;
        case Aliases.Format.Number:
          entity.bsonType.push('number');
          this.setProperty('minimum', entity, 'minimum', column);
          this.setProperty('maximum', entity, 'maximum', column);
          break;
        case Aliases.Format.String:
          entity.bsonType.push('string');
          this.setProperty('minLength', entity, 'minimum', column);
          this.setProperty('maxLength', entity, 'maximum', column);
          break;
        case Aliases.Format.Enumeration:
          entity.bsonType.push('string');
          entity.enum = column.values;
          break;
        case Aliases.Format.Pattern:
          const pattern = (<RegExp>column.pattern).toString();
          entity.bsonType.push('string');
          entity.pattern = pattern.substring(1, pattern.lastIndexOf('/'));
          break;
        case Aliases.Format.Timestamp:
          entity.bsonType.push('timestamp');
          break;
        case Aliases.Format.Date:
          entity.bsonType.push('date');
          break;
        case Aliases.Format.Array:
          entity.bsonType.push('array');
          this.setProperty('minItems', entity, 'minimum', column);
          this.setProperty('maxItems', entity, 'maximum', column);
          this.setProperty('uniqueItems', entity, 'unique', column);
          switch (column.model) {
            case Object:
              entity.items = { bsonType: 'object' };
              break;
            case String:
              entity.items = { bsonType: 'string' };
              break;
            case Number:
              entity.items = { bsonType: 'number' };
              break;
            case Boolean:
              entity.items = { bsonType: 'bool' };
              break;
            case Date:
              entity.items = { bsonType: 'date' };
              break;
            case BSON.ObjectId:
              entity.items = { bsonType: 'objectId' };
              break;
            default:
              entity.items = this.buildDocumentSchema(column);
          }
          break;
        case Aliases.Format.Map:
          entity.bsonType.push('object');
          switch (column.model) {
            case Object:
              entity.additionalProperties = { bsonType: 'object' };
              break;
            case String:
              entity.additionalProperties = { bsonType: 'string' };
              break;
            case Number:
              entity.additionalProperties = { bsonType: 'number' };
              break;
            case Boolean:
              entity.additionalProperties = { bsonType: 'bool' };
              break;
            case Date:
              entity.additionalProperties = { bsonType: 'date' };
              break;
            case BSON.ObjectId:
              entity.additionalProperties = { bsonType: 'objectId' };
              break;
            default:
              entity.additionalProperties = this.buildDocumentSchema(column);
          }
          break;
        case Aliases.Format.Object:
          entity.bsonType.push('object');
          if (column.model === Object) {
            entity.additionalProperties = true;
          } else {
            const result = this.buildDocumentSchema(column);
            entity.properties = result.properties;
            entity.additionalProperties = false;
            this.setProperty('required', entity, 'required', result);
          }
          break;
        default:
          throw new TypeError(`Unsupported column schema type '${type}'`);
      }
    }
    return entity;
  }

  /**
   * Build a new entity schema based on the specified row schema.
   * @param row Row schema.
   * @returns Returns the generated schema entity.
   */
  @Class.Public()
  public static build(row: Aliases.Columns.RealRow): Aliases.Entity {
    const entity = <Aliases.Entity>{
      bsonType: 'object',
      properties: <Aliases.Entity>{},
      additionalProperties: false
    };
    for (const column in row) {
      const schema = row[column];
      const name = schema.alias || schema.name;
      if (schema.required) {
        if (entity.required === void 0) {
          entity.required = [name];
        } else {
          entity.required.push(name);
        }
      }
      entity.properties[name] = this.buildPropertySchema(schema);
    }
    return entity;
  }
}
