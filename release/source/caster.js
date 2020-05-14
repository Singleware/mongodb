"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caster = void 0;
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Engine = require("./engine");
/**
 * Caster helper class.
 */
let Caster = /** @class */ (() => {
    let Caster = class Caster extends Class.Null {
        /**
         * Converts the specified value to a valid Object Id.
         * @param value Casting value.
         * @param type Casting type.
         * @returns Returns the validated Object Id or the same value when the given input isn't a valid Object Id.
         */
        static ObjectId(value, type) {
            if (Engine.ObjectId.isValid(value)) {
                return new Engine.ObjectId(value);
            }
            return value;
        }
        /**
         * Converts the specified value to a valid Object Id array.
         * @param value Casting value.
         * @param type Casting type.
         * @returns Returns the validated Object Id Array or the same value when the given input isn't a valid Array.
         */
        static ObjectIdArray(value, type) {
            if (value instanceof Array) {
                for (let index = 0; index < value.length; ++index) {
                    value[index] = this.ObjectId(value[index], type);
                }
            }
            return value;
        }
        /**
         * Converts the specified value to a valid Object Id Map.
         * @param value Casting value.
         * @param type Casting type.
         * @returns Returns the validated Object Id Map or the same value when the given input isn't a valid Map.
         */
        static ObjectIdMap(value, type) {
            if (value instanceof Object) {
                for (const key in value) {
                    value[key] = this.ObjectId(value[key], type);
                }
            }
            return value;
        }
        /**
         * Converts the specified value to a valid Binary.
         * @param value Casting value.
         * @param type Casting type.
         * @returns Returns the valid Binary.
         */
        static Binary(value, type) {
            if (value instanceof Array) {
                return new Engine.Binary(Buffer.from(value));
            }
            else if (value instanceof Engine.Binary) {
                return value;
            }
            else {
                return void 0;
            }
        }
    };
    __decorate([
        Class.Public()
    ], Caster, "ObjectId", null);
    __decorate([
        Class.Public()
    ], Caster, "ObjectIdArray", null);
    __decorate([
        Class.Public()
    ], Caster, "ObjectIdMap", null);
    __decorate([
        Class.Public()
    ], Caster, "Binary", null);
    Caster = __decorate([
        Class.Describe()
    ], Caster);
    return Caster;
})();
exports.Caster = Caster;
//# sourceMappingURL=caster.js.map