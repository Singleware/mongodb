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
    static ObjectId<T extends string | number | Engine.ObjectId>(value: T | (T | T[])[], type: Mapping.Types.Cast): T | (T | T[])[];
    /**
     * Converts the specified value to a valid Binary.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the valid Binary.
     */
    static Binary<T extends number[] | Engine.Binary>(value: T, type: Mapping.Types.Cast): Engine.Binary | undefined;
}
