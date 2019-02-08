/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Field helper class.
 */
export declare class Fields extends Class.Null {
    /**
     * Build and get the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     * @throws Throws an error when there is no primary column defined.
     */
    static getPrimaryFilter(model: Mapping.Types.Model, value: any): Mapping.Types.Entity;
    /**
     * Build and get the field grouping based on the specified real and virtual column schemas.
     * @param real Real columns schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    static getGrouping(real: Mapping.Columns.RealRow, virtual: Mapping.Columns.VirtualRow): Mapping.Types.Entity;
    /**
     * Build and get the sorting entity based on the specified sort object.
     * @param sort Columns to sort.
     * @returns Returns the sorting entity.
     */
    static getSorting(sort: Mapping.Statements.Sort): Mapping.Types.Entity;
    /**
     * Apply the specified grouping and join list into the target pipeline.
     * @param pipeline Target pipeline.
     * @param grouping Default grouping.
     * @param joins List of joins.
     */
    static applyRelations(pipeline: Mapping.Types.Entity[], grouping: Mapping.Types.Entity, joins: Mapping.Statements.Join[]): void;
    /**
     * Apply the specified filters into the target pipeline.
     * @param model Model type.
     * @param pipeline Target pipeline.
     * @param filters Filters to be applied.
     */
    static applyFilters(model: Mapping.Types.Model, pipeline: any[], filters: Mapping.Statements.Filter[]): void;
    /**
     * Purge all null fields from the specified entity list.
     * @param real Real column schema.
     * @param entities Entity list to be purged.
     * @returns Returns the purged entity list.
     */
    static purgeNull<T extends Mapping.Types.Entity>(real: Mapping.Columns.RealRow, entities: T[]): T[];
}
