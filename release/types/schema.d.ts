import * as Types from './types';
/**
 * Schema helper class.
 */
export declare class Schema extends Types.Schema {
    /**
     * Decorates the specified property to be an object Id column.
     * @returns Returns the decorator method.
     */
    static ObjectId(): Types.ModelDecorator;
    /**
     * Decorates the specified property to be the document object Id column.
     * @returns Returns the decorator method.
     */
    static DocumentId(): Types.ModelDecorator;
    /**
     *  Decorates the specified property to be an array column that accepts only Object Ids.
     * @param unique Determines whether the array items must be unique or not.
     * @param minimum Minimum items.
     * @param maximum Maximum items.
     * @returns Returns the decorator method.
     */
    static ArrayIds(unique?: boolean, minimum?: number, maximum?: number): Types.ModelDecorator;
    /**
     * Decorates the specified property to be an Object Id column.
     * @returns Returns the decorator method.
     */
    static Binary(): Types.ModelDecorator;
}
