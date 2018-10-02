/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Source from 'mongodb';
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';

import { Filters } from './filters';
import { Schemas } from './schemas';

/**
 * Mongo DB driver class.
 */
@Class.Describe()
export class Driver implements Mapping.Driver {
  /**
   * Driver connection.
   */
  @Class.Private()
  private connection?: Source.MongoClient;

  /**
   * Driver database.
   */
  @Class.Private()
  private database?: Source.Db;

  /**
   * Driver connection options.
   */
  @Class.Private()
  private options = {
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
  private getCollectionName(model: Class.Constructor<Mapping.Entity>): string {
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
  private getCollectionOptions(model: Class.Constructor<Mapping.Entity>): Object {
    return {
      validator: {
        $jsonSchema: Schemas.build(<Mapping.Map<Mapping.Column>>Mapping.Schema.getRow(model))
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
  private getPrimaryProperty(model: Class.Constructor<Mapping.Entity>): Mapping.Column {
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
  private getPrimaryFilter(model: Class.Constructor<Mapping.Entity>, value: any): Mapping.Entity {
    const filters = <any>{};
    const primary = this.getPrimaryProperty(model);
    filters[primary.name] = { operator: Mapping.Operator.EQUAL, value: value };
    return filters;
  }

  /**
   * Connect to the MongoDb URI.
   * @param uri Connection URI.
   */
  @Class.Public()
  public async connect(uri: string): Promise<void> {
    await new Promise<Source.Db>(
      (resolve: Function, reject: Function): void => {
        Source.MongoClient.connect(
          uri,
          this.options,
          (error: Source.MongoError, connection: Source.MongoClient) => {
            if (error) {
              reject(error);
            } else {
              this.connection = connection;
              this.database = connection.db();
              resolve();
            }
          }
        );
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
        (<Source.MongoClient>this.connection).close((error: Source.MongoError) => {
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
    await (<Source.Db>this.database).command({
      collMod: this.getCollectionName(model),
      ...this.getCollectionOptions(model)
    });
  }

  /**
   * Creates the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async create(model: Class.Constructor<Mapping.Entity>): Promise<void> {
    await (<Source.Db>this.database).command({
      create: this.getCollectionName(model),
      ...this.getCollectionOptions(model)
    });
  }

  /**
   * Inserts all specified entities into the database.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns the list inserted entities.
   */
  @Class.Public()
  public async insert<T extends Mapping.Entity>(model: Class.Constructor<T>, ...entities: T[]): Promise<string[]> {
    const manager = (<Source.Db>this.database).collection(this.getCollectionName(model));
    const result = await manager.insertMany(entities);
    return Object.values(<any>result.insertedIds);
  }

  /**
   * Finds the corresponding entity from the database.
   * @param model Model type.
   * @param filter Filter expression.
   * @param aggregate Aggregated entries.
   * @returns Returns the list of entities found.
   */
  @Class.Public()
  public async find<T extends Mapping.Entity>(
    model: Class.Constructor<T>,
    filter: Mapping.Expression,
    aggregate: Mapping.Aggregate[]
  ): Promise<T[]> {
    const filters = Filters.build(model, filter);
    const manager = (<Source.Db>this.database).collection(this.getCollectionName(model));
    if (!aggregate.length) {
      return await manager.find(filters).toArray();
    }
    const pipeline = <any[]>[{ $match: filters }];
    for (const column of aggregate) {
      pipeline.push({
        $lookup: {
          from: column.storage,
          localField: column.local,
          foreignField: column.foreign,
          as: column.virtual
        }
      });
    }
    return await manager.aggregate(pipeline).toArray();
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param value Entity id.
   * @param aggregate Aggregated entries.
   * @returns Returns a promise to get the found entity or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<T extends Mapping.Entity>(
    model: Class.Constructor<T>,
    value: any,
    aggregate: Mapping.Aggregate[]
  ): Promise<T | undefined> {
    return (await this.find<T>(model, this.getPrimaryFilter(model, value), aggregate))[0];
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns the number of updated entities.
   */
  @Class.Public()
  public async update(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression, entity: Mapping.Entity): Promise<number> {
    const manager = (<Source.Db>this.database).collection(this.getCollectionName(model));
    const result = await manager.updateMany(Filters.build(model, filter), { $set: entity });
    return result.modifiedCount;
  }

  /**
   * Updates the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param value Entity id.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(model: Class.Constructor<Mapping.Entity>, value: any, entity: Mapping.Entity): Promise<boolean> {
    return (await this.update(model, this.getPrimaryFilter(model, value), entity)) === 1;
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter columns.
   * @return Returns the number of deleted entities.
   */
  @Class.Public()
  public async delete(model: Class.Constructor<Mapping.Entity>, filter: Mapping.Expression): Promise<number> {
    const manager = (<Source.Db>this.database).collection(this.getCollectionName(model));
    const result = await manager.deleteMany(Filters.build(model, filter));
    return result.deletedCount || 0;
  }

  /**
   * Deletes the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param value Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(model: Class.Constructor<Mapping.Entity>, value: any): Promise<boolean> {
    return (await this.delete(model, this.getPrimaryFilter(model, value))) === 1;
  }
}
