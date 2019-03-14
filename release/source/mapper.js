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
const BSON = require("./bson");
/**
 * MongoDb data mapper class.
 */
let Mapper = class Mapper extends Mapping.Mapper {
    /**
     * Determines whether the specified model ype is common or not.
     * @param model Model type.
     * @returns Returns true when the specified model type is a common type or false otherwise.
     */
    static isCommon(model) {
        return super.isCommon(model) || model === BSON.ObjectID;
    }
};
__decorate([
    Class.Protected()
], Mapper, "isCommon", null);
Mapper = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
