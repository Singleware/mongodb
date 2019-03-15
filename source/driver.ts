/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Mongodb from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Fields } from './fields';
import { Filters } from './filters';
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
    await (<Mongodb.Db>this.database).command({ collMod: Mapping.Schema.getStorage(model), ...Driver.getCollectionSchema(model) });
  }

  /**
   * Creates a new collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async createCollection(model: Mapping.Types.Model): Promise<void> {
    await (<Mongodb.Db>this.database).command({ create: Mapping.Schema.getStorage(model), ...Driver.getCollectionSchema(model) });
  }

  /**
   * Determines whether the collection from the specified model exists or not.
   * @param model Model type.
   * @returns Returns true when the collection exists, false otherwise.
   */
  @Class.Public()
  public async hasCollection(model: Mapping.Types.Model): Promise<boolean> {
    return (await (<Mongodb.Db>this.database).listCollections({ name: Mapping.Schema.getStorage(model) }).toArray()).length === 1;
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param view View mode.
   * @param entities Entity list.
   * @returns Returns the list inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, view: string, entities: T[]): Promise<string[]> {
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return Object.values((<any>await manager.insertMany(entities)).insertedIds);
  }

  /**
   * Find the corresponding entities from the database.
   * @param model Model type.
   * @param view View mode.
   * @param filter Field filters.
   * @param sort Sorting fields.
   * @param limit Result limits.
   * @returns Returns the  promise to get the list of entities found.
   * @returns Returns the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Types.Entity>(
    model: Mapping.Types.Model<T>,
    view: string,
    filter: Mapping.Statements.Filter,
    sort?: Mapping.Statements.Sort,
    limit?: Mapping.Statements.Limit
  ): Promise<T[]> {
    const pipeline = <any[]>[];
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    Fields.applyFilters(pipeline, model, filter);
    Fields.applyRelations(pipeline, model, view);
    let cursor = manager.aggregate(pipeline);
    if (sort) {
      cursor = cursor.sort(Fields.getSorting(sort));
    }
    if (limit) {
      cursor = limit ? cursor.skip(limit.start).limit(limit.count) : cursor;
    }
    return Fields.purgeNull(model, view, await cursor.toArray());
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param view View mode.
   * @param id Entity id.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, view: string, id: any): Promise<T | undefined> {
    return (await this.find<T>(model, view, Fields.getPrimaryFilter(model, id)))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param view View mode.
   * @param filter Fields filter.
   * @param entity Entity to be updated.
   * @returns Returns the number of updated entities.
   */
  @Class.Public()
  public async update(
    model: Mapping.Types.Model,
    view: string,
    filter: Mapping.Statements.Filter,
    entity: Mapping.Types.Entity
  ): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return (await manager.updateMany(Filters.build(model, filter), { $set: entity })).modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param view View mode.
   * @param id Entity id.
   * @param entity Entity to be updated.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Mapping.Types.Model, view: string, id: any, entity: Mapping.Types.Model): Promise<boolean> {
    return (await this.update(model, view, Fields.getPrimaryFilter(model, id), entity)) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Fields filter.
   * @return Returns the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Mapping.Schema.getStorage(model));
    return (await manager.deleteMany(Filters.build(model, filter))).deletedCount || 0;
  }

  /**
   * Deletes the entity that corresponds to the specified id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Mapping.Types.Model, id: any): Promise<boolean> {
    return (await this.delete(model, Fields.getPrimaryFilter(model, id))) === 1;
  }
}
