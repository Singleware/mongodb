/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
import * as Engine from './engine';
import * as Types from './types';
/**
 * Caster helper class.
 */
export declare class Caster extends Class.Null {
    /**
     * Converts the specified value to a valid Object Id.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the validated Object Id or the same value when the given input isn't a valid Object Id.
     */
    static ObjectId<T>(value: T, type: Mapping.Types.Cast): T | Engine.ObjectId;
    /**
     * Converts the specified value to a valid Object Id array.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the validated Object Id Array or the same value when the given input isn't a valid Array.
     */
    static ObjectIdArray<T>(value: T[], type: Mapping.Types.Cast): (T | Engine.ObjectId)[];
    /**
     * Converts the specified value to a valid Object Id Map.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the validated Object Id Map or the same value when the given input isn't a valid Map.
     */
    static ObjectIdMap<T>(value: Types.Map<T>, type: Mapping.Types.Cast): Types.Map<T | Engine.ObjectId>;
    /**
     * Converts the specified value to a valid Binary.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the valid Binary.
     */
    static Binary<T>(value: T, type: Mapping.Types.Cast): Engine.Binary | undefined;
}
