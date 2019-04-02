/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Mongodb from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Filters } from './filters';
import { Matches } from './matches';
import { Schemas } from './schemas';

/**
 * MongoDb driver class.
 */
@Class.Describe()
export class Driver extends Class.Null implements Mapping.Driver {
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
  private static getCollectionSchema(model: Mapping.Types.Model): Object {
    return {
      validator: {
        $jsonSchema: Schemas.build(Mapping.Schema.getRealRow(model, Mapping.Types.View.ALL))
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
    await new Promise<Mongodb.Db>(
      (resolve: Function, reject: Function): void => {
        Mongodb.MongoClient.connect(uri, Driver.options, (error: Mongodb.MongoError, connection: Mongodb.MongoClient) => {
          if (error) {
            reject(error);
          } else {
            this.connection = connection;
            this.database = connection.db();
            resolve();
          }
        });
      }
    );
  }

  /**
   * Disconnect any active connection.
   */
  @Class.Public()
  public async disconnect(): Promise<void> {
    return new Promise<void>(
      (resolve: Function, reject: Function): void => {
        (<Mongodb.MongoClient>this.connection).close((error: Mongodb.MongoError) => {
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
   * Modify the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async modifyCollection(model: Class.Constructor<Mapping.Types.Entity>): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      collMod: Mapping.Schema.getStorage(model),
      ...Driver.getCollectionSchema(model)
    });
  }

  /**
   * Creates a new collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async createCollection(model: Mapping.Types.Model): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      create: Mapping.Schema.getStorage(model),
      ...Driver.getCollectionSchema(model)
    });
  }

  /**
   * Determines whether the collection from the specified model exists or not.
   * @param model Model type.
   * @returns Returns a promise to get true when the collection exists, false otherwise.
   */
  @Class.Public()
  public async hasCollection(model: Mapping.Types.Model): Promise<boolean> {
    const filter = { name: Mapping.Schema.getStorage(model) };
    const options = { nameOnly: true };
    return (await (<Mongodb.Db>this.database).listCollections(filter, options).toArray()).length === 1;
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param views View modes.
   * @param entities Entity list.
   * @returns Returns a promise to get the list of inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, views: string[], entities: T[]): Promise<string[]> {
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return Object.values((<any>await manager.insertMany(entities)).insertedIds);
  }

  /**
   * Find the corresponding entities from the database.
   * @param model Model type.
   * @param views View modes.
   * @param filter Field filter.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, views: string[], filter: Mapping.Statements.Filter): Promise<T[]> {
    const pipeline = Filters.getPipeline(model, views, filter);
    const options = { allowDiskUse: true };
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return (await manager.aggregate(pipeline, options)).toArray();
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param views View modes.
   * @param id Entity id.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, views: string[], id: any): Promise<T | undefined> {
    return (await this.find(model, views, { pre: Filters.getPrimaryIdMatch(model, id) }))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param views View modes.
   * @param match Matching fields.
   * @param entity Entity to be updated.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  public async update(model: Mapping.Types.Model, views: string[], match: Mapping.Statements.Match, entity: Mapping.Types.Entity): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return (await manager.updateMany(Matches.build(model, match), { $set: entity })).modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param views View modes.
   * @param id Entity id.
   * @param entity Entity to be updated.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Mapping.Types.Model, views: string[], id: any, entity: Mapping.Types.Model): Promise<boolean> {
    return (await this.update(model, views, Filters.getPrimaryIdMatch(model, id), entity)) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param match Matching fields.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Mapping.Types.Model, match: Mapping.Statements.Match): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return (await manager.deleteMany(Matches.build(model, match))).deletedCount || 0;
  }

  /**
   * Deletes the entity that corresponds to the specified id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Mapping.Types.Model, id: any): Promise<boolean> {
    return (await this.delete(model, Filters.getPrimaryIdMatch(model, id))) === 1;
  }

  /**
   * Count all corresponding entities from the storage.
   * @param model Model type.
   * @param views View modes.
   * @param filter Field field.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Public()
  public async count(model: Mapping.Types.Model, views: string[], filter: Mapping.Statements.Filter): Promise<number> {
    const pipeline = [...Filters.getPipeline(model, views, filter), { $count: 'records' }];
    const options = { allowDiskUse: true };
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return (await manager.aggregate(pipeline, options).toArray())[0].records || 0;
  }
}
