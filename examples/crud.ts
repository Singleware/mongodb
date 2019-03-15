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
 * Test class.
 */
@Mapping.Schema.Entity('UserEntity')
@Class.Describe()
class UserEntity extends Class.Null {
  /**
   * User id.
   */
  @Mapping.Schema.Id()
  @Mapping.Schema.Alias('_id')
  @Class.Public()
  public id?: string;
  /**
   * User first name.
   */
  @Mapping.Schema.String()
  @Class.Public()
  public firstName?: string;
  /**
   * User last name.
   */
  @Mapping.Schema.String()
  @Class.Public()
  public lastName?: string;
}

/**
 * Database mapper.
 */
@Class.Describe()
class UserMapper extends Mapping.Mapper<UserEntity> {
  constructor() {
    super(driver, UserEntity);
  }

  /**
   * Create a test user.
   * @returns Returns the id of new user.
   */
  @Class.Public()
  public async create(): Promise<string> {
    return await this.insert({ firstName: 'First 1', lastName: 'Last 1' });
  }

  /**
   * Change the test user.
   * @param id USer id.
   * @returns Returns the number of updated users.
   */
  @Class.Public()
  public async change(id: string): Promise<number> {
    return await this.update({ id: { operator: Mapping.Statements.Operator.EQUAL, value: id } }, { firstName: 'Changed!' });
  }

  /**
   * Read the test user.
   * @param id User id.
   * @requires Returns the list of users found.
   */
  @Class.Public()
  public async read(id: string): Promise<UserEntity[]> {
    return await this.find(
      {
        id: { operator: Mapping.Statements.Operator.EQUAL, value: id }
      },
      {
        id: Mapping.Statements.Order.ASCENDING
      },
      {
        start: 0,
        count: 1
      }
    );
  }

  /**
   * Remove the test user.
   * @param id User id.
   */
  @Class.Public()
  public async remove(id: string): Promise<number> {
    return await this.delete({ id: { operator: Mapping.Statements.Operator.EQUAL, value: id } });
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

  // Create user
  const id = await mapper.create();
  console.log('Create:', id);

  // Read user
  const before = await mapper.read(id);
  console.log('Read before:', before[0].firstName, before[0].lastName);

  // Update user
  console.log('Update:', await mapper.change(id));
  const after = await mapper.read(id);

  // Read user
  console.log('Read after:', after[0].firstName, after[0].lastName);

  // Delete user
  console.log('Delete:', await mapper.remove(id));

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

crudTest();
