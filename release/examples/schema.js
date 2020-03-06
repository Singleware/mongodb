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
 * Test sub entity.
 */
let TestEntitySub = class TestEntitySub extends Class.Null {
};
__decorate([
    MongoDB.Schema.DocumentId(),
    Class.Public()
], TestEntitySub.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.String(),
    MongoDB.Schema.Number(),
    Class.Public()
], TestEntitySub.prototype, "value", void 0);
TestEntitySub = __decorate([
    MongoDB.Schema.Entity('TestEntitySub'),
    Class.Describe()
], TestEntitySub);
/**
 * Test entity.
 */
let TestEntity = class TestEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.DocumentId(),
    Class.Public()
], TestEntity.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.Null(),
    Class.Public()
], TestEntity.prototype, "null", void 0);
__decorate([
    MongoDB.Schema.Binary(),
    Class.Public()
], TestEntity.prototype, "binary", void 0);
__decorate([
    MongoDB.Schema.Boolean(),
    Class.Public()
], TestEntity.prototype, "boolean", void 0);
__decorate([
    MongoDB.Schema.Integer(),
    Class.Public()
], TestEntity.prototype, "integer", void 0);
__decorate([
    MongoDB.Schema.Integer(1),
    Class.Public()
], TestEntity.prototype, "minInteger", void 0);
__decorate([
    MongoDB.Schema.Integer(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxInteger", void 0);
__decorate([
    MongoDB.Schema.Integer(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeInteger", void 0);
__decorate([
    MongoDB.Schema.Decimal(),
    Class.Public()
], TestEntity.prototype, "decimal", void 0);
__decorate([
    MongoDB.Schema.Decimal(1),
    Class.Public()
], TestEntity.prototype, "minDecimal", void 0);
__decorate([
    MongoDB.Schema.Decimal(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxDecimal", void 0);
__decorate([
    MongoDB.Schema.Decimal(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeDecimal", void 0);
__decorate([
    MongoDB.Schema.Number(),
    Class.Public()
], TestEntity.prototype, "number", void 0);
__decorate([
    MongoDB.Schema.Number(1),
    Class.Public()
], TestEntity.prototype, "minNumber", void 0);
__decorate([
    MongoDB.Schema.Number(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxNumber", void 0);
__decorate([
    MongoDB.Schema.Number(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeNumber", void 0);
__decorate([
    MongoDB.Schema.String(),
    Class.Public()
], TestEntity.prototype, "string", void 0);
__decorate([
    MongoDB.Schema.String(1),
    Class.Public()
], TestEntity.prototype, "minString", void 0);
__decorate([
    MongoDB.Schema.String(void 0, 2),
    Class.Public()
], TestEntity.prototype, "maxString", void 0);
__decorate([
    MongoDB.Schema.String(1, 2),
    Class.Public()
], TestEntity.prototype, "rangeString", void 0);
__decorate([
    MongoDB.Schema.Enumeration(['a', 'b', 'c']),
    Class.Public()
], TestEntity.prototype, "enumeration", void 0);
__decorate([
    MongoDB.Schema.Pattern(/^([a-z]+)$/),
    Class.Public()
], TestEntity.prototype, "pattern", void 0);
__decorate([
    MongoDB.Schema.Timestamp(),
    Class.Public()
], TestEntity.prototype, "timestamp", void 0);
__decorate([
    MongoDB.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "minTimestamp", void 0);
__decorate([
    MongoDB.Schema.Timestamp(void 0, new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "maxTimestamp", void 0);
__decorate([
    MongoDB.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "rangeTimestamp", void 0);
__decorate([
    MongoDB.Schema.Date(),
    Class.Public()
], TestEntity.prototype, "date", void 0);
__decorate([
    MongoDB.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "minDate", void 0);
__decorate([
    MongoDB.Schema.Date(void 0, new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "maxDate", void 0);
__decorate([
    MongoDB.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0)),
    Class.Public()
], TestEntity.prototype, "rangeDate", void 0);
__decorate([
    MongoDB.Schema.Array(String),
    Class.Public()
], TestEntity.prototype, "stringArray", void 0);
__decorate([
    MongoDB.Schema.Array(String, [], true),
    Class.Public()
], TestEntity.prototype, "stringUniqueArray", void 0);
__decorate([
    MongoDB.Schema.Array(String, [], void 0, 1),
    Class.Public()
], TestEntity.prototype, "stringMinArray", void 0);
__decorate([
    MongoDB.Schema.Array(String, [], void 0, void 0, 2),
    Class.Public()
], TestEntity.prototype, "stringMaxArray", void 0);
__decorate([
    MongoDB.Schema.Array(String, [], void 0, 1, 2),
    Class.Public()
], TestEntity.prototype, "stringRangeArray", void 0);
__decorate([
    MongoDB.Schema.Array(Number),
    Class.Public()
], TestEntity.prototype, "numberArray", void 0);
__decorate([
    MongoDB.Schema.Array(Boolean),
    Class.Public()
], TestEntity.prototype, "booleanArray", void 0);
__decorate([
    MongoDB.Schema.Array(Date),
    Class.Public()
], TestEntity.prototype, "dateArray", void 0);
__decorate([
    MongoDB.Schema.Array(Object),
    Class.Public()
], TestEntity.prototype, "objectArray", void 0);
__decorate([
    MongoDB.Schema.Array(TestEntitySub),
    Class.Public()
], TestEntity.prototype, "entityArray", void 0);
__decorate([
    MongoDB.Schema.Map(String),
    Class.Public()
], TestEntity.prototype, "stringMap", void 0);
__decorate([
    MongoDB.Schema.Map(Number),
    Class.Public()
], TestEntity.prototype, "numberMap", void 0);
__decorate([
    MongoDB.Schema.Map(Boolean),
    Class.Public()
], TestEntity.prototype, "booleanMap", void 0);
__decorate([
    MongoDB.Schema.Map(Date),
    Class.Public()
], TestEntity.prototype, "dateMap", void 0);
__decorate([
    MongoDB.Schema.Map(TestEntitySub),
    Class.Public()
], TestEntity.prototype, "entityMap", void 0);
__decorate([
    MongoDB.Schema.Object(TestEntitySub),
    Class.Public()
], TestEntity.prototype, "entityObject", void 0);
TestEntity = __decorate([
    MongoDB.Schema.Entity('TestEntity'),
    Class.Describe()
], TestEntity);
/**
 * Test schema.
 */
async function example() {
    const client = new MongoDB.Client();
    console.log('Connecting...');
    if (await client.connect('mongodb://127.0.0.1/mapper-test')) {
        // Apply schema
        if (!(await client.hasCollection(TestEntity))) {
            await client.createCollection(TestEntity);
            console.log('Collection created');
        }
        else {
            await client.modifyCollection(TestEntity);
            console.log('Collection modified');
        }
        // Disconnect
        await client.disconnect();
        console.log('Disconnected');
    }
    else {
        console.error('Failed to connect to the database.');
    }
}
// Run example.
example();
//# sourceMappingURL=schema.js.map