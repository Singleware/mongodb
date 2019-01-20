/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Mongodb from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Filters } from './filters';
import { Schemas } from './schemas';

/**
 * Mongo DB driver class.
 */
@Class.Describe()
export class Driver extends Class.Null implements Mapping.Driver {
  /**
   * Driver connection.
   */
  @Class.Private()
  private connection?: Mongodb.MongoClient;

  /**
   * Driver database.
   */
  @Class.Private()
  private database?: Mongodb.Db;

  /**
   * Driver connection options.
   */
  @Class.Private()
  private static options = {
    useNewUrlParser: true,
    ignoreUndefined: true
  };

  /**
   * Gets the collection name from the specified model type.
   * @param model Mode type.
   * @returns Returns the collection name.
   * @throws Throws an error when the model type is not valid.
   */
  @Class.Private()
  private static getCollectionName(model: Class.Constructor<Mapping.Entity>): string {
    const name = Mapping.Schema.getStorage(model);
    if (!name) {
      throw new Error(`There is no collection name for the specified model type.`);
    }
    return name;
  }

  /**
   * Gets the collection options.
   * @param model Model type.
   * @returns Returns the collection command object.
   */
  @Class.Private()
  private static getCollectionOptions(model: Class.Constructor<Mapping.Entity>): Object {
    return {
      validator: {
        $jsonSchema: Schemas.build(<Mapping.Map<Mapping.Column>>Mapping.Schema.getRealRow(model))
      },
      validationLevel: 'strict',
      validationAction: 'error'
    };
  }

  /**
   * Gets the primary property from the specified model type.
   * @param model Mode type.
   * @returns Returns the primary column name.
   * @throws Throws an error when there is no primary column defined.
   */
  @Class.Private()
  private static getPrimaryProperty(model: Class.Constructor<Mapping.Entity>): Mapping.Column {
    const column = <Mapping.Column>Mapping.Schema.getPrimary(model);
    if (!column) {
      throw new Error(`There is no primary column to be used.`);
    }
    return column;
  }

  /**
   * Gets the primary filter based in the specified model type.
   * @param model Model type.
   * @param value Primary id value.
   * @returns Returns the primary filter.
   */
  @Class.Private()
  private static getPrimaryFilter(model: Class.Constructor<Mapping.Entity>, value: any): Mapping.Entity {
    const filters = <any>{};
    const primary = this.getPrimaryProperty(model);
    filters[primary.name] = { operator: Mapping.Operator.EQUAL, value: value };
    return filters;
  }

  /**
   * Gets the fields grouping based on the specified row schema.
   * @param row Row schema.
   * @param virtual Virtual schema.
   * @returns Returns the grouping entity.
   */
  @Class.Private()
  private static getFieldsGrouping(row: Mapping.Map<Mapping.Column>, virtual: Mapping.Map<Mapping.Virtual>): Mapping.Entity {
    const group = <any>{};
    for (const column in row) {
      const name = row[column].alias || row[column].name;
      group[name] = { $first: `$${name}` };
    }
    for (const column in virtual) {
      const name = virtual[column].name;
      group[name] = { $first: `$${name}` };
    }
    group._id = '$_id';
    return group;
  }

  /**
   * Purge all null fields returned by default in a performed query.
   * @param row Row schema.
   * @param entities Entities to be purged.
   * @returns Returns the purged entities list.
   */
  @Class.Private()
  private purgeNullFields<T extends Mapping.Entity>(row: Mapping.Map<Mapping.Column>, ...entities: T[]): T[] {
    for (let i = 0; i < entities.length; ++i) {
      const entity = entities[i];
      for (const column in entity) {
        let schema;
        if (entity[column] === null && (schema = row[column]) && !schema.types.includes(Mapping.Format.NULL)) {
          delete entity[column];
        }
      }
    }
    return entities;
  }

  /**
   * Connect to the MongoDb URI.
   * @param uri Connection URI.
   */
  @Class.Public()
  public async connect(uri: string): Promise<void> {
    await new Promise<Mongodb.Db>(
      (resolve: Function, reject: Function): void => {
        Mongodb.MongoClient.connect(uri, Driver.options, (error: Mongodb.MongoError, connection: Mongodb.MongoClient) => {
          if (error) {
            reject(error);
          } else {
            this.connection = connection;
            this.database = connection.db();
            resolve();
          }
        });
      }
    );
  }

  /**
   * Disconnect the current active connection.
   */
  @Class.Public()
  public async disconnect(): Promise<void> {
    return new Promise<void>(
      (resolve: Function, reject: Function): void => {
        (<Mongodb.MongoClient>this.connection).close((error: Mongodb.MongoError) => {
          if (error) {
            reject(error);
          } else {
            this.connection = void 0;
            this.database = void 0;
            resolve();
          }
        });
      }
    );
  }

  /**
   * Modifies the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async modify(model: Class.Constructor<Mapping.Entity>): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      collMod: Driver.getCollectionName(model),
      ...Driver.getCollectionOptions(model)
    });
  }

  /**
   * Creates the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async create(model: Class.Constructor<Mapping.Entity>): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      create: Driver.getCollectionName(model),
      ...Driver.getCollectionOptions(model)
    });
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns the list inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Entity>(model: Class.Constructor<T>, entities: T[]): Promise<string[]> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const result = await manager.insertMany(entities);
    return Object.values(<any>result.insertedIds);
  }

  /**
   * Finds the corresponding entity from the database.
   * @param model Model type.
   * @param aggregation List of virtual columns.
   * @param filters List of expressions filter.
   * @returns Returns the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Entity>(
    model: Class.Constructor<T>,
    aggregation: Mapping.Aggregation[],
    filters: Mapping.Expression[]
  ): Promise<T[]> {
    const row = Mapping.Schema.getRealRow(model) as Mapping.Map<Mapping.Column>;
    const virtual = Mapping.Schema.getVirtualRow(model) as Mapping.Map<Mapping.Virtual>;
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const pipeline = <any[]>[{ $match: Filters.build(model, filters[0]) }];
    for (const column of aggregation) {
      if (column.multiple) {
        pipeline.push({
          $unwind: {
            path: `\$${column.local}`,
            preserveNullAndEmptyArrays: true
          }
        });
      }
      pipeline.push({
        $lookup: {
          from: column.storage,
          localField: column.local,
          foreignField: column.foreign,
          as: column.virtual
        }
      });
      const group = Driver.getFieldsGrouping(row, virtual);
      if (column.multiple) {
        pipeline.push({
          $unwind: {
            path: `\$${column.virtual}`,
            preserveNullAndEmptyArrays: true
          }
        });
        group[column.local] = { $push: `$${column.local}` };
        group[column.virtual] = { $push: `$${column.virtual}` };
      }
      pipeline.push({
        $group: group
      });
    }
    return this.purgeNullFields(row, ...(await manager.aggregate(pipeline).toArray()));
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param aggregation List of virtual columns.
   * @param id Entity id.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Entity>(
    model: Class.Constructor<T>,
    aggregation: Mapping.Aggregation[],
    id: any
  ): Promise<T | undefined> {
    return (await this.find<T>(model, aggregation, [Driver.getPrimaryFilter(model, id)]))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param filter Filter expression.
   * @returns Returns the number of updated entities.
   */
  @Class.Public()
  public async update(model: Class.Constructor<Mapping.Entity>, entity: Mapping.Entity, filter: Mapping.Expression): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const result = await manager.updateMany(Filters.build(model, filter), { $set: entity });
    return result.modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param id Entity id.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Class.Constructor<Mapping.Entity>, entity: Mapping.Entity, id: any): Promise<boolean> {
    return (await this.update(model, entity, Driver.getPrimaryFilter(model, id))) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter columns.
   * @return Returns the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const result = await manager.deleteMany(Filters.build(model, filter));
    return result.deletedCount || 0;
  }

  /**
   * Deletes the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Class.Constructor<Mapping.Entity>, id: any): Promise<boolean> {
    return (await this.delete(model, Driver.getPrimaryFilter(model, id))) === 1;
  }
}
