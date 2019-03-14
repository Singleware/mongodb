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
 * Test sub entity.
 */
let TestEntitySub = class TestEntitySub extends Class.Null {
};
__decorate([
    Mapping.Schema.Id(),
    Mapping.Schema.Alias('_id'),
    Class.Public()
], TestEntitySub.prototype, "id", void 0);
__decorate([
    Mapping.Schema.String(),
    Mapping.Schema.Number(),
    Class.Public()
], TestEntitySub.prototype, "value", void 0);
TestEntitySub = __decorate([
    Mapping.Schema.Entity('TestEntitySub'),
    Class.Describe()
], TestEntitySub);
/**
 * Test entity.
 */
let TestEntity = class TestEntity extends Class.Null {
};
__decorate([
    Mapping.Schema.Id(),
    Mapping.Schema.Alias('_id'),
    Class.Public()
], TestEntity.prototype, "id", void 0);
__decorate([
    Mapping.Schema.Null(),
    Class.Public()
], TestEntity.prototype, "null", void 0);
__decorate([
    Mapping.Schema.Binary(),
    Class.Public()
], TestEntity.prototype, "binary", void 0);
__decorate([
    Mapping.Schema.Boolean(),
    Class.Public()
], TestEntity.prototype, "boolean", void 0);
__decorate([
    Mapping.Schema.Integer(),
    Class.Public()
], TestEntity.prototype, "integer", void 0);
__decorate([
    Mapping.Schema.Integer(1),
    Class.Public()
], TestEntity.prototype, "minInteger", void 0);
__decorate([
    Mapping.Schema.Integer(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxInteger", void 0);
__decorate([
    Mapping.Schema.Integer(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeInteger", void 0);
__decorate([
    Mapping.Schema.Decimal(),
    Class.Public()
], TestEntity.prototype, "decimal", void 0);
__decorate([
    Mapping.Schema.Decimal(1),
    Class.Public()
], TestEntity.prototype, "minDecimal", void 0);
__decorate([
    Mapping.Schema.Decimal(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxDecimal", void 0);
__decorate([
    Mapping.Schema.Decimal(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeDecimal", void 0);
__decorate([
    Mapping.Schema.Number(),
    Class.Public()
], TestEntity.prototype, "number", void 0);
__decorate([
    Mapping.Schema.Number(1),
    Class.Public()
], TestEntity.prototype, "minNumber", void 0);
__decorate([
    Mapping.Schema.Number(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxNumber", void 0);
__decorate([
    Mapping.Schema.Number(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeNumber", void 0);
__decorate([
    Mapping.Schema.String(),
    Class.Public()
], TestEntity.prototype, "string", void 0);
__decorate([
    Mapping.Schema.String(1),
    Class.Public()
], TestEntity.prototype, "minString", void 0);
__decorate([
    Mapping.Schema.String(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxString", void 0);
__decorate([
    Mapping.Schema.String(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeString", void 0);
__decorate([
    Mapping.Schema.Enumeration('a', 'b', 'c'),
    Class.Public()
], TestEntity.prototype, "enumeration", void 0);
__decorate([
    Mapping.Schema.Pattern(/^([a-z]+)$/),
    Class.Public()
], TestEntity.prototype, "pattern", void 0);
__decorate([
    Mapping.Schema.Timestamp(),
    Class.Public()
], TestEntity.prototype, "timestamp", void 0);
__decorate([
    Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "minTimestamp", void 0);
__decorate([
    Mapping.Schema.Timestamp(void 0, new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "maxTimestamp", void 0);
__decorate([
    Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "rangeTimestamp", void 0);
__decorate([
    Mapping.Schema.Date(),
    Class.Public()
], TestEntity.prototype, "date", void 0);
__decorate([
    Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "minDate", void 0);
__decorate([
    Mapping.Schema.Date(void 0, new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "maxDate", void 0);
__decorate([
    Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "rangeDate", void 0);
__decorate([
    Mapping.Schema.Array(String),
    Class.Public()
], TestEntity.prototype, "stringArray", void 0);
__decorate([
    Mapping.Schema.Array(String, true),
    Class.Public()
], TestEntity.prototype, "stringUniqueArray", void 0);
__decorate([
    Mapping.Schema.Array(String, void 0, 1),
    Class.Public()
], TestEntity.prototype, "stringMinArray", void 0);
__decorate([
    Mapping.Schema.Array(String, void 0, void 0, 2),
    Class.Public()
], TestEntity.prototype, "stringMaxArray", void 0);
__decorate([
    Mapping.Schema.Array(String, void 0, 1, 2),
    Class.Public()
], TestEntity.prototype, "stringRangeArray", void 0);
__decorate([
    Mapping.Schema.Array(Number),
    Class.Public()
], TestEntity.prototype, "numberArray", void 0);
__decorate([
    Mapping.Schema.Array(Boolean),
    Class.Public()
], TestEntity.prototype, "booleanArray", void 0);
__decorate([
    Mapping.Schema.Array(Date),
    Class.Public()
], TestEntity.prototype, "dateArray", void 0);
__decorate([
    Mapping.Schema.Array(Object),
    Class.Public()
], TestEntity.prototype, "objectArray", void 0);
__decorate([
    Mapping.Schema.Array(TestEntitySub),
    Class.Public()
], TestEntity.prototype, "entityArray", void 0);
__decorate([
    Mapping.Schema.Map(String),
    Class.Public()
], TestEntity.prototype, "stringMap", void 0);
__decorate([
    Mapping.Schema.Map(Number),
    Class.Public()
], TestEntity.prototype, "numberMap", void 0);
__decorate([
    Mapping.Schema.Map(Boolean),
    Class.Public()
], TestEntity.prototype, "booleanMap", void 0);
__decorate([
    Mapping.Schema.Map(Date),
    Class.Public()
], TestEntity.prototype, "dateMap", void 0);
__decorate([
    Mapping.Schema.Map(TestEntitySub),
    Class.Public()
], TestEntity.prototype, "entityMap", void 0);
__decorate([
    Mapping.Schema.Object(TestEntitySub),
    Class.Public()
], TestEntity.prototype, "entityObject", void 0);
TestEntity = __decorate([
    Mapping.Schema.Entity('TestEntity'),
    Class.Describe()
], TestEntity);
/**
 * Test schema.
 */
async function test() {
    // Connect
    await driver.connect(connection);
    console.log('Connect');
    // Apply schema
    if (!(await driver.hasCollection(TestEntity))) {
        await driver.createCollection(TestEntity);
    }
    else {
        await driver.modifyCollection(TestEntity);
    }
    console.log('Modified');
    // Disconnect
    await driver.disconnect();
    console.log('Disconnect');
}
test();
