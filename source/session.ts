/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as MongoDb from 'mongodb';
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Engine from './engine';

/**
 * MongoDb session driver class.
 */
@Class.Describe()
export class Session extends Class.Null implements Types.Driver {
  /**
   * Session client.
   */
  @Class.Private()
  private client: MongoDb.MongoClient;

  /**
   * Session database.
   */
  @Class.Private()
  private database: MongoDb.Db;

  /**
   * Session options.
   */
  @Class.Private()
  private options?: MongoDb.SessionOptions;

  /**
   * Current session.
   */
  @Class.Private()
  private session?: MongoDb.ClientSession;

  /**
   * Default constructor.
   * @param client Session client.
   * @param input Specify a managed session instance or a dynamic session options.
   */
  constructor(client: MongoDb.MongoClient, input?: MongoDb.ClientSession | MongoDb.SessionOptions) {
    super();
    this.client = client;
    this.database = client.db();
    if (input instanceof Function) {
      this.session = <MongoDb.ClientSession>input;
    } else {
      this.options = <MongoDb.SessionOptions>input;
    }
  }

  /**
   * Perform the specified callback in the transactional mode.
   * @param callback Transaction callback.
   * @param options Transaction options.
   * @throws Throws an exception when there's any error in the transaction.
   * @returns Returns the same value returned by the given callback.
   */
  @Class.Public()
  public async transaction<T>(callback: () => Promise<T>, options?: MongoDb.TransactionOptions): Promise<T> {
    if (this.session !== void 0 && this.session.inTransaction()) {
      return await callback();
    } else {
      let dynamic = false;
      let result: any;
      let caught;
      try {
        if (this.session === void 0) {
          this.session = this.client.startSession(this.options);
          dynamic = true;
        }
        await this.session.withTransaction(async () => {
          result = await callback();
        }, options);
      } catch (exception) {
        caught = exception;
      } finally {
        if (dynamic) {
          this.session!.endSession();
          this.session = void 0;
        }
        if (caught) {
          throw caught;
        }
        return result;
      }
    }
  }

  /**
   * Insert all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns a promise to get the list of inserted entities.
   */
  @Class.Public()
  public async insert<E, R>(model: Types.Model<E>, entities: E[]): Promise<R[] | undefined> {
    const entries = entities.map((entity) => Types.Normalizer.create(model, entity, true, true));
    const collection = this.database.collection(Types.Schema.getStorageName(model));
    const result = await collection.insertMany(entries, { session: this.session });
    return Object.values(result.insertedIds);
  }

  /**
   * Find the corresponding entities from the database.
   * @param model Model type.
   * @param query Query filter.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Public()
  public async find<E>(model: Types.Model<E>, query: Types.Query, fields: string[]): Promise<E[] | undefined> {
    const pipeline = Engine.Pipeline.build(model, query, fields);
    const collection = this.database.collection(Types.Schema.getStorageName(model));
    const cursor = collection.aggregate(pipeline, { session: this.session, allowDiskUse: true });
    return await cursor.toArray();
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<E, I>(model: Types.Model<E>, id: I, fields: string[]): Promise<E | undefined> {
    const result = await this.find(model, { pre: Engine.Filter.primaryId(model, id) }, fields);
    if (result) {
      return result[0];
    }
    return void 0;
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  public async update<E>(model: Types.Model<E>, match: Types.Match, entity: E): Promise<number | undefined> {
    const entry = Types.Normalizer.create(model, entity, true, true, true);
    const filter = Engine.Match.build(model, match);
    const collection = this.database.collection(Types.Schema.getStorageName(model));
    const result = await collection.updateMany(filter, { $set: entry }, { session: this.session });
    return result.modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById<E, I>(model: Types.Model<E>, id: I, entity: E): Promise<boolean | undefined> {
    return (await this.update(model, Engine.Filter.primaryId(model, id), entity)) === 1;
  }

  /**
   * Replace the entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Public()
  public async replaceById<E, I>(model: Types.Model<E>, id: I, entity: E): Promise<boolean | undefined> {
    const entry = Types.Normalizer.create(model, entity, true, true);
    const filter = Engine.Match.build(model, Engine.Filter.primaryId(model, id));
    const collection = this.database.collection(Types.Schema.getStorageName(model));
    const result = await collection.replaceOne(filter, entry, { session: this.session });
    return result.modifiedCount === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param match Matching filter.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Types.Model, match: Types.Match): Promise<number | undefined> {
    const filter = Engine.Match.build(model, match);
    const collection = this.database.collection(Types.Schema.getStorageName(model));
    const result = await collection.deleteMany(filter, { session: this.session });
    return result.deletedCount ?? 0;
  }

  /**
   * Delete the entity that corresponds to the specified Id.
   * @param model Model type.
   * @param id Entity Id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById<I>(model: Types.Model, id: I): Promise<boolean | undefined> {
    return (await this.delete(model, Engine.Filter.primaryId(model, id))) === 1;
  }

  /**
   * Count all corresponding entities from the database.
   * @param model Model type.
   * @param query Query filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Public()
  public async count(model: Types.Model, query: Types.Query): Promise<number | undefined> {
    const pipeline = [...Engine.Pipeline.build(model, query, []), { $count: 'records' }];
    const collection = this.database.collection(Types.Schema.getStorageName(model));
    const cursor = collection.aggregate(pipeline, { session: this.session, allowDiskUse: true });
    return (await cursor.toArray())[0]?.records ?? 0;
  }
}
