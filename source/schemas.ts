/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import * as BSON from './bson';

/**
 * MongoDb schemas class.
 */
@Class.Describe()
export class Schemas extends Class.Null {
  /**
   * Sets the specified target property whether the source property has any data.
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
   * Build the schema properties based on the specified column schema.
   * @param real Real column Schema.
   * @returns Return the generated schema properties.
   * @throws Throws an error when the column type is unsupported.
   */
  @Class.Private()
  private static buildProperties(real: Mapping.Columns.Real): Mapping.Types.Entity {
    const entity = <Mapping.Types.Entity>{ bsonType: [] };
    for (const type of real.formats) {
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
          Schemas.setProperty('minimum', entity, 'minimum', real);
          Schemas.setProperty('maximum', entity, 'maximum', real);
          break;
        case Mapping.Types.Format.DECIMAL:
          entity.bsonType.push('double');
          Schemas.setProperty('minimum', entity, 'minimum', real);
          Schemas.setProperty('maximum', entity, 'maximum', real);
          break;
        case Mapping.Types.Format.NUMBER:
          entity.bsonType.push('number');
          Schemas.setProperty('minimum', entity, 'minimum', real);
          Schemas.setProperty('maximum', entity, 'maximum', real);
          break;
        case Mapping.Types.Format.STRING:
          entity.bsonType.push('string');
          Schemas.setProperty('minLength', entity, 'minimum', real);
          Schemas.setProperty('maxLength', entity, 'maximum', real);
          break;
        case Mapping.Types.Format.ENUMERATION:
          entity.bsonType.push('string');
          entity.enum = real.values;
          break;
        case Mapping.Types.Format.PATTERN:
          const pattern = (<RegExp>real.pattern).toString();
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
          Schemas.setProperty('minItems', entity, 'minimum', real);
          Schemas.setProperty('maxItems', entity, 'maximum', real);
          Schemas.setProperty('uniqueItems', entity, 'unique', real);
          switch (real.model) {
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
              entity.items = Schemas.build(real.schema || {});
          }
          break;
        case Mapping.Types.Format.MAP:
          entity.bsonType.push('object');
          switch (real.model) {
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
              entity.additionalProperties = Schemas.build(real.schema || {});
          }
          break;
        case Mapping.Types.Format.OBJECT:
          const result = Schemas.build(real.schema || {});
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
   * @param real Real row schema.
   * @returns Returns the generated schema entity.
   */
  @Class.Public()
  public static build(real: Mapping.Columns.RealRow): Mapping.Types.Entity {
    const entity = <Mapping.Types.Entity>{
      bsonType: 'object',
      properties: <Mapping.Types.Entity>{},
      additionalProperties: false
    };
    for (const column in real) {
      const schema = real[column];
      const name = schema.alias || schema.name;
      if (schema.required) {
        if (entity.required === void 0) {
          entity.required = [name];
        } else {
          entity.required.push(name);
        }
      }
      entity.properties[name] = Schemas.buildProperties(schema);
    }
    return entity;
  }
}
