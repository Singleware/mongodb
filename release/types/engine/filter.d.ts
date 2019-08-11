/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Aliases from '../aliases';
/**
 * Filter helper class.
 */
export declare class Filter extends Class.Null {
    /**
     * Build a new primary Id filter based on the specified model type and the primary Id value.
     * @param model Model type.
     * @param value Primary Id value.
     * @returns Returns the primary filter.
     */
    static primaryId(model: Aliases.Model, value: any): Aliases.Match;
}
