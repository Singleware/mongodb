/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Mapping from '@singleware/mapping';
import * as MongoDB from '../source';

/**
 * Connection string.
 */
const connection = 'mongodb://127.0.0.1:27017/mapper-test';

/**
 * Database driver.
 */
const driver = new MongoDB.Driver();

/**
 * Test sub entity.
 */
@Mapping.Schema.Entity('TestEntitySub')
@Class.Describe()
class TestEntitySub extends Class.Null {
  /**
   * Id.
   */
  @Mapping.Schema.Id()
  @Mapping.Schema.Alias('_id')
  @Class.Public()
  public id?: any;
  /**
   * Some value.
   */
  @Mapping.Schema.String()
  @Mapping.Schema.Number()
  @Class.Public()
  public value?: string | number;
}

/**
 * Test entity.
 */
@Mapping.Schema.Entity('TestEntity')
@Class.Describe()
class TestEntity extends Class.Null {
  // Id type.
  @Mapping.Schema.Id()
  @Mapping.Schema.Alias('_id')
  @Class.Public()
  public id?: any;

  // Null type.
  @Mapping.Schema.Null()
  @Class.Public()
  public null?: null;

  // Binary types.
  @Mapping.Schema.Binary()
  @Class.Public()
  public binary?: string;

  // Boolean types.
  @Mapping.Schema.Boolean()
  @Class.Public()
  public boolean?: boolean;

  // Integer types.
  @Mapping.Schema.Integer()
  @Class.Public()
  public integer?: number;

  @Mapping.Schema.Integer(1)
  @Class.Public()
  public minInteger?: number;

  @Mapping.Schema.Integer(void 0, 2)
  @Class.Public()
  public maxInteger?: number;

  @Mapping.Schema.Integer(1, 2)
  @Class.Public()
  public rangeInteger?: number;

  // Decimal types.
  @Mapping.Schema.Decimal()
  @Class.Public()
  public decimal?: number;

  @Mapping.Schema.Decimal(1)
  @Class.Public()
  public minDecimal?: number;

  @Mapping.Schema.Decimal(void 0, 2)
  @Class.Public()
  public maxDecimal?: number;

  @Mapping.Schema.Decimal(1, 2)
  @Class.Public()
  public rangeDecimal?: number;

  // Number types.
  @Mapping.Schema.Number()
  @Class.Public()
  public number?: number;

  @Mapping.Schema.Number(1)
  @Class.Public()
  public minNumber?: number;

  @Mapping.Schema.Number(void 0, 2)
  @Class.Public()
  public maxNumber?: number;

  @Mapping.Schema.Number(1, 2)
  @Class.Public()
  public rangeNumber?: number;

  // String types.
  @Mapping.Schema.String()
  @Class.Public()
  public string?: string;

  @Mapping.Schema.String(1)
  @Class.Public()
  public minString?: string;

  @Mapping.Schema.String(void 0, 2)
  @Class.Public()
  public maxString?: string;

  @Mapping.Schema.String(1, 2)
  @Class.Public()
  public rangeString?: string;

  // Enumeration type.
  @Mapping.Schema.Enumeration('a', 'b', 'c')
  @Class.Public()
  public enumeration?: 'a' | 'b' | 'c';

  // Pattern type.
  @Mapping.Schema.Pattern(/^([a-z]+)$/)
  @Class.Public()
  public pattern?: string;

  // Timestamp types.
  @Mapping.Schema.Timestamp()
  @Class.Public()
  public timestamp?: Date;

  @Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public minTimestamp?: Date;

  @Mapping.Schema.Timestamp(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public maxTimestamp?: Date;

  @Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public rangeTimestamp?: Date;

  // Date types.
  @Mapping.Schema.Date()
  @Class.Public()
  public date?: Date;

  @Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public minDate?: Date;

  @Mapping.Schema.Date(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public maxDate?: Date;

  @Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public rangeDate?: Date;

  // Array types.
  @Mapping.Schema.Array(String)
  @Class.Public()
  public stringArray?: string[];

  @Mapping.Schema.Array(String, true)
  @Class.Public()
  public stringUniqueArray?: string[];

  @Mapping.Schema.Array(String, void 0, 1)
  @Class.Public()
  public stringMinArray?: string[];

  @Mapping.Schema.Array(String, void 0, void 0, 2)
  @Class.Public()
  public stringMaxArray?: string[];

  @Mapping.Schema.Array(String, void 0, 1, 2)
  @Class.Public()
  public stringRangeArray?: string[];

  @Mapping.Schema.Array(Number)
  @Class.Public()
  public numberArray?: string[];

  @Mapping.Schema.Array(Boolean)
  @Class.Public()
  public booleanArray?: boolean[];

  @Mapping.Schema.Array(Date)
  @Class.Public()
  public dateArray?: Date[];

  @Mapping.Schema.Array(Object)
  @Class.Public()
  public objectArray?: Date[];

  @Mapping.Schema.Array(TestEntitySub)
  @Class.Public()
  public entityArray?: TestEntitySub[];

  // Map type.
  @Mapping.Schema.Map(String)
  @Class.Public()
  public stringMap?: Mapping.Types.Map<string>;

  @Mapping.Schema.Map(Number)
  @Class.Public()
  public numberMap?: Mapping.Types.Map<number>;

  @Mapping.Schema.Map(Boolean)
  @Class.Public()
  public booleanMap?: Mapping.Types.Map<boolean>;

  @Mapping.Schema.Map(Date)
  @Class.Public()
  public dateMap?: Mapping.Types.Map<Date>;

  @Mapping.Schema.Map(TestEntitySub)
  @Class.Public()
  public entityMap?: Mapping.Types.Map<TestEntitySub>;

  // Object type.
  @Mapping.Schema.Object(TestEntitySub)
  @Class.Public()
  public entityObject?: TestEntitySub;
}

/**
 * Test schema.
 */
async function test(): Promise<void> {
  // Connect
  await driver.connect(connection);
  console.log('Connect');

  // Apply schema
  if (!(await driver.hasCollection(TestEntity))) {
    await driver.createCollection(TestEntity);
  } else {
    await driver.modifyCollection(TestEntity);
  }
  console.log('Modified');

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

test();
