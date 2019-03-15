"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const BSON = require("./bson");
/**
 * Converters helper class.
 */
let Converters = class Converters extends Class.Null {
    /**
     * Converts the specified input value to an ObjectID output.
     * @param input Input value.
     * @returns Returns the ObjectID or undefined when the input was not valid.
     */
    static ObjectID(input) {
        if (input instanceof BSON.ObjectID) {
            return input;
        }
        else if (input instanceof Array) {
            const list = [];
            for (const value of input) {
                if (value instanceof BSON.ObjectID) {
                    list.push(value);
                }
                else if (BSON.ObjectID.isValid(value)) {
                    list.push(new BSON.ObjectID(value));
                }
            }
            return list;
        }
        else if (BSON.ObjectID.isValid(input)) {
            return new BSON.ObjectID(input);
        }
        else {
            return void 0;
        }
    }
};
__decorate([
    Class.Public()
], Converters, "ObjectID", null);
Converters = __decorate([
    Class.Describe()
], Converters);
exports.Converters = Converters;
