/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
/**
 * Match helper class.
 */
export declare class Match extends Class.Null {
    /**
     * Try to convert the specified input value to a filterable.
     * @param value Input value.
     * @param schema Column schema.
     * @returns Returns the converted value or the specified input value.
     */
    private static castValue;
    /**
     * Try to convert the specified input array to a filterable array.
     * @param input Input array.
     * @param schema Column schema.
     * @returns Returns the array containing all converted and not converted values.
     * @throws Throws an type error when the specified value isn't an array.
     */
    private static castArray;
    /**
     * Attach a new operation in the given operations map.
     * @param schemas Column schemas.
     * @param operations Operations map.
     * @param operator Operator type.
     * @param value Operation value.
     */
    private static attachOperation;
    /**
     * Build a new matching operation based the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns the new matching operation.
     */
    private static buildExpression;
    /**
     * Build a new matching entity based on the specified matching expressions.
     * @param model Model type.
     * @param match Matching expressions.
     * @returns Returns the new matching entity.
     */
    static build(model: Types.Model, match: Types.Match | Types.Match[]): Types.Entity;
}
