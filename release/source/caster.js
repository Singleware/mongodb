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
const Engine = require("./engine");
/**
 * Caster helper class.
 */
let Caster = class Caster extends Class.Null {
    /**
     * Converts the specified value to a valid Object Id.
     * @param value Casting value.
     * @param type Casting type.
     * @returns Returns the validated ObjectID.
     */
    static ObjectId(value, type) {
        if (value instanceof Array) {
            return value.map(value => this.ObjectId(value, type));
        }
        else if (Engine.ObjectId.isValid(value)) {
            return new Engine.ObjectId(value);
        }
        else {
            return value;
        }
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
], Caster, "Binary", null);
Caster = __decorate([
    Class.Describe()
], Caster);
exports.Caster = Caster;
//# sourceMappingURL=caster.js.map