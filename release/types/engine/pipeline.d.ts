/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Aliases from '../aliases';
/**
 * Pipeline helper class.
 */
export declare class Pipeline extends Class.Null {
    /**
     * Get all viewed fields based on the specified model type and the given fields to select.
     * @param model Model type.
     * @param fields Fields to select.
     * @returns Returns the view list.
     */
    private static getView;
    /**
     * Gets a new real level based on the specified column schema and the given fields to select.
     * @param schema Level column schema.
     * @param levels Level list.
     * @param fields Fields to select.
     * @returns Returns the generated level entity.
     */
    private static getRealLevel;
    /**
     * Gets a new virtual level based on the specified column schema and the given fields to select.
     * @param schema Level column schema.
     * @param levels Level list.
     * @param fields Fields to select.
     * @returns Returns the generated level entity.
     */
    private static getVirtualLevel;
    /**
     * Get a new group rule based on the specified model type and viewed fields.
     * @param view Viewed fields.
     * @param path Path to determine whether it's a subgroup.
     * @returns Returns the generated group rule entity.
     */
    private static getGroupRule;
    /**
     * Get a new project rule based on the specified model type and viewed fields.
     * @param view Viewed fields.
     * @returns Returns the generated project rule entity.
     */
    private static getProjectRule;
    /**
     * Get a new sort rule based on the specified sort map.
     * @param sort Sort map.
     * @returns Returns the generated sort rule entity.
     */
    private static getSortRule;
    /**
     * Gets a new compound Id based on the specified main field Id and the list of levels.
     * @param id Main field Id.
     * @param levels List of levels.
     * @returns Returns the composed Id entity.
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
     * Compose a subgroup into the given pipeline.
     * @param pipeline Current pipeline.
     * @param group Parent group.
     * @param fields Fields to select.
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
     * @param properties List of fields.
     * @param fields Fields to select.
     * @param level First decomposed level.
     * @param multiples List of decomposed levels.
     */
    private static composeAll;
    /**
     * Resolve any foreign relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param model Model type.
     * @param view Viewed fields.
     * @param fields Fields to select.
     * @param levels List of current levels.
     */
    private static resolveForeignRelation;
    /**
     * Resolve any nested relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param model Model type.
     * @param view Viewed fields.
     * @param fields Fields to selected.
     * @param levels List of current levels.
     */
    private static resolveNestedRelations;
    /**
     * Applies any relationship in the given model type into the specified pipeline.
     * @param pipeline Current pipeline.
     * @param base Base model type.
     * @param model Current model type.
     * @param fields Fields to select.
     * @param levels List of current levels.
     * @returns Returns the pipeline projection.
     */
    private static applyRelationship;
    /**
     * Build a new pipeline entity based on the specified model type, fields and query filter.
     * @param model Model type.
     * @param fields Fields to select.
     * @param query Query filter.
     * @returns Returns the new pipeline entity.
     */
    static build(model: Aliases.Model, query: Aliases.Query, fields: string[]): Aliases.Entity[];
}
