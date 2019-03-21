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
     * @returns Returns true when the collection exists, false otherwise.
     */
    hasCollection(model: Mapping.Types.Model): Promise<boolean>;
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param views View modes.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, views: string[], entities: T[]): Promise<string[]>;
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param views View modes.
     * @param filter Field filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns the  promise to get the list of entities found.
     * @returns Returns the list of entities found.
     */
    find<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, views: string[], filter: Mapping.Statements.Filter, sort?: Mapping.Statements.Sort, limit?: Mapping.Statements.Limit): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param views View modes.
     * @param id Entity id.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, views: string[], id: any): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param views View modes.
     * @param filter Fields filter.
     * @param entity Entity to be updated.
     * @returns Returns the number of updated entities.
     */
    update(model: Mapping.Types.Model, views: string[], filter: Mapping.Statements.Filter, entity: Mapping.Types.Entity): Promise<number>;
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param views View modes.
     * @param id Entity id.
     * @param entity Entity to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(model: Mapping.Types.Model, views: string[], id: any, entity: Mapping.Types.Model): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Fields filter.
     * @return Returns the number of deleted entities.
     */
    delete(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Promise<number>;
    /**
     * Deletes the entity that corresponds to the specified id.
     * @param model Model type.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById(model: Mapping.Types.Model, id: any): Promise<boolean>;
}
