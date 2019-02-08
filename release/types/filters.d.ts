/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
/**
 * Filters helper class.
 */
export declare class Filters extends Class.Null {
    /**
     * Gets the corresponding column schema from the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @returns Returns the column schema.
     * @throws Throws an exception when te specified column does not exists.
     */
    private static getSchema;
    /**
     * Check whether the specified value type can be converted to another one.
     * @param value Value to be converted.
     * @param schema Real column schema.
     * @returns Returns the original or the converted value.
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
