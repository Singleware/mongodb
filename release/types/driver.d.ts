import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Mongo DB driver class.
 */
export declare class Driver implements Mapping.Driver {
    /**
     * Driver connection.
     */
    private connection?;
    /**
     * Driver database.
     */
    private database?;
    /**
     * Driver connection options.
     */
    private options;
    /**
     * Gets the collection name from the specified model type.
     * @param model Mode type.
     * @returns Returns the collection name.
     * @throws Throws an error when the model type is not valid.
     */
    private getCollectionName;
    /**
     * Gets the primary property from the specified model type.
     * @param model Mode type.
     * @returns Returns the primary column name.
     * @throws Throws an error when there is no primary column defined.
     */
    private getPrimaryProperty;
    /**
     * Gets the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     */
    private getPrimaryFilter;
    /**
     * Connect to the MongoDb URI.
     * @param uri Connection URI.
     */
    connect(uri: string): Promise<void>;
    /**
     * Disconnect the current active connection.
     */
    disconnect(): Promise<void>;
    /**
     * Modifies the collection by the specified model type.
     * @param model Model type.
     */
    modify(model: Class.Constructor<Mapping.Entity>): Promise<void>;
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    insert<T extends Mapping.Entity>(model: Class.Constructor<T>, ...entities: T[]): Promise<string[]>;
    /**
     * Finds the corresponding entity from the database.
     * @param model Model type.
     * @param filter Filter expression.
     * @param aggregate Aggregated entries.
     * @returns Returns the list of entities found.
     */
    find<T extends Mapping.Entity>(model: Class.Constructor<T>, filter: Mapping.Expression, aggregate: Mapping.Aggregate[]): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param value Entity id.
     * @param aggregate Aggregated entries.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Mapping.Entity>(model: Class.Constructor<T>, value: any, aggregate: Mapping.Aggregate[]): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns the number of updated entities.
     */
    update(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression, entity: Mapping.Entity): Promise<number>;
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param value Entity id.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(model: Class.Constructor<Mapping.Entity>, value: any, entity: Mapping.Entity): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Filter columns.
     * @return Returns the number of deleted entities.
     */
    delete(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression): Promise<number>;
    /**
     * Deletes the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param value Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById(model: Class.Constructor<Mapping.Entity>, value: any): Promise<boolean>;
}
