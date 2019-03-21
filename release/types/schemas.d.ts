import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * MongoDb schemas class.
 */
export declare class Schemas extends Class.Null {
    /**
     * Sets the specified target property if the specified source property has some data.
     * @param to Target property.
     * @param target Target entity.
     * @param from Source property.
     * @param source Source entity.
     */
    private static setProperty;
    /**
     * Build a new document schema based on the model in the specified column schema.
     * @param column Column schema.
     * @returns Returns the new document schema.
     */
    private static buildDocumentSchema;
    /**
     * Build a new property schema based on the specified column schema.
     * @param column Column Schema.
     * @returns Return the generated schema properties.
     * @throws Throws an error when the column type is unsupported.
     */
    private static buildPropertySchema;
    /**
     * Build a new entity schema based on the specified row schema.
     * @param row Row schema.
     * @returns Returns the generated schema entity.
     */
    static build(row: Mapping.Columns.RealRow): Mapping.Types.Entity;
}
