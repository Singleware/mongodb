/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
export { Driver } from './driver';

import * as BSON from './bson';
export import BSON = BSON;

/**
 * Mapping configuration.
 */
import * as Mapping from '@singleware/mapping';
Mapping.Mapper.addCommonType(BSON.ObjectID);
