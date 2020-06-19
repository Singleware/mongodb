"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sort = void 0;
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const Types = require("../types");
/**
 * Sort helper class.
 */
let Sort = class Sort extends Class.Null {
    /**
     * Build a new sorting entity based on the specified sort map.
     * @param model Model type.
     * @param sort Sort map.
     * @returns Returns the new sorting entity.
     */
    static build(model, sort) {
        const entity = {};
        for (const column in sort) {
            const schemas = Mapping.Helper.getPathColumns(model, column);
            const path = Types.Columns.Helper.getPath(schemas);
            switch (sort[column]) {
                case "asc" /* Ascending */:
                    entity[path] = 1;
                    break;
                case "desc" /* Descending */:
                    entity[path] = -1;
                    break;
            }
        }
        return entity;
    }
};
__decorate([
    Class.Public()
], Sort, "build", null);
Sort = __decorate([
    Class.Describe()
], Sort);
exports.Sort = Sort;
//# sourceMappingURL=sort.js.map