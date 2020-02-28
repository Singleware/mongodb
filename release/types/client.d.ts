/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as MongoDb from 'mongodb';
import * as Class from '@singleware/class';
import * as Aliases from './types';
import { Session } from './session';
/**
 * MongoDb client class.
 */
export declare class Client extends Class.Null {
    /**
     * Map of client session.
     */
    private sessions;
    /**
     * Client instance.
     */
    private client?;
    /**
     * Check whether or not the client is active.
     * @throws Throws an error when there's no active connection.
     */
    private checkActiveClient;
    /**
     * Get the connection database.
     */
    private getDatabase;
    /**
     * Get the collection validation schema.
     * @param model Model type.
     * @returns Returns the collection validation schema.
     */
    private getValidationSchema;
    /**
     * Connect to the specified URI.
     * @param uri Connection URI.
     * @param options Connection options.
     * @returns Returns a promise to get true when the connection was established, false otherwise.
     * @throws Throws an error when there's an active connection.
     */
    connect(uri: string, options?: MongoDb.MongoClientOptions): Promise<boolean>;
    /**
     * Disconnect the active connection.
     * @throws Throws an error when there's no active connection.
     */
    disconnect(): Promise<void>;
    /**
     * Determines whether or not the client is connected.
     * @returns Returns true when the client is connected, false otherwise.
     */
    isConnected(): boolean;
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    createCollection(model: Aliases.Model): Promise<void>;
    /**
     * Modify the collection by the specified model type.
     * @param model Model type.
     */
    modifyCollection(model: Class.Constructor<Aliases.Entity>): Promise<void>;
    /**
     * Remove the collection and all of its data by the specified model type.
     * @param model Model type.
     */
    removeCollection(model: Class.Constructor<Aliases.Entity>): Promise<void>;
    /**
     * Determines whether or not the collection for the given model type exists.
     * @param model Model type.
     * @returns Returns a promise to get true when the collection exists, false otherwise.
     */
    hasCollection(model: Aliases.Model): Promise<boolean>;
    /**
     * Start a new managed client session.
     * @param options Session options.
     * @returns Returns a new managed client session.
     */
    startSession(options?: MongoDb.SessionOptions): Session;
    /**
     * End the specified managed session.
     * @param managed Managed session instance.
     * @throws Throw an error when the session doesn't found.
     */
    endSession(managed: Session): void;
    /**
     * Get a new dynamic client session.
     * @param options Session options.
     * @returns Returns a new dynamic client session.
     */
    getSession(options?: MongoDb.SessionOptions): Session;
}
