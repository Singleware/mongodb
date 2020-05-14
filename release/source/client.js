"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const MongoDb = require("mongodb");
const Class = require("@singleware/class");
const Aliases = require("./types");
const Engine = require("./engine");
const session_1 = require("./session");
/**
 * MongoDb client class.
 */
let Client = /** @class */ (() => {
    let Client = class Client extends Class.Null {
        constructor() {
            super(...arguments);
            /**
             * Map of client session.
             */
            this.sessions = new WeakMap();
        }
        /**
         * Check whether or not the client is active.
         * @throws Throws an error when there's no active connection.
         */
        checkActiveClient() {
            if (!this.isConnected()) {
                throw new Error(`No connection found.`);
            }
        }
        /**
         * Get the connection database.
         */
        getDatabase() {
            this.checkActiveClient();
            return this.client.db();
        }
        /**
         * Get the collection validation schema.
         * @param model Model type.
         * @returns Returns the collection validation schema.
         */
        getValidationSchema(model) {
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
        async connect(uri, options) {
            if (this.client !== void 0) {
                throw new Error(`An active connection was found.`);
            }
            try {
                this.client = await MongoDb.MongoClient.connect(uri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    ignoreUndefined: true,
                    ...options
                });
                this.client.on('close', () => {
                    this.client = void 0;
                });
                return true;
            }
            catch (exception) {
                return false;
            }
        }
        /**
         * Disconnect the active connection.
         * @throws Throws an error when there's no active connection.
         */
        async disconnect() {
            this.checkActiveClient();
            await this.client.close();
        }
        /**
         * Determines whether or not the client is connected.
         * @returns Returns true when the client is connected, false otherwise.
         */
        isConnected() {
            return this.client !== void 0;
        }
        /**
         * Creates a new collection by the specified model type.
         * @param model Model type.
         */
        async createCollection(model) {
            await this.getDatabase().command({
                create: Aliases.Schema.getStorageName(model),
                ...this.getValidationSchema(model)
            });
        }
        /**
         * Modify the collection by the specified model type.
         * @param model Model type.
         */
        async modifyCollection(model) {
            await this.getDatabase().command({
                collMod: Aliases.Schema.getStorageName(model),
                ...this.getValidationSchema(model)
            });
        }
        /**
         * Remove the collection and all of its data by the specified model type.
         * @param model Model type.
         */
        async removeCollection(model) {
            await this.getDatabase().command({
                drop: Aliases.Schema.getStorageName(model)
            });
        }
        /**
         * Determines whether or not the collection for the given model type exists.
         * @param model Model type.
         * @returns Returns a promise to get true when the collection exists, false otherwise.
         */
        async hasCollection(model) {
            const filter = { name: Aliases.Schema.getStorageName(model) };
            const cursor = this.getDatabase().listCollections(filter, { nameOnly: true });
            return (await cursor.toArray()).length === 1;
        }
        /**
         * Start a new managed client session.
         * @param options Session options.
         * @returns Returns a new managed client session.
         */
        startSession(options) {
            this.checkActiveClient();
            const session = this.client.startSession(options);
            const managed = new session_1.Session(this.client, session);
            this.sessions.set(managed, session);
            return managed;
        }
        /**
         * End the specified managed session.
         * @param managed Managed session instance.
         * @throws Throw an error when the session doesn't found.
         */
        endSession(managed) {
            const session = this.sessions.get(managed);
            if (session === void 0) {
                throw new Error(`Session doesn't found.`);
            }
            else {
                this.sessions.delete(managed);
                session.endSession();
            }
        }
        /**
         * Get a new dynamic client session.
         * @param options Session options.
         * @returns Returns a new dynamic client session.
         */
        getSession(options) {
            this.checkActiveClient();
            return new session_1.Session(this.client, options);
        }
    };
    __decorate([
        Class.Private()
    ], Client.prototype, "sessions", void 0);
    __decorate([
        Class.Private()
    ], Client.prototype, "client", void 0);
    __decorate([
        Class.Private()
    ], Client.prototype, "checkActiveClient", null);
    __decorate([
        Class.Private()
    ], Client.prototype, "getDatabase", null);
    __decorate([
        Class.Private()
    ], Client.prototype, "getValidationSchema", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "connect", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "disconnect", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "isConnected", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "createCollection", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "modifyCollection", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "removeCollection", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "hasCollection", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "startSession", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "endSession", null);
    __decorate([
        Class.Public()
    ], Client.prototype, "getSession", null);
    Client = __decorate([
        Class.Describe()
    ], Client);
    return Client;
})();
exports.Client = Client;
//# sourceMappingURL=client.js.map