/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Source from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

/**
 * Mongo DB schemas class.
 */
@Class.Describe()
export class Schemas {
  /**
   * Sets the specified property if the source property has any data.
   * @param to Target property.
   * @param target Target entity.
   * @param from Source property.
   * @param source Source entity.
   */
  @Class.Private()
  private static setProperty(to: string, target: Mapping.Entity, from: string, source: Mapping.Entity): void {
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
  private static setNumberRange(entity: Mapping.Entity, column: Mapping.Column): void {
    Schemas.setProperty('minimum', entity, 'minimum', column);
    Schemas.setProperty('maximum', entity, 'maximum', column);
  }

  /**
   * Sets the string range.
   * @param entity Target entity.
   * @param column Source column.
   */
  @Class.Private()
  private static setStringRange(entity: Mapping.Entity, column: Mapping.Column): void {
    Schemas.setProperty('minLength', entity, 'minimum', column);
    Schemas.setProperty('maxLength', entity, 'maximum', column);
  }

  /**
   * Sets the array range.
   * @param entity Target entity.
   * @param column Source column.
   */
  @Class.Private()
  private static setArrayRange(entity: Mapping.Entity, column: Mapping.Column): void {
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
  private static buildSchema(column: Mapping.Column): Mapping.Entity {
    const entity = <Mapping.Entity>{ bsonType: [] };
    for (const type of column.types) {
      switch (type) {
        case Mapping.Format.ID:
          entity.bsonType.push('objectId');
          break;
        case Mapping.Format.NULL:
          entity.bsonType.push('null');
          break;
        case Mapping.Format.BINARY:
          entity.bsonType.push('binData');
          break;
        case Mapping.Format.BOOLEAN:
          entity.bsonType.push('bool');
          break;
        case Mapping.Format.INTEGER:
          entity.bsonType.push('int');
          Schemas.setNumberRange(entity, column);
          break;
        case Mapping.Format.DECIMAL:
          entity.bsonType.push('double');
          Schemas.setNumberRange(entity, column);
          break;
        case Mapping.Format.NUMBER:
          entity.bsonType.push('number');
          Schemas.setNumberRange(entity, column);
          break;
        case Mapping.Format.STRING:
          entity.bsonType.push('string');
          Schemas.setStringRange(entity, column);
          break;
        case Mapping.Format.ENUMERATION:
          entity.bsonType.push('string');
          entity.enum = column.values;
          break;
        case Mapping.Format.PATTERN:
          const pattern = (<RegExp>column.pattern).toString();
          entity.bsonType.push('string');
          entity.pattern = pattern.substring(1, pattern.lastIndexOf('/'));
          break;
        case Mapping.Format.TIMESTAMP:
          entity.bsonType.push('timestamp');
          break;
        case Mapping.Format.DATE:
          entity.bsonType.push('date');
          break;
        case Mapping.Format.ARRAY:
          entity.bsonType.push('array');
          Schemas.setArrayRange(entity, column);
          Schemas.setProperty('uniqueItems', entity, 'unique', column);
          switch (column.model) {
            case Source.ObjectID:
              entity.items = { bsonType: 'objectId' };
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
            default:
              entity.items = Schemas.build(column.schema || {});
          }
          break;
        case Mapping.Format.MAP:
          entity.bsonType.push('object');
          switch (column.model) {
            case Source.ObjectID:
              entity.additionalProperties = { bsonType: 'objectId' };
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
            default:
              entity.additionalProperties = Schemas.build(column.schema || {});
          }
          break;
        case Mapping.Format.OBJECT:
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
  public static build(row: Mapping.Map<Mapping.Column>): Mapping.Entity {
    const entity = {
      bsonType: 'object',
      required: <string[]>[],
      properties: <Mapping.Entity>{},
      additionalProperties: false
    };

    for (const name in row) {
      const column = row[name];
      const key = column.alias || name;
      if (column.required) {
        entity.required.push(key);
      }
      entity.properties[key] = Schemas.buildSchema(column);
    }

    if (entity.required.length === 0) {
      delete entity.required;
    }

    return entity;
  }
}
