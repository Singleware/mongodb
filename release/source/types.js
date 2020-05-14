"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Castings = exports.Normalizer = exports.Outputer = exports.Inputer = exports.Columns = exports.Schema = exports.Mapper = void 0;
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Mapping = require("@singleware/mapping");
/**
 * Mapper class.
 */
exports.Mapper = Mapping.Mapper;
/**
 * Mapping schema.
 */
exports.Schema = Mapping.Schema;
/**
 * Entity columns.
 */
exports.Columns = Mapping.Columns;
/**
 * Entity inputer.
 */
exports.Inputer = Mapping.Entities.Inputer;
/**
 * Entity outputer.
 */
exports.Outputer = Mapping.Entities.Outputer;
/**
 * Entity normalizer.
 */
exports.Normalizer = Mapping.Entities.Normalizer;
/**
 * Castings namespace.
 */
exports.Castings = Mapping.Castings;
//# sourceMappingURL=types.js.map