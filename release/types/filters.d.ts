import * as Mapping from '@singleware/mapping';
/**
 * Mongo DB filters class.
 */
export declare class Filters {
    /**
     * Build a filter entity from the specified filter expression.
     * @param filter Filter expression.
     * @returns Returns the generated filter entity.
     */
    static build(filter: Mapping.Expression): Mapping.Entity;
}
