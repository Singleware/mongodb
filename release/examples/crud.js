"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const MongoDB = require("../source");
/**
 * User details, entity class.
 */
let UserDetailsEntity = /** @class */ (() => {
    let UserDetailsEntity = class UserDetailsEntity extends Class.Null {
    };
    __decorate([
        MongoDB.Schema.Date(),
        Class.Public()
    ], UserDetailsEntity.prototype, "birthDate", void 0);
    __decorate([
        MongoDB.Schema.String(),
        Class.Public()
    ], UserDetailsEntity.prototype, "phone", void 0);
    __decorate([
        MongoDB.Schema.String(),
        Class.Public()
    ], UserDetailsEntity.prototype, "email", void 0);
    UserDetailsEntity = __decorate([
        MongoDB.Schema.Entity('UserDetailsEntity'),
        Class.Describe()
    ], UserDetailsEntity);
    return UserDetailsEntity;
})();
/**
 * User entity class.
 */
let UserEntity = /** @class */ (() => {
    let UserEntity = class UserEntity extends Class.Null {
    };
    __decorate([
        MongoDB.Schema.Primary(),
        MongoDB.Schema.DocumentId(),
        Class.Public()
    ], UserEntity.prototype, "id", void 0);
    __decorate([
        MongoDB.Schema.String(),
        Class.Public()
    ], UserEntity.prototype, "firstName", void 0);
    __decorate([
        MongoDB.Schema.String(),
        Class.Public()
    ], UserEntity.prototype, "lastName", void 0);
    __decorate([
        MongoDB.Schema.Required(),
        MongoDB.Schema.Object(UserDetailsEntity),
        Class.Public()
    ], UserEntity.prototype, "details", void 0);
    UserEntity = __decorate([
        MongoDB.Schema.Entity('UserEntity'),
        Class.Describe()
    ], UserEntity);
    return UserEntity;
})();
/**
 * Database mapper.
 */
let UserMapper = /** @class */ (() => {
    let UserMapper = class UserMapper extends MongoDB.Mapper {
        /**
         * Default constructor.
         * @param session Mapper session.
         */
        constructor(session) {
            super(session, UserEntity);
        }
        /**
         * Create a test user.
         * @returns Returns a promise to get the new user id.
         */
        async create() {
            return await this.insert({
                firstName: 'First 1',
                lastName: 'Last 1',
                details: {
                    birthDate: new Date()
                }
            });
        }
        /**
         * Change the test user.
         * @param id User id.
         * @returns Returns a promise to get true when the is updated.
         */
        async change(id) {
            return await this.updateById(id, {
                firstName: 'Changed!',
                details: {
                    phone: '+551199999999'
                }
            });
        }
        /**
         * Replace the test user.
         * @param id User id.
         * @returns Returns a promise to get the replacement status.
         */
        async replace(id) {
            return await this.replaceById(id, {
                id: id,
                firstName: 'Replaced!',
                details: {}
            });
        }
        /**
         * Read the test user.
         * @param id User id.
         * @returns Returns a promise to get user entity.
         */
        async read(id) {
            return await this.findById(id);
        }
        /**
         * Remove the test user.
         * @param id User id.
         * @returns Returns a promise to get true when the user is removed.
         */
        async remove(id) {
            return await this.deleteById(id);
        }
    };
    __decorate([
        Class.Public()
    ], UserMapper.prototype, "create", null);
    __decorate([
        Class.Public()
    ], UserMapper.prototype, "change", null);
    __decorate([
        Class.Public()
    ], UserMapper.prototype, "replace", null);
    __decorate([
        Class.Public()
    ], UserMapper.prototype, "read", null);
    __decorate([
        Class.Public()
    ], UserMapper.prototype, "remove", null);
    UserMapper = __decorate([
        Class.Describe()
    ], UserMapper);
    return UserMapper;
})();
/**
 * Test operations.
 */
async function example() {
    const client = new MongoDB.Client();
    console.log('Connecting...');
    if (await client.connect('mongodb://127.0.0.1/mapper-test')) {
        const session = client.getSession();
        const mapper = new UserMapper(session);
        // Setup collection
        if (!(await client.hasCollection(UserEntity))) {
            await client.createCollection(UserEntity);
            console.log('Collection created');
        }
        else {
            await client.modifyCollection(UserEntity);
            console.log('Collection modified');
        }
        // Create user
        const id = await mapper.create();
        const before = (await mapper.read(id));
        console.log('Create:', id, before.firstName, before.lastName, before.details.birthDate, before.details.phone, before.details.email);
        // Update user
        const update = await mapper.change(id);
        const middle = (await mapper.read(id));
        console.log('Update:', update, middle.firstName, middle.lastName, middle.details.birthDate, middle.details.phone, middle.details.email);
        // Replace user
        const replace = await mapper.replace(id);
        const after = (await mapper.read(id));
        console.log('Replace:', replace, after.firstName, after.lastName, after.details.birthDate, after.details.phone, after.details.email);
        // Delete user
        console.log('Delete:', await mapper.remove(id));
        // Disconnect
        await client.disconnect();
        console.log('Disconnect');
    }
    else {
        console.error('Failed to connect to the database.');
    }
}
// Run example.
example();
//# sourceMappingURL=crud.js.map