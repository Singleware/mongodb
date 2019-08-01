import * as Mapping from '@singleware/mapping';
/**
 * Schema helper class.
 */
export declare class Schema extends Mapping.Schema {
    /**
     * Decorates the specified property to be an object Id column.
     * @returns Returns the decorator method.
     */
    static ObjectId(): Mapping.Types.PropertyDecorator;
    /**
     * Decorates the specified property to be the main object Id column.
     * @returns Returns the decorator method.
     */
    static MainId(): Mapping.Types.PropertyDecorator;
    /**
     *  Decorates the specified property to be an array column that accepts only Object Ids.
     * @param unique Determines whether the array items must be unique or not.
     * @param minimum Minimum items.
     * @param maximum Maximum items.
     * @returns Returns the decorator method.
     */
    static ArrayIds(unique?: boolean, minimum?: number, maximum?: number): Mapping.Types.PropertyDecorator;
    /**
     * Decorates the specified property to be an Object Id column.
     * @returns Returns the decorator method.
     */
    static Binary(): Mapping.Types.PropertyDecorator;
}
