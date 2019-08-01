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
const Aliases = require("../aliases");
/**
 * Filter helper class.
 */
let Filter = class Filter extends Class.Null {
    /**
     * Build a new primary Id filter based on the specified model type and the primary Id value.
     * @param model Model type.
     * @param value Primary Id value.
     * @returns Returns the primary filter.
     */
    static byPrimaryId(model, value) {
        const primary = Aliases.Schema.getPrimaryColumn(model);
        const filter = {};
        filter[primary.name] = {
            operator: Aliases.Operator.Equal,
            value: value
        };
        return filter;
    }
};
__decorate([
    Class.Public()
], Filter, "byPrimaryId", null);
Filter = __decorate([
    Class.Describe()
], Filter);
exports.Filter = Filter;
//# sourceMappingURL=filter.js.map