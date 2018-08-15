/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use a simple json schema with mapper
 * package.
 */
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
class TestEntitySub {
  /**
   * Id.
   */
  @Mapping.Schema.Id()
  @Mapping.Schema.Alias('_id')
  public id?: any;
  /**
   * Some value.
   */
  @Mapping.Schema.String()
  @Mapping.Schema.Number()
  public value?: string | number;
}

/**
 * Test entity.
 */
@Mapping.Schema.Entity('TestEntity')
class TestEntity {
  // Id type.
  @Mapping.Schema.Id()
  @Mapping.Schema.Alias('_id')
  public id?: any;

  // Null type.
  @Mapping.Schema.Null()
  public null?: null;

  // Boolean types.
  @Mapping.Schema.Boolean()
  public boolean?: boolean;

  // Integer types.
  @Mapping.Schema.Integer()
  public integer?: number;

  @Mapping.Schema.Integer(1)
  public minInteger?: number;

  @Mapping.Schema.Integer(0, 2)
  public maxInteger?: number;

  @Mapping.Schema.Integer(1, 2)
  public rangeInteger?: number;

  // Decimal types.
  @Mapping.Schema.Decimal()
  public decimal?: number;

  @Mapping.Schema.Decimal(1)
  public minDecimal?: number;

  @Mapping.Schema.Decimal(0, 2)
  public maxDecimal?: number;

  @Mapping.Schema.Decimal(1, 2)
  public rangeDecimal?: number;

  // Number types.
  @Mapping.Schema.Number()
  public number?: number;

  @Mapping.Schema.Number(1)
  public minNumber?: number;

  @Mapping.Schema.Number(0, 2)
  public maxNumber?: number;

  @Mapping.Schema.Number(1, 2)
  public rangeNumber?: number;

  // String types.
  @Mapping.Schema.String()
  public string?: string;

  @Mapping.Schema.String(1)
  public minString?: string;

  @Mapping.Schema.String(0, 2)
  public maxString?: string;

  @Mapping.Schema.String(1, 2)
  public rangeString?: string;

  // Enumeration type.
  @Mapping.Schema.Enumeration('a', 'b', 'c')
  public enumeration?: 'a' | 'b' | 'c';

  // Pattern type.
  @Mapping.Schema.Pattern(/^([a-z]+)$/)
  public pattern?: string;

  // Timestamp types.
  @Mapping.Schema.Timestamp()
  public timestamp?: Date;

  @Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0))
  public minTimestamp?: Date;

  @Mapping.Schema.Timestamp(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
  public maxTimestamp?: Date;

  @Mapping.Schema.Timestamp(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
  public rangeTimestamp?: Date;

  // Date types.
  @Mapping.Schema.Date()
  public date?: Date;

  @Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0))
  public minDate?: Date;

  @Mapping.Schema.Date(void 0, new Date(2010, 1, 1, 0, 0, 0, 0))
  public maxDate?: Date;

  @Mapping.Schema.Date(new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0))
  public rangeDate?: Date;

  // Array types.
  @Mapping.Schema.Array(String)
  public stringArray?: string[];

  @Mapping.Schema.Array(String, true)
  public stringUnqiueArray?: string[];

  @Mapping.Schema.Array(String, void 0, 1)
  public stringMinArray?: string[];

  @Mapping.Schema.Array(String, void 0, void 0, 2)
  public stringMaxArray?: string[];

  @Mapping.Schema.Array(String, void 0, 1, 2)
  public stringRangeArray?: string[];

  @Mapping.Schema.Array(Number)
  public numberArray?: string[];

  @Mapping.Schema.Array(Boolean)
  public booleanArray?: boolean[];

  @Mapping.Schema.Array(Date)
  public dateArray?: Date[];

  @Mapping.Schema.Array(Object)
  public objectArray?: Date[];

  @Mapping.Schema.Array(TestEntitySub)
  public entityArray?: TestEntitySub[];

  // Object type.
  @Mapping.Schema.Object(TestEntitySub)
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
  await driver.modify(<string>Mapping.Schema.getStorageName(TestEntity), <Mapping.Row>Mapping.Schema.getRow(TestEntity));
  console.log('Modify');

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

test();
