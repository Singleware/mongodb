/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Mongodb from 'mongodb';
import * as Class from '@singleware/class';
import * as Aliases from './aliases';
/**
 * MongoDb driver class.
 */
export declare class Driver extends Class.Null implements Aliases.Driver {
    /**
     * Connection options.
     */
    private static options;
    /**
     * Client instance.
     */
    private client?;
    /**
     * Client session.
     */
    private session?;
    /**
     * Check if there's an active connection.
     * @throws Throws an error when there's no active connection.
     */
    private isActiveConnection;
    /**
     * Build and get the collection schema.
     * @param model Model type.
     * @returns Returns the collection validation object.
     */
    private getCollectionSchema;
    /**
     * Connect to the specified URI.
     * @param uri Connection URI.
     * @param options Connection options.
     * @throws Throws an error when there's an active connection.
     */
    connect(uri: string, options?: Mongodb.MongoClientOptions): Promise<void>;
    /**
     * Disconnect the active connection.
     * @throws Throws an error when there's no active connection.
     */
    disconnect(): Promise<void>;
    /**
     * Modify the collection by the specified model type.
     * @param model Model type.
     */
    modifyCollection(model: Class.Constructor<Aliases.Entity>): Promise<void>;
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    createCollection(model: Aliases.Model): Promise<void>;
    /**
     * Determines whether or not the collection for the given model type exists.
     * @param model Model type.
     * @returns Returns a promise to get true when the collection exists, false otherwise.
     */
    hasCollection(model: Aliases.Model): Promise<boolean>;
    /**
     * Run the specified callback in the transactional mode.
     * @param callback Transaction callback.
     * @param options Transaction options.
     * @throws Throws an exception when there's any error in the transaction.
     * @returns Returns the same value returned by the given callback.
     */
    runTransaction<T>(callback: () => Promise<T>, options?: Mongodb.TransactionOptions): Promise<T>;
    /**
     * Insert all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    insert<T extends Aliases.Entity>(model: Aliases.Model<T>, entities: T[]): Promise<string[]>;
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    find<T extends Aliases.Entity>(model: Aliases.Model<T>, query: Aliases.Query, fields: string[]): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Aliases.Entity>(model: Aliases.Model<T>, id: any, fields: string[]): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    update(model: Aliases.Model, match: Aliases.Match, entity: Aliases.Entity): Promise<number>;
    /**
     * Updates the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(model: Aliases.Model, id: any, entity: Aliases.Model): Promise<boolean>;
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    replaceById(model: Aliases.Model, id: any, entity: Aliases.Model): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    delete(model: Aliases.Model, match: Aliases.Match): Promise<number>;
    /**
     * Delete the entity that corresponds to the specified Id.
     * @param model Model type.
     * @param id Entity Id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById(model: Aliases.Model, id: any): Promise<boolean>;
    /**
     * Count all corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    count(model: Aliases.Model, query: Aliases.Query): Promise<number>;
}
