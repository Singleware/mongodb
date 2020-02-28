/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as MongoDb from 'mongodb';

import * as Class from '@singleware/class';

import * as Aliases from './types';
import * as Engine from './engine';

import { Session } from './session';

/**
 * MongoDb client class.
 */
@Class.Describe()
export class Client extends Class.Null {
  /**
   * Map of client session.
   */
  @Class.Private()
  private sessions = new WeakMap<Session, MongoDb.ClientSession>();

  /**
   * Client instance.
   */
  @Class.Private()
  private client?: MongoDb.MongoClient;

  /**
   * Check whether or not the client is active.
   * @throws Throws an error when there's no active connection.
   */
  @Class.Private()
  private checkActiveClient(): void {
    if (!this.isConnected()) {
      throw new Error(`No connection found.`);
    }
  }

  /**
   * Get the connection database.
   */
  @Class.Private()
  private getDatabase(): MongoDb.Db {
    this.checkActiveClient();
    return this.client!.db();
  }

  /**
   * Get the collection validation schema.
   * @param model Model type.
   * @returns Returns the collection validation schema.
   */
  @Class.Private()
  private getValidationSchema(model: Aliases.Model): Object {
    return {
      validator: {
        $jsonSchema: Engine.Schema.build(Aliases.Schema.getRealRow(model))
      },
      validationLevel: 'strict',
      validationAction: 'error'
    };
  }

  /**
   * Connect to the specified URI.
   * @param uri Connection URI.
   * @param options Connection options.
   * @returns Returns a promise to get true when the connection was established, false otherwise.
   * @throws Throws an error when there's an active connection.
   */
  @Class.Public()
  public async connect(uri: string, options?: MongoDb.MongoClientOptions): Promise<boolean> {
    if (this.client !== void 0) {
      throw new Error(`An active connection was found.`);
    }
    try {
      this.client = await MongoDb.MongoClient.connect(uri, <MongoDb.MongoClientOptions>{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ignoreUndefined: true,
        ...options
      });
      this.client.on('close', () => {
        this.client = void 0;
      });
      return true;
    } catch (exception) {
      return false;
    }
  }

  /**
   * Disconnect the active connection.
   * @throws Throws an error when there's no active connection.
   */
  @Class.Public()
  public async disconnect(): Promise<void> {
    this.checkActiveClient();
    await this.client!.close();
  }

  /**
   * Determines whether or not the client is connected.
   * @returns Returns true when the client is connected, false otherwise.
   */
  @Class.Public()
  public isConnected(): boolean {
    return this.client !== void 0;
  }

  /**
   * Creates a new collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async createCollection(model: Aliases.Model): Promise<void> {
    await this.getDatabase().command({
      create: Aliases.Schema.getStorageName(model),
      ...this.getValidationSchema(model)
    });
  }

  /**
   * Modify the collection by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async modifyCollection(model: Class.Constructor<Aliases.Entity>): Promise<void> {
    await this.getDatabase().command({
      collMod: Aliases.Schema.getStorageName(model),
      ...this.getValidationSchema(model)
    });
  }

  /**
   * Remove the collection and all of its data by the specified model type.
   * @param model Model type.
   */
  @Class.Public()
  public async removeCollection(model: Class.Constructor<Aliases.Entity>): Promise<void> {
    await this.getDatabase().command({
      drop: Aliases.Schema.getStorageName(model)
    });
  }

  /**
   * Determines whether or not the collection for the given model type exists.
   * @param model Model type.
   * @returns Returns a promise to get true when the collection exists, false otherwise.
   */
  @Class.Public()
  public async hasCollection(model: Aliases.Model): Promise<boolean> {
    const filter = { name: Aliases.Schema.getStorageName(model) };
    const cursor = this.getDatabase().listCollections(filter, { nameOnly: true });
    return (await cursor.toArray()).length === 1;
  }

  /**
   * Start a new managed client session.
   * @param options Session options.
   * @returns Returns a new managed client session.
   */
  @Class.Public()
  public startSession(options?: MongoDb.SessionOptions): Session {
    this.checkActiveClient();
    const session = this.client!.startSession(options);
    const managed = new Session(this.client!, session);
    this.sessions.set(managed, session);
    return managed;
  }

  /**
   * End the specified managed session.
   * @param managed Managed session instance.
   * @throws Throw an error when the session doesn't found.
   */
  @Class.Public()
  public endSession(managed: Session): void {
    const session = this.sessions.get(managed);
    if (session === void 0) {
      throw new Error(`Session doesn't found.`);
    } else {
      this.sessions.delete(managed);
      session.endSession();
    }
  }

  /**
   * Get a new dynamic client session.
   * @param options Session options.
   * @returns Returns a new dynamic client session.
   */
  @Class.Public()
  public getSession(options?: MongoDb.SessionOptions): Session {
    this.checkActiveClient();
    return new Session(this.client!, options);
  }
}
