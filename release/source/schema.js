"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("./types");
const Engine = require("./engine");
const caster_1 = require("./caster");
/**
 * Schema helper class.
 */
let Schema = /** @class */ (() => {
    let Schema = class Schema extends Types.Schema {
        /**
         * Decorates the specified property to be an object Id column.
         * @returns Returns the decorator method.
         */
        static ObjectId() {
            return (target, property, descriptor) => {
                super.Id()(target, property, descriptor);
                return super.Convert(caster_1.Caster.ObjectId.bind(caster_1.Caster))(target, property, descriptor);
            };
        }
        /**
         * Decorates the specified property to be the document object Id column.
         * @returns Returns the decorator method.
         */
        static DocumentId() {
            return (target, property, descriptor) => {
                this.ObjectId()(target, property, descriptor);
                return super.Alias('_id')(target, property, descriptor);
            };
        }
        /**
         * Decorates the specified property to be a map column that accepts only Object Ids.
         * @returns Returns the decorator method.
         */
        static MapIds() {
            return (target, property, descriptor) => {
                super.Map(Engine.ObjectId)(target, property, descriptor);
                return super.Convert(caster_1.Caster.ObjectIdMap.bind(caster_1.Caster))(target, property, descriptor);
            };
        }
        /**
         * Decorates the specified property to be an array column that accepts only Object Ids.
         * @param unique Determines whether or not the array of items must be unique.
         * @param minimum Minimum items.
         * @param maximum Maximum items.
         * @returns Returns the decorator method.
         */
        static ArrayIds(unique, minimum, maximum) {
            return (target, property, descriptor) => {
                super.Array(Engine.ObjectId, void 0, unique, minimum, maximum)(target, property, descriptor);
                return super.Convert(caster_1.Caster.ObjectIdArray.bind(caster_1.Caster))(target, property, descriptor);
            };
        }
        /**
         * Decorates the specified property to be an Object Id column.
         * @returns Returns the decorator method.
         */
        static Binary() {
            return (target, property, descriptor) => {
                super.Binary()(target, property, descriptor);
                return super.Convert(caster_1.Caster.Binary.bind(caster_1.Caster))(target, property, descriptor);
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
    ], Schema, "MapIds", null);
    __decorate([
        Class.Public()
    ], Schema, "ArrayIds", null);
    __decorate([
        Class.Public()
    ], Schema, "Binary", null);
    Schema = __decorate([
        Class.Describe()
    ], Schema);
    return Schema;
})();
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map