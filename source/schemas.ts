/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as BSON from './bson';

/**
 * Mongo DB schemas class.
 */
@Class.Describe()
export class Schemas extends Class.Null {
  /**
   * Sets the specified target property if the source property has any data.
   * @param to Target property.
   * @param target Target entity.
   * @param from Source property.
   * @param source Source entity.
   */
  @Class.Private()
  private static setProperty(to: string, target: Mapping.Types.Entity, from: string, source: Mapping.Types.Entity): void {
    if (source[from] !== void 0) {
      target[to] = source[from];
    }
  }

  /**
   * Sets the number range.
   * @param entity Target entity.
   * @param column Source column.
   */
  @Class.Private()
  private static setNumberRange(entity: Mapping.Types.Entity, column: Mapping.Columns.Real): void {
    Schemas.setProperty('minimum', entity, 'minimum', column);
    Schemas.setProperty('maximum', entity, 'maximum', column);
  }

  /**
   * Sets the string range.
   * @param entity Target entity.
   * @param column Source column.
   */
  @Class.Private()
  private static setStringRange(entity: Mapping.Types.Entity, column: Mapping.Columns.Real): void {
    Schemas.setProperty('minLength', entity, 'minimum', column);
    Schemas.setProperty('maxLength', entity, 'maximum', column);
  }

  /**
   * Sets the array range.
   * @param entity Target entity.
   * @param column Source column.
   */
  @Class.Private()
  private static setArrayRange(entity: Mapping.Types.Entity, column: Mapping.Columns.Real): void {
    Schemas.setProperty('minItems', entity, 'minimum', column);
    Schemas.setProperty('maxItems', entity, 'maximum', column);
  }

  /**
   * Build a column schema entity based on the specified column schema.
   * @param column Column Schema.
   * @returns Return the generated column schema entity.
   * @throws Throws an error when the column type is unsupported.
   */
  @Class.Private()
  private static buildSchema(column: Mapping.Columns.Real): Mapping.Types.Entity {
    const entity = <Mapping.Types.Entity>{ bsonType: [] };
    for (const type of column.formats) {
      switch (type) {
        case Mapping.Types.Format.ID:
          entity.bsonType.push('objectId');
          break;
        case Mapping.Types.Format.NULL:
          entity.bsonType.push('null');
          break;
        case Mapping.Types.Format.BINARY:
          entity.bsonType.push('binData');
          break;
        case Mapping.Types.Format.BOOLEAN:
          entity.bsonType.push('bool');
          break;
        case Mapping.Types.Format.INTEGER:
          entity.bsonType.push('int');
          Schemas.setNumberRange(entity, column);
          break;
        case Mapping.Types.Format.DECIMAL:
          entity.bsonType.push('double');
          Schemas.setNumberRange(entity, column);
          break;
        case Mapping.Types.Format.NUMBER:
          entity.bsonType.push('number');
          Schemas.setNumberRange(entity, column);
          break;
        case Mapping.Types.Format.STRING:
          entity.bsonType.push('string');
          Schemas.setStringRange(entity, column);
          break;
        case Mapping.Types.Format.ENUMERATION:
          entity.bsonType.push('string');
          entity.enum = column.values;
          break;
        case Mapping.Types.Format.PATTERN:
          const pattern = (<RegExp>column.pattern).toString();
          entity.bsonType.push('string');
          entity.pattern = pattern.substring(1, pattern.lastIndexOf('/'));
          break;
        case Mapping.Types.Format.TIMESTAMP:
          entity.bsonType.push('timestamp');
          break;
        case Mapping.Types.Format.DATE:
          entity.bsonType.push('date');
          break;
        case Mapping.Types.Format.ARRAY:
          entity.bsonType.push('array');
          Schemas.setArrayRange(entity, column);
          Schemas.setProperty('uniqueItems', entity, 'unique', column);
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
            case BSON.ObjectID:
              entity.items = { bsonType: 'objectId' };
              break;
            default:
              entity.items = Schemas.build(column.schema || {});
          }
          break;
        case Mapping.Types.Format.MAP:
          entity.bsonType.push('object');
          switch (column.model) {
            case Object:
              entity.additionalProperties = true;
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
            case BSON.ObjectID:
              entity.additionalProperties = { bsonType: 'objectId' };
              break;
            default:
              entity.additionalProperties = Schemas.build(column.schema || {});
          }
          break;
        case Mapping.Types.Format.OBJECT:
          const result = Schemas.build(column.schema || {});
          entity.bsonType.push('object');
          entity.properties = result.properties;
          entity.additionalProperties = false;
          Schemas.setProperty('required', entity, 'required', result);
          break;
        default:
          throw new TypeError(`Unsupported column schema type '${type}'`);
      }
    }
    return entity;
  }

  /**
   * Build a schema entity based on the specified row schema.
   * @param row Row schema.
   * @returns Returns the generated schema entity.
   */
  @Class.Public()
  public static build(row: Mapping.Columns.RealRow): Mapping.Types.Entity {
    const entity = {
      bsonType: 'object',
      required: <string[]>[],
      properties: <Mapping.Types.Entity>{},
      additionalProperties: false
    };
    for (const column in row) {
      const schema = row[column];
      const name = schema.alias || column;
      if (schema.required) {
        entity.required.push(name);
      }
      entity.properties[name] = Schemas.buildSchema(schema);
    }
    if (entity.required.length === 0) {
      delete entity.required;
    }
    return entity;
  }
}
