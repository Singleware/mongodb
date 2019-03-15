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
