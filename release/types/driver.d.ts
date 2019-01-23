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
     * @throws Throws an error when the model type isn't valid.
     */
    private static getCollectionName;
    /**
     * Build and get the collection validation.
     * @param model Model type.
     * @returns Returns the collection validation object.
     */
    private static getCollectionValidation;
    /**
     * Build and get the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     * @throws Throws an error when there is no primary column defined.
     */
    private static getPrimaryFilter;
    /**
     * Build and get the field grouping based on the specified row schema.
     * @param real Real columns schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    private static getFieldGrouping;
    /**
     * Apply the specified aggregations into the target pipeline.
     * @param pipeline Target pipeline.
     * @param grouping Default grouping.
     * @param joins List of junctions.
     */
    private static applyJoins;
    /**
     * Apply the specified filters into the target pipeline.
     * @param pipeline Target pipeline.
     * @param filters Filters to be applied.
     */
    private static applyFilters;
    /**
     * Purge all empty fields from the specified entities.
     * @param real Real column schema.
     * @param entities Entities to be purged.
     * @returns Returns the purged entities list.
     */
    private static purgeEmptyFields;
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
    modify(model: Class.Constructor<Mapping.Types.Entity>): Promise<void>;
    /**
     * Creates the collection by the specified model type.
     * @param model Model type.
     */
    create(model: Mapping.Types.Model): Promise<void>;
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, entities: T[]): Promise<string[]>;
    /**
     * Finds the corresponding entity from the database.
     * @param model Model type.
     * @param joins List of junctions.
     * @param filters List of filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns the  promise to get the list of entities found.
     * @returns Returns the list of entities found.
     */
    find<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, joins: Mapping.Statements.Join[], filters: Mapping.Statements.Filter[], sort?: Mapping.Statements.Join, limit?: Mapping.Statements.Limit): Promise<T[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param joins List of junctions.
     * @param id Entity id.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    findById<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, joins: Mapping.Statements.Join[], id: any): Promise<T | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param entity Entity data to be updated.
     * @param filter Filter expression.
     * @returns Returns the number of updated entities.
     */
    update(model: Mapping.Types.Model, entity: Mapping.Types.Entity, filter: Mapping.Statements.Filter): Promise<number>;
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param entity Entity data to be updated.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(model: Mapping.Types.Model, entity: Mapping.Types.Model, id: any): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Filter columns.
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
