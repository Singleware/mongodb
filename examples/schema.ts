/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
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
@MongoDB.Schema.Entity('TestEntitySub')
@Class.Describe()
class TestEntitySub extends Class.Null {
  /**
   * Id.
   */
  @MongoDB.Schema.DocumentId()
  @Class.Public()
  public id?: any;
  /**
   * Some value.
   */
  @MongoDB.Schema.String()
  @MongoDB.Schema.Number()
  @Class.Public()
  public value?: string | number;
}

/**
 * Test entity.
 */
@MongoDB.Schema.Entity('TestEntity')
@Class.Describe()
class TestEntity extends Class.Null {
  // Id type.
  @MongoDB.Schema.DocumentId()
  @Class.Public()
  public id?: any;

  // Null type.
  @MongoDB.Schema.Null()
  @Class.Public()
  public null?: null;

  // Binary types.
  @MongoDB.Schema.Binary()
  @Class.Public()
  public binary?: string;

  // Boolean types.
  @MongoDB.Schema.Boolean()
  @Class.Public()
  public boolean?: boolean;

  // Integer types.
  @MongoDB.Schema.Integer()
  @Class.Public()
  public integer?: number;

  @MongoDB.Schema.Integer(1)
  @Class.Public()
  public minInteger?: number;

  @MongoDB.Schema.Integer(void 0, 2)
  @Class.Public()
  public maxInteger?: number;

  @MongoDB.Schema.Integer(1, 2)
  @Class.Public()
  public rangeInteger?: number;

  // Decimal types.
  @MongoDB.Schema.Decimal()
  @Class.Public()
  public decimal?: number;

  @MongoDB.Schema.Decimal(1)
  @Class.Public()
  public minDecimal?: number;

  @MongoDB.Schema.Decimal(void 0, 2)
  @Class.Public()
  public maxDecimal?: number;

  @MongoDB.Schema.Decimal(1, 2)
  @Class.Public()
  public rangeDecimal?: number;

  // Number types.
  @MongoDB.Schema.Number()
  @Class.Public()
  public number?: number;

  @MongoDB.Schema.Number(1)
  @Class.Public()
  public minNumber?: number;

  @MongoDB.Schema.Number(void 0, 2)
  @Class.Public()
  public maxNumber?: number;

  @MongoDB.Schema.Number(1, 2)
  @Class.Public()
  public rangeNumber?: number;

  // String types.
  @MongoDB.Schema.String()
  @Class.Public()
  public string?: string;

  @MongoDB.Schema.String(1)
  @Class.Public()
  public minString?: string;

  @MongoDB.Schema.String(void 0, 2)
  @Class.Public()
  public maxString?: string;

  @MongoDB.Schema.String(1, 2)
  @Class.Public()
  public rangeString?: string;

  // Enumeration type.
  @MongoDB.Schema.Enumeration('a', 'b', 'c')
  @Class.Public()
  public enumeration?: 'a' | 'b' | 'c';

  // Pattern type.
  @MongoDB.Schema.Pattern(/^([a-z]+)$/)
  @Class.Public()
  public pattern?: string;

  // Timestamp types.
  @MongoDB.Schema.Timestamp()
  @Class.Public()
  public timestamp?: Date;

  @MongoDB.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public minTimestamp?: Date;

  @MongoDB.Schema.Timestamp(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public maxTimestamp?: Date;

  @MongoDB.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public rangeTimestamp?: Date;

  // Date types.
  @MongoDB.Schema.Date()
  @Class.Public()
  public date?: Date;

  @MongoDB.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public minDate?: Date;

  @MongoDB.Schema.Date(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public maxDate?: Date;

  @MongoDB.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
  @Class.Public()
  public rangeDate?: Date;

  // Array types.
  @MongoDB.Schema.Array(String)
  @Class.Public()
  public stringArray?: string[];

  @MongoDB.Schema.Array(String, true)
  @Class.Public()
  public stringUniqueArray?: string[];

  @MongoDB.Schema.Array(String, void 0, 1)
  @Class.Public()
  public stringMinArray?: string[];

  @MongoDB.Schema.Array(String, void 0, void 0, 2)
  @Class.Public()
  public stringMaxArray?: string[];

  @MongoDB.Schema.Array(String, void 0, 1, 2)
  @Class.Public()
  public stringRangeArray?: string[];

  @MongoDB.Schema.Array(Number)
  @Class.Public()
  public numberArray?: string[];

  @MongoDB.Schema.Array(Boolean)
  @Class.Public()
  public booleanArray?: boolean[];

  @MongoDB.Schema.Array(Date)
  @Class.Public()
  public dateArray?: Date[];

  @MongoDB.Schema.Array(Object)
  @Class.Public()
  public objectArray?: Date[];

  @MongoDB.Schema.Array(TestEntitySub)
  @Class.Public()
  public entityArray?: TestEntitySub[];

  // Map type.
  @MongoDB.Schema.Map(String)
  @Class.Public()
  public stringMap?: MongoDB.Map<string>;

  @MongoDB.Schema.Map(Number)
  @Class.Public()
  public numberMap?: MongoDB.Map<number>;

  @MongoDB.Schema.Map(Boolean)
  @Class.Public()
  public booleanMap?: MongoDB.Map<boolean>;

  @MongoDB.Schema.Map(Date)
  @Class.Public()
  public dateMap?: MongoDB.Map<Date>;

  @MongoDB.Schema.Map(TestEntitySub)
  @Class.Public()
  public entityMap?: MongoDB.Map<TestEntitySub>;

  // Object type.
  @MongoDB.Schema.Object(TestEntitySub)
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
    console.log('Created');
  } else {
    await driver.modifyCollection(TestEntity);
    console.log('Modified');
  }

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

test();
