import * as Mapping from '@singleware/mapping';
/**
 * MongoDb data mapper class.
 */
export declare class Mapper<E extends Mapping.Types.Entity> extends Mapping.Mapper<E> {
    /**
     * Determines whether the specified model ype is common or not.
     * @param model Model type.
     * @returns Returns true when the specified model type is a common type or false otherwise.
     */
    protected static isCommon(model: Mapping.Types.Model): boolean;
}
