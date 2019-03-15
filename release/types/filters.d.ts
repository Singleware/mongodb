import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Filters helper class.
 */
export declare class Filters extends Class.Null {
    /**
     * Converts the specified input array to an array of ObjectID when possible.
     * @param input Input array.
     * @param schema Real column schema.
     * @returns Returns the original array or the converted array.
     */
    private static castArray;
    /**
     * Converts the specified input value to an ObjectID when possible.
     * @param value Input value.
     * @param schema Real column schema.
     * @returns Returns the original value or the converted value.
     */
    private static castValue;
    /**
     * Build a filter entity from the specified filter expression.
     * @param model Model type.
     * @param filter Filter expression.
     * @returns Returns the generated filter entity.
     * @throws Throws an error when there is a nonexistent column in the specified filter.
     */
    static build(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Mapping.Types.Entity;
}
