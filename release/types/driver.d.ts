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
     * Connect to the MongoDb URI.
     * @param uri Connection URI.
     */
    connect(uri: string): Promise<void>;
    /**
     * Disconnect the current active connection.
     */
    disconnect(): Promise<void>;
    /**
     * Modifies the collection by the specified row schema.
     * @param collection Collection name.
     * @param schema Row schema.
     */
    modify(collection: string, schema: Mapping.Row): Promise<void>;
    /**
     * Insert the specified entity into the database.
     * @param collection Collection name.
     * @param entities Entity data list.
     * @returns Returns the list inserted entities.
     */
    insert<T extends Mapping.Entity>(collection: string, ...entities: T[]): Promise<any[]>;
    /**
     * Find the corresponding entity from the database.
     * @param collection Collection name.
     * @param filter Filter expression.
     * @returns Returns the list of entities found.
     */
    find<T extends Mapping.Entity>(collection: string, filter: Mapping.Expression): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param collection Collection name.
     * @param column Id column name.
     * @param id Entity id value.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Mapping.Entity>(collection: string, column: string, id: any): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param collection Collection name.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns the number of updated entities.
     */
    update<T extends Mapping.Entity>(collection: string, filter: Mapping.Expression, entity: T): Promise<number>;
    /**
     * Update the entity that corresponds to the specified entity id.
     * @param collection Collection name.
     * @param column Column name.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById<T extends Mapping.Entity>(collection: string, column: string, id: any, entity: T): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param collection Collection name.
     * @param filter Filter columns.
     * @return Returns the number of deleted entities.
     */
    delete<T extends Mapping.Entity>(collection: string, filter: Mapping.Expression): Promise<number>;
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param collection Collection name.
     * @param column Column name.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById<T extends Mapping.Entity>(collection: string, column: string, id: any): Promise<boolean>;
}
