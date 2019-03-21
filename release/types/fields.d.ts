import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Field helper class.
 */
export declare class Fields extends Class.Null {
    /**
     * Gets a new real level entity based on the specified level information.
     * @param column Level column schema.
     * @param levels Level list.
     * @returns Returns the generated level entity.
     */
    private static getRealLevel;
    /**
     * Gets a new virtual level entity based on the specified level information.
     * @param column Level column schema.
     * @param levels Level list.
     * @returns Returns the level entity.
     */
    private static getVirtualLevel;
    /**
     * Gets a new row group based on the specified model type and view modes.
     * @param model Model type.
     * @param views Views modes.
     * @param path Path to determine whether this group is a subgroup.
     * @returns Returns the generated row group.
     */
    private static getGrouping;
    /**
     * Gets a new compound Id based on the specified id and the list of levels.
     * @param id Main id field.
     * @param levels List of levels.
     * @returns Returns the composed id object.
     */
    private static getComposedId;
    /**
     * Decompose all groups in the specified list of levels to the given pipeline.
     * @param pipeline Current pipeline.
     * @param levels List of levels.
     * @returns Returns the list of decomposed levels.
     */
    private static decomposeAll;
    /**
     * Compose a subgroup to the given pipeline.
     * @param pipeline Current pipeline.
     * @param group Parent group.
     * @param views Current view modes.
     * @param level Current level.
     * @param last Last level.
     */
    private static composeSubgroup;
    /**
     * Compose a group into the pipeline.
     * @param pipeline Current pipeline.
     * @param group Current group.
     * @param level Current level.
     */
    private static composeGroup;
    /**
     * Compose all decomposed levels to the given pipeline.
     * @param pipeline Current pipeline.
     * @param fields List of fields.
     * @param views View modes.
     * @param level First decomposed level.
     * @param multiples List of decomposed levels.
     */
    private static composeAll;
    /**
     * Resolve any foreign relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param base Base model type.
     * @param model Current model type.
     * @param views View mode.
     * @param levels List of current levels.
     */
    private static resolveForeignRelation;
    /**
     * Resolve any nested relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param base Base model type.
     * @param model Current model type.
     * @param views View modes.
     * @param levels List of current levels.
     */
    private static resolveNestedRelations;
    /**
     * Resolve any relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param base Base model type.
     * @param model Current model type.
     * @param views View modes.
     * @param levels List of current levels.
     */
    private static resolveRelations;
    /**
     * Apply any relationship in the specified pipeline according to the model type and view mode.
     * @param pipeline Target pipeline.
     * @param model Model type.
     * @param views View modes.
     */
    static applyRelations(pipeline: Mapping.Types.Entity[], model: Mapping.Types.Model, views: string[]): void;
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
}
