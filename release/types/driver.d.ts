import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Mongo DB driver class.
 */
export declare class Driver extends Class.Null implements Mapping.Driver {
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
    private static options;
    /**
     * Gets the collection name from the specified model type.
     * @param model Mode type.
     * @returns Returns the collection name.
     * @throws Throws an error when the model type is not valid.
     */
    private static getCollectionName;
    /**
     * Gets the collection options.
     * @param model Model type.
     * @returns Returns the collection command object.
     */
    private static getCollectionOptions;
    /**
     * Gets the primary property from the specified model type.
     * @param model Mode type.
     * @returns Returns the primary column name.
     * @throws Throws an error when there is no primary column defined.
     */
    private static getPrimaryProperty;
    /**
     * Gets the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     */
    private static getPrimaryFilter;
    /**
     * Gets the fields grouping based on the specified row schema.
     * @param row Row schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    private static getFieldsGrouping;
    /**
     * Purge all null fields returned by default in a performed query.
     * @param row Row schema.
     * @param entities Entities to be purged.
     * @returns Returns the purged entities list.
     */
    private purgeNullFields;
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
     * Creates the collection by the specified model type.
     * @param model Model type.
     */
    create(model: Class.Constructor<Mapping.Entity>): Promise<void>;
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    insert<T extends Mapping.Entity>(model: Class.Constructor<T>, entities: T[]): Promise<string[]>;
    /**
     * Finds the corresponding entity from the database.
     * @param model Model type.
     * @param aggregation List of virtual columns.
     * @param filters List of expressions filter.
     * @returns Returns the list of entities found.
     */
    find<T extends Mapping.Entity>(model: Class.Constructor<T>, aggregation: Mapping.Aggregation[], filters: Mapping.Expression[]): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param aggregation List of virtual columns.
     * @param id Entity id.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Mapping.Entity>(model: Class.Constructor<T>, aggregation: Mapping.Aggregation[], id: any): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param entity Entity data to be updated.
     * @param filter Filter expression.
     * @returns Returns the number of updated entities.
     */
    update(model: Class.Constructor<Mapping.Entity>, entity: Mapping.Entity, filter: Mapping.Expression): Promise<number>;
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param entity Entity data to be updated.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(model: Class.Constructor<Mapping.Entity>, entity: Mapping.Entity, id: any): Promise<boolean>;
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
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById(model: Class.Constructor<Mapping.Entity>, id: any): Promise<boolean>;
}
