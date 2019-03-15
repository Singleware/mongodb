import * as Class from '@singleware/class';
import * as BSON from './bson';
/**
 * Converters helper class.
 */
export declare class Converters extends Class.Null {
    /**
     * Converts the specified input value to an ObjectID output.
     * @param input Input value.
     * @returns Returns the ObjectID or undefined when the input was not valid.
     */
    static ObjectID<T extends string | number | BSON.ObjectID>(input: T | T[]): BSON.ObjectID | BSON.ObjectID[] | undefined;
}
