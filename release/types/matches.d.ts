import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Matches helper class.
 */
export declare class Matches extends Class.Null {
    /**
     * Converts the specified input array to an array of ObjectID when possible.
     * @param input Input array.
     * @param schema Column schema.
     * @returns Returns the original value or the converted array.
     * @throws Throws an type error when the specified value isn't an array.
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
     * Build a match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns the generated match entity.
     */
    static buildMatch(model: Mapping.Types.Model, match: Mapping.Statements.Match): Mapping.Types.Entity;
    /**
     * Build a match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression or list of match expressions.
     * @returns Returns a single generated match entity or the generated match entity list.
     */
    static build(model: Mapping.Types.Model, match: Mapping.Statements.Match | Mapping.Statements.Match[]): Mapping.Types.Entity;
}
