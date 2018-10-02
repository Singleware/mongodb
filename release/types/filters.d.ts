import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Mongo DB filters class.
 */
export declare class Filters {
    /**
     * Build a filter entity from the specified filter expression.
     * @param model Model type.
     * @param filter Filter expression.
     * @returns Returns the generated filter entity.
     * @throws Throws an error when there is a nonexistent column in the specified filter.
     */
    static build(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression): Mapping.Entity;
}
