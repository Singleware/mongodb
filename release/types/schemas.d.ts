import * as Mapping from '@singleware/mapping';
/**
 * Mongo DB schemas class.
 */
export declare class Schemas {
    /**
     * Sets the specified property if the source property has any data.
     * @param to Target property.
     * @param target Target entity.
     * @param from Source property.
     * @param source Source entity.
     */
    private static setProperty;
    /**
     * Sets the number range.
     * @param entity Target entity.
     * @param column Source column.
     */
    private static setNumberRange;
    /**
     * Sets the string range.
     * @param entity Target entity.
     * @param column Source column.
     */
    private static setStringRange;
    /**
     * Sets the array range.
     * @param entity Target entity.
     * @param column Source column.
     */
    private static setArrayRange;
    /**
     * Build a column schema entity based on the specified column schema.
     * @param column Column Schema.
     * @returns Return the generated column schema entity.
     * @throws Throws an error when the column type is unsupported.
     */
    private static buildSchema;
    /**
     * Build a schema entity based on the specified row schema.
     * @param row Row schema.
     * @returns Returns the generated schema entity.
     */
    static build(row: Mapping.Map<Mapping.Column>): Mapping.Entity;
}
