/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
import * as Engine from './engine';
/**
 * Caster helper class.
 */
export declare class Caster extends Class.Null {
    /**
     * Converts the specified value to a valid Object Id.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the validated ObjectID.
     */
    static ObjectId<T>(value: T | T[], type: Mapping.Types.Cast): (T | Engine.ObjectId) | (T | Engine.ObjectId)[];
    /**
     * Converts the specified value to a valid Binary.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the valid Binary.
     */
    static Binary<T>(value: T, type: Mapping.Types.Cast): Engine.Binary | undefined;
}
