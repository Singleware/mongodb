import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * MongoDb schemas class.
 */
export declare class Schemas extends Class.Null {
    /**
     * Sets the specified target property whether the source property has any data.
     * @param to Target property.
     * @param target Target entity.
     * @param from Source property.
     * @param source Source entity.
     */
    private static setProperty;
    /**
     * Build the schema properties based on the specified column schema.
     * @param real Real column Schema.
     * @returns Return the generated schema properties.
     * @throws Throws an error when the column type is unsupported.
     */
    private static buildProperties;
    /**
     * Build a schema entity based on the specified row schema.
     * @param real Real row schema.
     * @returns Returns the generated schema entity.
     */
    static build(real: Mapping.Columns.RealRow): Mapping.Types.Entity;
}
