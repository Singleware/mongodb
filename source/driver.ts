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
    useUnifiedTopology: true,
    ignoreUndefined: true
  };

  /**
   * Client instance.
   */
  @Class.Private()
  private client?: Mongodb.MongoClient;

  /**
   * Client session.
   */
  @Class.Private()
  private session?: Mongodb.ClientSession;

  /**
   * Check if there's an active connection.
   * @throws Throws an error when there's no active connection.
   */
  @Class.Private()
  private isActiveConnection(client: any): client is Mongodb.MongoClient {
    if (client === void 0) {
      throw new Error(`No connection found.`);
    }
    return true;
  }

  /**
   * Build and get the collection schema.
   * @param model Model type.
   * @returns Returns the collection validation object.
   */
  @Class.Private()
  private getCollectionSchema(model: Aliases.Model): Object {
    return {
      validator: {
        $jsonSchema: Engine.Schema.build(Aliases.Schema.getRealRow(model))
      },
      validationLevel: 'strict',
      validationAction: 'error'
    };
  }

  /**
   * Connect to the specified URI.
   * @param uri Connection URI.
   * @param options Connection options.
   * @throws Throws an error when there's an active connection.
   */
  @Class.Public()
  public async connect(uri: string, options?: Mongodb.MongoClientOptions): Promise<void> {
    if (this.client) {
      throw new Error(`An active connection was found.`);
    }
    this.client = await Mongodb.MongoClient.connect(uri, <Mongodb.MongoClientOptions>{
      ...Driver.options,
      ...options
    });
    this.client.on('close', () => {
      this.client = void 0;
    });
  }

  /**
   * Disconnect the active connection.
   * @throws Throws an error when there's no active connection.
   */
  @Class.Public()
  public async disconnect(): Promise<void> {
    if (this.isActiveConnection(this.client)) {
      await this.client.close();
    }
  }

  /**
   * Modify the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async modifyCollection(model: Class.Constructor<Aliases.Entity>): Promise<void> {
    if (this.isActiveConnection(this.client)) {
      await this.client.db().command({
        collMod: Aliases.Schema.getStorageName(model),
        ...this.getCollectionSchema(model)
      });
    }
  }

  /**
   * Creates a new collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async createCollection(model: Aliases.Model): Promise<void> {
    if (this.isActiveConnection(this.client)) {
      await this.client.db().command({
        create: Aliases.Schema.getStorageName(model),
        ...this.getCollectionSchema(model)
      });
    }
  }

  /**
   * Determines whether or not the collection for the given model type exists.
   * @param model Model type.
   * @returns Returns a promise to get true when the collection exists, false otherwise.
   */
  @Class.Public()
  public async hasCollection(model: Aliases.Model): Promise<boolean> {
    if (this.isActiveConnection(this.client)) {
      const filter = { name: Aliases.Schema.getStorageName(model) };
      const manager = this.client.db();
      const options = { nameOnly: true };
      const result = await manager.listCollections(filter, options).toArray();
      return result.length === 1;
    }
    return false;
  }

  /**
   * Run the specified callback in the transactional mode.
   * @param callback Transaction callback.
   * @param options Transaction options.
   * @throws Throws an exception when there's any error in the transaction.
   * @returns Returns the same value returned by the given callback.
   */
  @Class.Public()
  public async runTransaction<T>(callback: () => Promise<T>, options?: Mongodb.TransactionOptions): Promise<T> {
    let result: T;
    if (this.isActiveConnection(this.client)) {
      if (!this.session) {
        let caught;
        this.session = this.client.startSession();
        try {
          await this.session.withTransaction(async () => (result = await callback()), options);
        } catch (exception) {
          caught = exception;
        } finally {
          await this.session.endSession();
          this.session = void 0;
          if (caught) {
            throw caught;
          }
        }
      } else {
        result = await callback();
      }
    }
    return result!;
  }

  /**
   * Insert all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns a promise to get the list of inserted entities.
   */
  @Class.Public()
  public async insert<T extends Aliases.Entity>(model: Aliases.Model<T>, entities: T[]): Promise<string[]> {
    if (this.isActiveConnection(this.client)) {
      const entries = entities.map(entity => Aliases.Normalizer.create(model, entity, true, true));
      const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
      const options = { session: this.session };
      const result = await manager.insertMany(entries, options);
      return Object.values(result.insertedIds);
    }
    return [];
  }

  /**
   * Find the corresponding entities from the database.
   * @param model Model type.
   * @param query Query filter.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Public()
  public async find<T extends Aliases.Entity>(
    model: Aliases.Model<T>,
    query: Aliases.Query,
    fields: string[]
  ): Promise<T[]> {
    if (this.isActiveConnection(this.client)) {
      const pipeline = Engine.Pipeline.build(model, query, fields);
      const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
      const options = { session: this.session, allowDiskUse: true };
      const result = await manager.aggregate(pipeline, options).toArray();
      return result;
    }
    return [];
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Aliases.Entity>(
    model: Aliases.Model<T>,
    id: any,
    fields: string[]
  ): Promise<T | undefined> {
    const match = Engine.Filter.primaryId(model, id);
    const result = await this.find(model, { pre: match }, fields);
    return result[0];
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
    if (this.isActiveConnection(this.client)) {
      const entry = Aliases.Normalizer.create(model, entity, true, true, true);
      const filter = Engine.Match.build(model, match);
      const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
      const options = { session: this.session };
      const result = await manager.updateMany(filter, { $set: entry }, options);
      return result.modifiedCount;
    }
    return 0;
  }

  /**
   * Updates the entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Aliases.Model, id: any, entity: Aliases.Model): Promise<boolean> {
    const match = Engine.Filter.primaryId(model, id);
    const result = await this.update(model, match, entity);
    return result === 1;
  }

  /**
   * Replace the entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Public()
  public async replaceById(model: Aliases.Model, id: any, entity: Aliases.Model): Promise<boolean> {
    if (this.isActiveConnection(this.client)) {
      const entry = Aliases.Normalizer.create(model, entity, true, true);
      const match = Engine.Filter.primaryId(model, id);
      const filter = Engine.Match.build(model, match);
      const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
      const options = { session: this.session };
      const result = await manager.replaceOne(filter, entry, options);
      return result.modifiedCount === 1;
    }
    return false;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param match Matching filter.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Aliases.Model, match: Aliases.Match): Promise<number> {
    if (this.isActiveConnection(this.client)) {
      const filter = Engine.Match.build(model, match);
      const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
      const option = { session: this.session };
      const result = await manager.deleteMany(filter, option);
      return result.deletedCount ?? 0;
    }
    return 0;
  }

  /**
   * Delete the entity that corresponds to the specified Id.
   * @param model Model type.
   * @param id Entity Id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Aliases.Model, id: any): Promise<boolean> {
    const match = Engine.Filter.primaryId(model, id);
    const result = await this.delete(model, match);
    return result === 1;
  }

  /**
   * Count all corresponding entities from the database.
   * @param model Model type.
   * @param query Query filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Public()
  public async count(model: Aliases.Model, query: Aliases.Query): Promise<number> {
    if (this.isActiveConnection(this.client)) {
      const pipeline = [...Engine.Pipeline.build(model, query, []), { $count: 'records' }];
      const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
      const option = { session: this.session, allowDiskUse: true };
      const result = await manager.aggregate(pipeline, option).toArray();
      return result[0]?.records ?? 0;
    }
    return 0;
  }
}
