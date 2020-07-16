/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as MongoDb from 'mongodb';
import * as Class from '@singleware/class';
import * as Types from './types';
/**
 * MongoDb session driver class.
 */
export declare class Session extends Class.Null implements Types.Driver {
    /**
     * Session client.
     */
    private client;
    /**
     * Session database.
     */
    private database;
    /**
     * Session options.
     */
    private options?;
    /**
     * Current session.
     */
    private session?;
    /**
     * Default constructor.
     * @param client Session client.
     * @param input Specify a managed session instance or a dynamic session options.
     */
    constructor(client: MongoDb.MongoClient, input?: MongoDb.ClientSession | MongoDb.SessionOptions);
    /**
     * Perform the specified callback in the transactional mode.
     * @param callback Transaction callback.
     * @param options Transaction options.
     * @throws Throws an exception when there's any error in the transaction.
     * @returns Returns the same value returned by the given callback.
     */
    transaction<T>(callback: () => Promise<T>, options?: MongoDb.TransactionOptions): Promise<T>;
    /**
     * Insert all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    insert<E, R>(model: Types.Model<E>, entities: E[]): Promise<R[] | undefined>;
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    find<E>(model: Types.Model<E>, query: Types.Query, fields: string[]): Promise<E[] | undefined>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<E, I>(model: Types.Model<E>, id: I, fields: string[]): Promise<E | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    update<E>(model: Types.Model<E>, match: Types.Match, entity: E): Promise<number | undefined>;
    /**
     * Updates the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById<E, I>(model: Types.Model<E>, id: I, entity: E): Promise<boolean | undefined>;
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    replaceById<E, I>(model: Types.Model<E>, id: I, entity: E): Promise<boolean | undefined>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    delete(model: Types.Model, match: Types.Match): Promise<number | undefined>;
    /**
     * Delete the entity that corresponds to the specified Id.
     * @param model Model type.
     * @param id Entity Id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById<I>(model: Types.Model, id: I): Promise<boolean | undefined>;
    /**
     * Count all corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    count(model: Types.Model, query: Types.Query): Promise<number | undefined>;
}
