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
   * Gets the collection name from the specified model type.
   * @param model Mode type.
   * @returns Returns the collection name.
   * @throws Throws an error when the model type isn't valid.
   */
  @Class.Private()
  private static getCollectionName(model: Mapping.Types.Model): string {
    const name = Mapping.Schema.getStorage(model);
    if (!name) {
      throw new Error(`There is no collection name for the specified model type.`);
    }
    return name;
  }

  /**
   * Build and get the collection schema.
   * @param model Model type.
   * @returns Returns the collection validation object.
   */
  @Class.Private()
  private static getCollectionSchema(model: Mapping.Types.Model): Object {
    const schema = Mapping.Schema.getRealRow(model);
    if (!schema) {
      throw new TypeError(`The specified model type is not valid.`);
    }
    return {
      validator: {
        $jsonSchema: Schemas.build(schema)
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
      collMod: Driver.getCollectionName(model),
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
      create: Driver.getCollectionName(model),
      ...Driver.getCollectionSchema(model)
    });
  }

  /**
   * Determines whether the collection from the specified model exists or not.
   * @param model Model type.
   * @returns Returns true when the collection exists, false otherwise.
   */
  @Class.Public()
  public async hasCollection(model: Mapping.Types.Model): Promise<boolean> {
    return (await (<Mongodb.Db>this.database).listCollections({ name: Driver.getCollectionName(model) }).toArray()).length === 1;
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns the list inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, entities: T[]): Promise<string[]> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    return Object.values((<any>await manager.insertMany(entities)).insertedIds);
  }

  /**
   * Finds the corresponding entity from the database.
   * @param model Model type.
   * @param joins List of joins.
   * @param filter Field filters.
   * @param sort Sorting fields.
   * @param limit Result limits.
   * @returns Returns the  promise to get the list of entities found.
   * @returns Returns the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Types.Entity>(
    model: Mapping.Types.Model<T>,
    joins: Mapping.Statements.Join[],
    filter: Mapping.Statements.Filter,
    sort?: Mapping.Statements.Sort,
    limit?: Mapping.Statements.Limit
  ): Promise<T[]> {
    const pipeline = <any[]>[];
    const virtual = <Mapping.Columns.VirtualRow>Mapping.Schema.getVirtualRow(model);
    const real = <Mapping.Columns.RealRow>Mapping.Schema.getRealRow(model);
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    Fields.applyFilters(model, pipeline, filter);
    Fields.applyRelations(pipeline, Fields.getGrouping(real, virtual), joins);
    let cursor = manager.aggregate(pipeline);
    if (sort) {
      cursor = cursor.sort(Fields.getSorting(sort));
    }
    if (limit) {
      cursor = limit ? cursor.skip(limit.start).limit(limit.count) : cursor;
    }
    return Fields.purgeNull(real, await cursor.toArray());
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param joins List of joins.
   * @param id Entity id.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Types.Entity>(
    model: Mapping.Types.Model<T>,
    joins: Mapping.Statements.Join[],
    id: any
  ): Promise<T | undefined> {
    return (await this.find<T>(model, joins, Fields.getPrimaryFilter(model, id)))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param entity Entity to be updated.
   * @param filter Fields filter.
   * @returns Returns the number of updated entities.
   */
  @Class.Public()
  public async update(model: Mapping.Types.Model, entity: Mapping.Types.Entity, filter: Mapping.Statements.Filter): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const result = await manager.updateMany(Filters.build(model, filter), { $set: entity });
    return result.modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param entity Entity to be updated.
   * @param id Entity id.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Mapping.Types.Model, entity: Mapping.Types.Model, id: any): Promise<boolean> {
    return (await this.update(model, entity, Fields.getPrimaryFilter(model, id))) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Fields filter.
   * @return Returns the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
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
