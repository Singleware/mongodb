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
 * Test class.
 */
@MongoDB.Schema.Entity('UserEntity')
@Class.Describe()
class UserEntity extends Class.Null {
  /**
   * User id.
   */
  @MongoDB.Schema.Id()
  @MongoDB.Schema.Primary()
  @MongoDB.Schema.Alias('_id')
  @Class.Public()
  public id?: string;

  /**
   * User first name.
   */
  @MongoDB.Schema.String()
  @Class.Public()
  public firstName?: string;

  /**
   * User last name.
   */
  @MongoDB.Schema.String()
  @Class.Public()
  public lastName?: string;

  /**
   * Birth date.
   */
  @MongoDB.Schema.Date()
  @Class.Public()
  public birthDate?: Date;
}

/**
 * Database mapper.
 */
@Class.Describe()
class UserMapper extends MongoDB.Mapper<UserEntity> {
  /**
   * Default constructor.
   */
  constructor() {
    super(driver, UserEntity);
  }

  /**
   * Create a test user.
   * @returns Returns a promise to get the new user id.
   */
  @Class.Public()
  public async create(): Promise<string> {
    return await this.insert({ firstName: 'First 1', lastName: 'Last 1', birthDate: new Date() });
  }

  /**
   * Change the test user.
   * @param id User id.
   * @returns Returns a promise to get the number of updated users.
   */
  @Class.Public()
  public async change(id: string): Promise<number> {
    return await this.update({ id: { operator: MongoDB.Operator.Equal, value: id } }, { firstName: 'Changed!' });
  }

  /**
   * Replace the test user.
   * @param id User id.
   * @returns Returns a promise to get the replacement status.
   */
  @Class.Public()
  public async replace(id: string): Promise<boolean> {
    return await this.replaceById(id, { id: id, firstName: 'Replaced!' });
  }

  /**
   * Read the test user.
   * @param id User id.
   * @returns Returns a promise to get the list of found users.
   */
  @Class.Public()
  public async read(id: string): Promise<UserEntity[]> {
    return await this.find({
      pre: {
        id: { operator: MongoDB.Operator.Equal, value: id }
      },
      sort: {
        id: MongoDB.Order.Ascending
      },
      limit: {
        start: 0,
        count: 1
      }
    });
  }

  /**
   * Remove the test user.
   * @param id User id.
   * @returns Returns a promise to get the number of removed users.
   */
  @Class.Public()
  public async remove(id: string): Promise<number> {
    return await this.delete({ id: { operator: MongoDB.Operator.Equal, value: id } });
  }
}

/**
 * Test operations.
 */
async function crudTest(): Promise<void> {
  // User mapper class.
  const mapper = new UserMapper();

  // Connect
  await driver.connect(connection);
  console.log('Connect');

  // Setup collection
  if (!(await driver.hasCollection(UserEntity))) {
    await driver.createCollection(UserEntity);
    console.log('Created');
  } else {
    await driver.modifyCollection(UserEntity);
    console.log('Modified');
  }

  // Create user
  const id = await mapper.create();
  const before = (await mapper.read(id))[0];
  console.log('Create:', id, before.firstName, before.lastName, before.birthDate);

  // Update user
  const update = await mapper.change(id);
  const middle = (await mapper.read(id))[0];
  console.log('Update:', update, middle.firstName, middle.lastName, middle.birthDate);

  // Replace user
  const replace = await mapper.replace(id);
  const after = (await mapper.read(id))[0];
  console.log('Replace:', replace, after.firstName, after.lastName, after.birthDate);

  // Delete user
  console.log('Delete:', await mapper.remove(id));

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

crudTest();
