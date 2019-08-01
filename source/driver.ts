/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Mongodb from 'mongodb';
import * as Class from '@singleware/class';

import * as Aliases from './aliases';
import * as Engine from './engine';

/**
 * MongoDb driver class.
 */
@Class.Describe()
export class Driver extends Class.Null implements Aliases.Driver {
  /**
   * Connection options.
   */
  @Class.Private()
  private static options = {
    useNewUrlParser: true,
    ignoreUndefined: true
  };

  /**
   * Connection instance.
   */
  @Class.Private()
  private connection?: Mongodb.MongoClient;

  /**
   * Current database.
   */
  @Class.Private()
  private database?: Mongodb.Db;

  /**
   * Build and get the collection schema.
   * @param model Model type.
   * @returns Returns the collection validation object.
   */
  @Class.Private()
  private static getCollectionSchema(model: Aliases.Model): Object {
    return {
      validator: {
        $jsonSchema: Engine.Schema.build(Aliases.Schema.getRealRow(model))
      },
      validationLevel: 'strict',
      validationAction: 'error'
    };
  }

  /**
   * Connect to the URI.
   * @param uri Connection URI.
   */
  @Class.Public()
  public async connect(uri: string): Promise<void> {
    await new Promise<Mongodb.Db>((resolve: Function, reject: Function): void => {
      Mongodb.MongoClient.connect(uri, Driver.options, (error: Mongodb.MongoError, connection: Mongodb.MongoClient) => {
        if (error) {
          reject(error);
        } else {
          this.connection = connection;
          this.database = connection.db();
          resolve();
        }
      });
    });
  }

  /**
   * Disconnect any active connection.
   */
  @Class.Public()
  public async disconnect(): Promise<void> {
    return new Promise<void>((resolve: Function, reject: Function): void => {
      (<Mongodb.MongoClient>this.connection).close((error: Mongodb.MongoError) => {
        if (error) {
          reject(error);
        } else {
          this.connection = void 0;
          this.database = void 0;
          resolve();
        }
      });
    });
  }

  /**
   * Modify the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async modifyCollection(model: Class.Constructor<Aliases.Entity>): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      collMod: Aliases.Schema.getStorageName(model),
      ...Driver.getCollectionSchema(model)
    });
  }

  /**
   * Creates a new collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async createCollection(model: Aliases.Model): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      create: Aliases.Schema.getStorageName(model),
      ...Driver.getCollectionSchema(model)
    });
  }

  /**
   * Determines whether the collection from the specified model exists or not.
   * @param model Model type.
   * @returns Returns a promise to get true when the collection exists, false otherwise.
   */
  @Class.Public()
  public async hasCollection(model: Aliases.Model): Promise<boolean> {
    const filter = { name: Aliases.Schema.getStorageName(model) };
    return (await (<Mongodb.Db>this.database).listCollections(filter, { nameOnly: true }).toArray()).length === 1;
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns a promise to get the list of inserted entities.
   */
  @Class.Public()
  public async insert<T extends Aliases.Entity>(model: Aliases.Model<T>, entities: T[]): Promise<string[]> {
    const manager = (<Mongodb.Db>this.database).collection(Aliases.Schema.getStorageName(model));
    return Object.values((<any>await manager.insertMany(entities)).insertedIds);
  }

  /**
   * Find the corresponding entities from the database.
   * @param model Model type.
   * @param query Query filter.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Public()
  public async find<T extends Aliases.Entity>(model: Aliases.Model<T>, query: Aliases.Query, fields: string[]): Promise<T[]> {
    const manager = (<Mongodb.Db>this.database).collection(Aliases.Schema.getStorageName(model));
    return (await manager.aggregate(Engine.Pipeline.build(model, query, fields), { allowDiskUse: true })).toArray();
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Aliases.Entity>(model: Aliases.Model<T>, id: any, fields: string[]): Promise<T | undefined> {
    return (await this.find(model, { pre: Engine.Filter.byPrimaryId(model, id) }, fields))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  public async update(model: Aliases.Model, match: Aliases.Match, entity: Aliases.Entity): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Aliases.Schema.getStorageName(model));
    return (await manager.updateMany(Engine.Match.build(model, match), { $set: entity })).modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Aliases.Model, id: any, entity: Aliases.Model): Promise<boolean> {
    return (await this.update(model, Engine.Filter.byPrimaryId(model, id), entity)) === 1;
  }

  /**
   * Replace the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Public()
  public async replaceById(model: Aliases.Model, id: any, entity: Aliases.Model): Promise<boolean> {
    const manager = (<Mongodb.Db>this.database).collection(Aliases.Schema.getStorageName(model));
    return (await manager.replaceOne(Engine.Match.build(model, Engine.Filter.byPrimaryId(model, id)), entity)).modifiedCount === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param match Matching filter.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Aliases.Model, match: Aliases.Match): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Aliases.Schema.getStorageName(model));
    return (await manager.deleteMany(Engine.Match.build(model, match))).deletedCount || 0;
  }

  /**
   * Deletes the entity that corresponds to the specified id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Aliases.Model, id: any): Promise<boolean> {
    return (await this.delete(model, Engine.Filter.byPrimaryId(model, id))) === 1;
  }

  /**
   * Count all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Public()
  public async count(model: Aliases.Model, query: Aliases.Query): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Aliases.Schema.getStorageName(model));
    const pipeline = [...Engine.Pipeline.build(model, query, []), { $count: 'records' }];
    const result = await manager.aggregate(pipeline, { allowDiskUse: true }).toArray();
    return result.length ? result[0].records || 0 : 0;
  }
}
