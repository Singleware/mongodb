/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
/**
 * Sort helper class.
 */
export declare class Sort extends Class.Null {
    /**
     * Build a new sorting entity based on the specified sort map.
     * @param model Model type.
     * @param sort Sort map.
     * @returns Returns the new sorting entity.
     */
    static build(model: Types.Model, sort: Types.Sort): Types.Entity;
}
