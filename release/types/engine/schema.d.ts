/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Aliases from '../aliases';
/**
 * Schema helper class.
 */
export declare class Schema extends Class.Null {
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
    static build(row: Aliases.Columns.RealRow): Aliases.Entity;
}
