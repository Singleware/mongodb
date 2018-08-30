/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Source from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Filters } from './filters';
import { Schemas } from './schemas';

/**
 * Mongo DB driver class.
 */
@Class.Describe()
export class Driver implements Mapping.Driver {
  /**
   * Driver connection.
   */
  @Class.Private()
  private connection?: Source.MongoClient;

  /**
   * Driver database.
   */
  @Class.Private()
  private database?: Source.Db;

  /**
   * Driver connection options.
   */
  @Class.Private()
  private options = {
    useNewUrlParser: true,
    ignoreUndefined: true
  };

  /**
   * Connect to the MongoDb URI.
   * @param uri Connection URI.
   */
  @Class.Public()
  public async connect(uri: string): Promise<void> {
    await new Promise<Source.Db>(
      (resolve: Function, reject: Function): void => {
        Source.MongoClient.connect(
          uri,
          this.options,
          (error: Source.MongoError, connection: Source.MongoClient) => {
            if (error) {
              reject(error);
            } else {
              this.connection = connection;
              this.database = connection.db();
              resolve();
            }
          }
        );
      }
    );
  }

  /**
   * Disconnect the current active connection.
   */
  @Class.Public()
  public async disconnect(): Promise<void> {
    return new Promise<void>(
      (resolve: Function, reject: Function): void => {
        (<Source.MongoClient>this.connection).close((error: Source.MongoError) => {
          if (error) {
            reject(error);
          } else {
            this.connection = void 0;
            this.database = void 0;
            resolve();
          }
        });
      }
    );
  }

  /**
   * Modifies the collection by the specified row schema.
   * @param collection Collection name.
   * @param schema Row schema.
   */
  @Class.Public()
  public async modify(collection: string, schema: Mapping.Row): Promise<void> {
    (<Source.Db>this.database).command({
      collMod: collection,
      validator: {
        $jsonSchema: Schemas.build(schema)
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
  }

  /**
   * Insert the specified entity into the database.
   * @param collection Collection name.
   * @param entities Entity data list.
   * @returns Returns the list inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Entity>(collection: string, ...entities: T[]): Promise<any[]> {
    const manager = (<Source.Db>this.database).collection(collection);
    const result = await manager.insertMany(entities);
    return Object.values(<any>result.insertedIds);
  }

  /**
   * Find the corresponding entity from the database.
   * @param collection Collection name.
   * @param filter Filter expression.
   * @returns Returns the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Entity>(collection: string, filter: Mapping.Expression): Promise<T[]> {
    const manager = (<Source.Db>this.database).collection(collection);
    const cursor = await manager.find(Filters.build(filter));
    return await cursor.toArray();
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param collection Collection name.
   * @param column Id column name.
   * @param id Entity id value.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Entity>(collection: string, column: string, id: any): Promise<T | undefined> {
    const filters = <Mapping.Entity>{};
    filters[column] = { operator: Mapping.Operators.EQUAL, value: id };
    return <T>(await this.find(collection, filters))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param collection Collection name.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns the number of updated entities.
   */
  @Class.Public()
  public async update<T extends Mapping.Entity>(collection: string, filter: Mapping.Expression, entity: T): Promise<number> {
    const manager = (<Source.Db>this.database).collection(collection);
    const result = await manager.updateMany(Filters.build(filter), { $set: entity });
    return result.modifiedCount;
  }

  /**
   * Update the entity that corresponds to the specified entity id.
   * @param collection Collection name.
   * @param column Column name.
   * @param id Entity id.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById<T extends Mapping.Entity>(collection: string, column: string, id: any, entity: T): Promise<boolean> {
    const filters = <Mapping.Entity>{};
    filters[column] = { operator: Mapping.Operators.EQUAL, value: id };
    return (await this.update(collection, filters, entity)) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param collection Collection name.
   * @param filter Filter columns.
   * @return Returns the number of deleted entities.
   */
  @Class.Public()
  public async delete<T extends Mapping.Entity>(collection: string, filter: Mapping.Expression): Promise<number> {
    const manager = (<Source.Db>this.database).collection(collection);
    const result = await manager.deleteMany(Filters.build(filter));
    return result.deletedCount || 0;
  }

  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param collection Collection name.
   * @param column Column name.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById<T extends Mapping.Entity>(collection: string, column: string, id: any): Promise<boolean> {
    const filters = <Mapping.Entity>{};
    filters[column] = { operator: Mapping.Operators.EQUAL, value: id };
    return (await this.delete(collection, filters)) === 1;
  }
}
