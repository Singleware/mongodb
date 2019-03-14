"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var driver_1 = require("./driver");
exports.Driver = driver_1.Driver;
const BSON = require("./bson");
exports.BSON = BSON;
/**
 * Mapping configuration.
 */
const Mapping = require("@singleware/mapping");
Mapping.Mapper.addCommonType(BSON.ObjectID);
