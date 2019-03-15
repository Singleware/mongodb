import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Field helper class.
 */
export declare class Fields extends Class.Null {
    /**
     * Build and get the grouping of fields based on the specified real and virtual column schemas.
     * @param real Real columns schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    private static getGrouping;
    /**
     * Apply any relationship in the specified pipeline according to the model type and view mode.
     * @param pipeline Target pipeline.
     * @param model Model type.
     * @param view View mode.
     */
    static applyRelations(pipeline: Mapping.Types.Entity[], model: Mapping.Types.Model, view: string): void;
    /**
     * Build and get the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     * @throws Throws an error when there is no primary column defined.
     */
    static getPrimaryFilter(model: Mapping.Types.Model, value: any): Mapping.Types.Entity;
    /**
     * Apply the specified filters into the target pipeline.
     * @param pipeline Target pipeline.
     * @param model Model type.
     * @param filters Filters to be applied.
     */
    static applyFilters(pipeline: any[], model: Mapping.Types.Model, ...filters: Mapping.Statements.Filter[]): void;
    /**
     * Build and get the sorting entity based on the specified sort object.
     * @param sort Columns to sort.
     * @returns Returns the sorting entity.
     */
    static getSorting(sort: Mapping.Statements.Sort): Mapping.Types.Entity;
    /**
     * Purge all null fields from the specified entity list.
     * @param model Entity model.
     * @param view View mode.
     * @param entities List of entities to be cleaned.
     * @returns Returns the cleaned entity list.
     */
    static purgeNull<T extends Mapping.Types.Entity>(model: Mapping.Types.Model, view: string, entities: T[]): T[];
}
