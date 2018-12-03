"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use a simple entity CRUD with mapper
 * package.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const MongoDB = require("../source");
/**
 * Connection string.
 */
const connection = 'mongodb://127.0.0.1:27017/mapper-test';
/**
 * Database driver.
 */
const driver = new MongoDB.Driver();
/**
 * Test class.
 */
let UserEntity = class UserEntity extends Class.Null {
};
__decorate([
    Mapping.Schema.Id(),
    Mapping.Schema.Alias('_id'),
    Class.Public()
], UserEntity.prototype, "id", void 0);
__decorate([
    Mapping.Schema.String(),
    Class.Public()
], UserEntity.prototype, "firstName", void 0);
__decorate([
    Mapping.Schema.String(),
    Class.Public()
], UserEntity.prototype, "lastName", void 0);
UserEntity = __decorate([
    Mapping.Schema.Entity('UserEntity'),
    Class.Describe()
], UserEntity);
/**
 * Database mapper.
 */
let UserMapper = class UserMapper extends Mapping.Mapper {
    constructor() {
        super(driver, UserEntity);
    }
    /**
     * Create a test user.
     * @returns Returns the id of new user.
     */
    async create() {
        return await this.insert({ firstName: 'First 1', lastName: 'Last 1' });
    }
    /**
     * Change the test user.
     * @param id USer id.
     * @returns Returns the number of updated users.
     */
    async change(id) {
        return await this.update({ id: { operator: Mapping.Operator.EQUAL, value: id } }, { firstName: 'Changed!' });
    }
    /**
     * Read the test user.
     * @param id User id.
     * @requires Returns the list of users found.
     */
    async read(id) {
        return await this.find({ id: { operator: Mapping.Operator.EQUAL, value: id } });
    }
    /**
     * Remove the test user.
     * @param id User id.
     */
    async remove(id) {
        return await this.delete({ id: { operator: Mapping.Operator.EQUAL, value: id } });
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
], UserMapper.prototype, "read", null);
__decorate([
    Class.Public()
], UserMapper.prototype, "remove", null);
UserMapper = __decorate([
    Class.Describe()
], UserMapper);
/**
 * Test operations.
 */
async function crudTest() {
    // User mapper class.
    const mapper = new UserMapper();
    // Connect
    await driver.connect(connection);
    console.log('Connect');
    // Create user
    const id = await mapper.create();
    console.log('Create:', id);
    // Read user
    const before = await mapper.read(id);
    console.log('Read before:', before[0].firstName, before[0].lastName);
    // Update user
    console.log('Update:', await mapper.change(id));
    const after = await mapper.read(id);
    // Read user
    console.log('Read after:', after[0].firstName, after[0].lastName);
    // Delete user
    console.log('Delete:', await mapper.remove(id));
    // Disconnect
    await driver.disconnect();
    console.log('Disconnect');
}
crudTest();
