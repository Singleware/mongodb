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
     * Try to convert the specified input array to an ObjectID array.
     * @param input Input array.
     * @param schema Column schema.
     * @returns Returns the array containing all converted and not converted values
     * @throws Throws an type error when the specified value isn't an array.
     */
    private static castArray;
    /**
     * Try to convert the specified input value to an ObjectID.
     * @param value Input value.
     * @param schema Column schema.
     * @returns Returns the converted value when the operation was successful, otherwise returns the input value.
     */
    private static castValue;
    /**
     * Build a new match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns the new match entity.
     */
    private static buildMatch;
    /**
     * Build a new match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns a new match entity.
     */
    static build(model: Types.Model, match: Types.Match | Types.Match[]): Types.Entity;
}
