/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as BSON from './bson';
/**
 * Converters helper class.
 */
export declare class Converters extends Class.Null {
    /**
     * Converts the specified input value to an ObjectID output.
     * @param input Input value.
     * @returns Returns the ObjectID output or undefined when the input was not valid.
     */
    static ObjectID<T extends string | number | BSON.ObjectID>(input: T | T[]): BSON.ObjectID | BSON.ObjectID[] | undefined;
    /**
     * Converts the specified input value to a Binary output.
     * @param input Input value.
     * @returns Returns the Binary output or undefined when the input was not valid.
     */
    static Binary<T extends Array<number> | BSON.Binary>(input: T): BSON.Binary | undefined;
}
