/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as BSON from './bson';
/**
 * Converters helper class.
 */
export declare class Adapters extends Class.Null {
    /**
     * Converts the specified input value to an ObjectID output.
     * @param input Input value.
     * @returns Returns the ObjectID or undefined when the input was not valid.
     */
    static ObjectID(input: string | number | BSON.ObjectID | string[] | number[] | BSON.ObjectID[]): BSON.ObjectID | BSON.ObjectID[] | undefined;
}
