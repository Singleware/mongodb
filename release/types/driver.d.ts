import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * MongoDb driver class.
 */
export declare class Driver extends Class.Null implements Mapping.Driver {
    /**
     * Connection options.
     */
    private static options;
    /**
     * Connection instance.
     */
    private connection?;
    /**
     * Current database.
     */
    private database?;
    /**
     * Build and get the collection schema.
     * @param model Model type.
     * @returns Returns the collection validation object.
     */
    private static getCollectionSchema;
    /**
     * Connect to the URI.
     * @param uri Connection URI.
     */
    connect(uri: string): Promise<void>;
    /**
     * Disconnect any active connection.
     */
    disconnect(): Promise<void>;
    /**
     * Modify the collection by the specified model type.
     * @param model Model type.
     */
    modifyCollection(model: Class.Constructor<Mapping.Types.Entity>): Promise<void>;
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    createCollection(model: Mapping.Types.Model): Promise<void>;
    /**
     * Determines whether the collection from the specified model exists or not.
     * @param model Model type.
     * @returns Returns a promise to get true when the collection exists, false otherwise.
     */
    hasCollection(model: Mapping.Types.Model): Promise<boolean>;
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, entities: T[]): Promise<string[]>;
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param filter Field filter.
     * @param fields Fields to be selected.
     * @returns Returns a promise to get the list of entities found.
     */
    find<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, filter: Mapping.Statements.Filter, fields: string[]): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param fields Fields to be selected.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, id: any, fields: string[]): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching fields.
     * @param entity Entity to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    update(model: Mapping.Types.Model, match: Mapping.Statements.Match, entity: Mapping.Types.Entity): Promise<number>;
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(model: Mapping.Types.Model, id: any, entity: Mapping.Types.Model): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching fields.
     * @return Returns a promise to get the number of deleted entities.
     */
    delete(model: Mapping.Types.Model, match: Mapping.Statements.Match): Promise<number>;
    /**
     * Deletes the entity that corresponds to the specified id.
     * @param model Model type.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById(model: Mapping.Types.Model, id: any): Promise<boolean>;
    /**
     * Count all corresponding entities from the storage.
     * @param model Model type.
     * @param filter Field field.
     * @returns Returns a promise to get the total amount of found entities.
     */
    count(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Promise<number>;
}
