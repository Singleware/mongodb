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
 * The proposal of this example is to show how to use a simple json schema with mapper
 * package.
 */
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
let TestEntitySub = class TestEntitySub {
};
__decorate([
    Mapping.Schema.Id(),
    Mapping.Schema.Alias('_id')
], TestEntitySub.prototype, "id", void 0);
__decorate([
    Mapping.Schema.String(),
    Mapping.Schema.Number()
], TestEntitySub.prototype, "value", void 0);
TestEntitySub = __decorate([
    Mapping.Schema.Entity('TestEntitySub')
], TestEntitySub);
/**
 * Test entity.
 */
let TestEntity = class TestEntity {
};
__decorate([
    Mapping.Schema.Id(),
    Mapping.Schema.Alias('_id')
], TestEntity.prototype, "id", void 0);
__decorate([
    Mapping.Schema.Null()
], TestEntity.prototype, "null", void 0);
__decorate([
    Mapping.Schema.Boolean()
], TestEntity.prototype, "boolean", void 0);
__decorate([
    Mapping.Schema.Integer()
], TestEntity.prototype, "integer", void 0);
__decorate([
    Mapping.Schema.Integer(1)
], TestEntity.prototype, "minInteger", void 0);
__decorate([
    Mapping.Schema.Integer(0, 2)
], TestEntity.prototype, "maxInteger", void 0);
__decorate([
    Mapping.Schema.Integer(1, 2)
], TestEntity.prototype, "rangeInteger", void 0);
__decorate([
    Mapping.Schema.Decimal()
], TestEntity.prototype, "decimal", void 0);
__decorate([
    Mapping.Schema.Decimal(1)
], TestEntity.prototype, "minDecimal", void 0);
__decorate([
    Mapping.Schema.Decimal(0, 2)
], TestEntity.prototype, "maxDecimal", void 0);
__decorate([
    Mapping.Schema.Decimal(1, 2)
], TestEntity.prototype, "rangeDecimal", void 0);
__decorate([
    Mapping.Schema.Number()
], TestEntity.prototype, "number", void 0);
__decorate([
    Mapping.Schema.Number(1)
], TestEntity.prototype, "minNumber", void 0);
__decorate([
    Mapping.Schema.Number(0, 2)
], TestEntity.prototype, "maxNumber", void 0);
__decorate([
    Mapping.Schema.Number(1, 2)
], TestEntity.prototype, "rangeNumber", void 0);
__decorate([
    Mapping.Schema.String()
], TestEntity.prototype, "string", void 0);
__decorate([
    Mapping.Schema.String(1)
], TestEntity.prototype, "minString", void 0);
__decorate([
    Mapping.Schema.String(0, 2)
], TestEntity.prototype, "maxString", void 0);
__decorate([
    Mapping.Schema.String(1, 2)
], TestEntity.prototype, "rangeString", void 0);
__decorate([
    Mapping.Schema.Enumeration('a', 'b', 'c')
], TestEntity.prototype, "enumeration", void 0);
__decorate([
    Mapping.Schema.Pattern(/^([a-z]+)$/)
], TestEntity.prototype, "pattern", void 0);
__decorate([
    Mapping.Schema.Timestamp()
], TestEntity.prototype, "timestamp", void 0);
__decorate([
    Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0))
], TestEntity.prototype, "minTimestamp", void 0);
__decorate([
    Mapping.Schema.Timestamp(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
], TestEntity.prototype, "maxTimestamp", void 0);
__decorate([
    Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
], TestEntity.prototype, "rangeTimestamp", void 0);
__decorate([
    Mapping.Schema.Date()
], TestEntity.prototype, "date", void 0);
__decorate([
    Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0))
], TestEntity.prototype, "minDate", void 0);
__decorate([
    Mapping.Schema.Date(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
], TestEntity.prototype, "maxDate", void 0);
__decorate([
    Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
], TestEntity.prototype, "rangeDate", void 0);
__decorate([
    Mapping.Schema.Array(String)
], TestEntity.prototype, "stringArray", void 0);
__decorate([
    Mapping.Schema.Array(String, true)
], TestEntity.prototype, "stringUnqiueArray", void 0);
__decorate([
    Mapping.Schema.Array(String, void 0, 1)
], TestEntity.prototype, "stringMinArray", void 0);
__decorate([
    Mapping.Schema.Array(String, void 0, void 0, 2)
], TestEntity.prototype, "stringMaxArray", void 0);
__decorate([
    Mapping.Schema.Array(String, void 0, 1, 2)
], TestEntity.prototype, "stringRangeArray", void 0);
__decorate([
    Mapping.Schema.Array(Number)
], TestEntity.prototype, "numberArray", void 0);
__decorate([
    Mapping.Schema.Array(Boolean)
], TestEntity.prototype, "booleanArray", void 0);
__decorate([
    Mapping.Schema.Array(Date)
], TestEntity.prototype, "dateArray", void 0);
__decorate([
    Mapping.Schema.Array(Object)
], TestEntity.prototype, "objectArray", void 0);
__decorate([
    Mapping.Schema.Array(TestEntitySub)
], TestEntity.prototype, "entityArray", void 0);
__decorate([
    Mapping.Schema.Object(TestEntitySub)
], TestEntity.prototype, "entityObject", void 0);
TestEntity = __decorate([
    Mapping.Schema.Entity('TestEntity')
], TestEntity);
/**
 * Test schema.
 */
async function test() {
    // Connect
    await driver.connect(connection);
    console.log('Connect');
    // Apply schema
    await driver.modify(Mapping.Schema.getStorageName(TestEntity), Mapping.Schema.getRow(TestEntity));
    console.log('Modify');
    // Disconnect
    await driver.disconnect();
    console.log('Disconnect');
}
test();
