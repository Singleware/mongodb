"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Aliases = require("./aliases");
const Engine = require("./engine");
const caster_1 = require("./caster");
/**
 * Schema helper class.
 */
let Schema = class Schema extends Aliases.Schema {
    /**
     * Decorates the specified property to be an object Id column.
     * @returns Returns the decorator method.
     */
    static ObjectId() {
        return (scope, property, descriptor) => {
            super.Id()(scope, property, descriptor);
            return super.Convert(caster_1.Caster.ObjectId.bind(caster_1.Caster))(scope, property, descriptor);
        };
    }
    /**
     * Decorates the specified property to be the document object Id column.
     * @returns Returns the decorator method.
     */
    static DocumentId() {
        return (scope, property, descriptor) => {
            this.ObjectId()(scope, property, descriptor);
            return super.Alias('_id')(scope, property, descriptor);
        };
    }
    /**
     *  Decorates the specified property to be an array column that accepts only Object Ids.
     * @param unique Determines whether the array items must be unique or not.
     * @param minimum Minimum items.
     * @param maximum Maximum items.
     * @returns Returns the decorator method.
     */
    static ArrayIds(unique, minimum, maximum) {
        return (scope, property, descriptor) => {
            super.Array(Engine.ObjectId, unique, minimum, maximum)(scope, property, descriptor);
            return super.Convert(caster_1.Caster.ObjectId.bind(caster_1.Caster))(scope, property, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an Object Id column.
     * @returns Returns the decorator method.
     */
    static Binary() {
        return (scope, property, descriptor) => {
            super.Binary()(scope, property, descriptor);
            return super.Convert(caster_1.Caster.Binary.bind(caster_1.Caster))(scope, property, descriptor);
        };
    }
};
__decorate([
    Class.Public()
], Schema, "ObjectId", null);
__decorate([
    Class.Public()
], Schema, "DocumentId", null);
__decorate([
    Class.Public()
], Schema, "ArrayIds", null);
__decorate([
    Class.Public()
], Schema, "Binary", null);
Schema = __decorate([
    Class.Describe()
], Schema);
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map