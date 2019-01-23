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
   * @throws Throws an error when the model type isn't valid.
   */
  @Class.Private()
  private static getCollectionName(model: Mapping.Types.Model): string {
    const name = Mapping.Schema.getStorage(model);
    if (!name) {
      throw new Error(`There is no collection name for the specified model type.`);
    }
    return name;
  }

  /**
   * Build and get the collection validation.
   * @param model Model type.
   * @returns Returns the collection validation object.
   */
  @Class.Private()
  private static getCollectionValidation(model: Mapping.Types.Model): Object {
    const schema = Mapping.Schema.getRealRow(model);
    if (!schema) {
      throw new TypeError(`The specified entity model is not valid.`);
    }
    return {
      validator: {
        $jsonSchema: Schemas.build(schema)
      },
      validationLevel: 'strict',
      validationAction: 'error'
    };
  }

  /**
   * Build and get the primary filter based in the specified model type.
   * @param model Model type.
   * @param value Primary id value.
   * @returns Returns the primary filter.
   * @throws Throws an error when there is no primary column defined.
   */
  @Class.Private()
  private static getPrimaryFilter(model: Mapping.Types.Model, value: any): Mapping.Types.Entity {
    const primary = <Mapping.Columns.Real>Mapping.Schema.getPrimaryColumn(model);
    const filters = <any>{};
    if (!primary) {
      throw new Error(`There is no primary column to be used.`);
    }
    filters[primary.name] = { operator: Mapping.Statements.Operator.EQUAL, value: value };
    return filters;
  }

  /**
   * Build and get the field grouping based on the specified row schema.
   * @param real Real columns schema.
   * @param virtual Virtual schema.
   * @returns Returns the grouping entity.
   */
  @Class.Private()
  private static getFieldGrouping(real: Mapping.Columns.RealRow, virtual: Mapping.Columns.VirtualRow): Mapping.Types.Entity {
    const source = <Mapping.Columns.RealRow | Mapping.Columns.VirtualRow>{ ...real, ...virtual };
    const grouping = <Mapping.Types.Entity>{};
    for (const id in source) {
      const column = source[id];
      const name = 'alias' in column && column.alias !== void 0 ? column.alias : column.name;
      grouping[name] = { $first: `$${name}` };
    }
    grouping._id = '$_id';
    return grouping;
  }

  /**
   * Apply the specified aggregations into the target pipeline.
   * @param pipeline Target pipeline.
   * @param grouping Default grouping.
   * @param joins List of junctions.
   */
  @Class.Private()
  private static applyJoins(pipeline: Mapping.Types.Entity[], grouping: Mapping.Types.Entity, joins: Mapping.Statements.Join[]): void {
    for (const column of joins) {
      const group = { ...grouping };
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
  }

  /**
   * Apply the specified filters into the target pipeline.
   * @param pipeline Target pipeline.
   * @param filters Filters to be applied.
   */
  @Class.Private()
  private static applyFilters(pipeline: any[], filters: Mapping.Statements.Filter[]): void {
    while (filters.length) {
      pipeline.push(filters);
    }
  }

  /**
   * Purge all empty fields from the specified entities.
   * @param real Real column schema.
   * @param entities Entities to be purged.
   * @returns Returns the purged entities list.
   */
  @Class.Private()
  private static purgeEmptyFields<T extends Mapping.Types.Entity>(real: Mapping.Columns.RealRow, ...entities: T[]): T[] {
    let schema;
    for (let i = 0; i < entities.length; ++i) {
      for (const column in entities[i]) {
        if (entities[i][column] === null && (schema = real[column]) && !schema.formats.includes(Mapping.Types.Format.NULL)) {
          delete entities[i][column];
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
  public async modify(model: Class.Constructor<Mapping.Types.Entity>): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      collMod: Driver.getCollectionName(model),
      ...Driver.getCollectionValidation(model)
    });
  }

  /**
   * Creates the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async create(model: Mapping.Types.Model): Promise<void> {
    await (<Mongodb.Db>this.database).command({
      create: Driver.getCollectionName(model),
      ...Driver.getCollectionValidation(model)
    });
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns the list inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Types.Entity>(model: Mapping.Types.Model<T>, entities: T[]): Promise<string[]> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const result = await manager.insertMany(entities);
    return Object.values(<any>result.insertedIds);
  }

  /**
   * Finds the corresponding entity from the database.
   * @param model Model type.
   * @param joins List of junctions.
   * @param filters List of filters.
   * @param sort Sorting fields.
   * @param limit Result limits.
   * @returns Returns the  promise to get the list of entities found.
   * @returns Returns the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Types.Entity>(
    model: Mapping.Types.Model<T>,
    joins: Mapping.Statements.Join[],
    filters: Mapping.Statements.Filter[],
    sort?: Mapping.Statements.Sort,
    limit?: Mapping.Statements.Limit
  ): Promise<T[]> {
    const real = <Mapping.Columns.RealRow>Mapping.Schema.getRealRow(model);
    const virtual = <Mapping.Columns.VirtualRow>Mapping.Schema.getVirtualRow(model);
    const pipeline = <any[]>[{ $match: Filters.build(model, <Mapping.Types.Entity>filters.shift()) }];
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    Driver.applyJoins(pipeline, Driver.getFieldGrouping(real, virtual), joins);
    Driver.applyFilters(pipeline, filters);
    return await Class.perform(this, async () => {
      let records = await manager.aggregate(pipeline);
      if (sort) {
        records = await records.sort(sort);
      }
      if (limit) {
        records = await records.skip(limit.start).limit(limit.count);
      }
      return Driver.purgeEmptyFields(real, records);
    });
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param joins List of junctions.
   * @param id Entity id.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Types.Entity>(
    model: Mapping.Types.Model<T>,
    joins: Mapping.Statements.Join[],
    id: any
  ): Promise<T | undefined> {
    return (await this.find<T>(model, joins, [Driver.getPrimaryFilter(model, id)]))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param filter Filter expression.
   * @returns Returns the number of updated entities.
   */
  @Class.Public()
  public async update(model: Mapping.Types.Model, entity: Mapping.Types.Entity, filter: Mapping.Statements.Filter): Promise<number> {
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
  public async updateById(model: Mapping.Types.Model, entity: Mapping.Types.Model, id: any): Promise<boolean> {
    return (await this.update(model, entity, Driver.getPrimaryFilter(model, id))) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter columns.
   * @return Returns the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Mapping.Types.Model, filter: Mapping.Statements.Filter): Promise<number> {
    const manager = (<Mongodb.Db>this.database).collection(Driver.getCollectionName(model));
    const result = await manager.deleteMany(Filters.build(model, filter));
    return result.deletedCount || 0;
  }

  /**
   * Deletes the entity that corresponds to the specified id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Mapping.Types.Model, id: any): Promise<boolean> {
    return (await this.delete(model, Driver.getPrimaryFilter(model, id))) === 1;
  }
}
