/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as MongoDB from '../source';

/**
 * User details, entity class.
 */
@MongoDB.Schema.Entity('UserDetailsEntity')
@Class.Describe()
class UserDetailsEntity extends Class.Null {
  /**
   * Birth date.
   */
  @MongoDB.Schema.Date()
  @Class.Public()
  public birthDate?: Date;

  /**
   * User phone.
   */
  @MongoDB.Schema.String()
  @Class.Public()
  public phone?: string;

  /**
   * User email.
   */
  @MongoDB.Schema.String()
  @Class.Public()
  public email?: string;
}

/**
 * User entity class.
 */
@MongoDB.Schema.Entity('UserEntity')
@Class.Describe()
class UserEntity extends Class.Null {
  /**
   * User id.
   */
  @MongoDB.Schema.Primary()
  @MongoDB.Schema.DocumentId()
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
   * User details.
   */
  @MongoDB.Schema.Required()
  @MongoDB.Schema.Object(UserDetailsEntity)
  @Class.Public()
  public details!: UserDetailsEntity;
}

/**
 * Database mapper.
 */
@Class.Describe()
class UserMapper extends MongoDB.Mapper<UserEntity> {
  /**
   * Default constructor.
   * @param session Mapper session.
   */
  constructor(session: MongoDB.Session) {
    super(session, UserEntity);
  }

  /**
   * Create a test user.
   * @returns Returns a promise to get the new user id.
   */
  @Class.Public()
  public async create(): Promise<string> {
    return (await this.insert<UserEntity, string>({
      firstName: 'First 1',
      lastName: 'Last 1',
      details: {
        birthDate: new Date()
      }
    }))!;
  }

  /**
   * Change the test user.
   * @param id User id.
   * @returns Returns a promise to get true when the is updated.
   */
  @Class.Public()
  public async change(id: string): Promise<boolean> {
    return (await this.updateById(id, {
      firstName: 'Changed!',
      details: {
        phone: '+551199999999'
      }
    }))!;
  }

  /**
   * Replace the test user.
   * @param id User id.
   * @returns Returns a promise to get the replacement status.
   */
  @Class.Public()
  public async replace(id: string): Promise<boolean> {
    return (await this.replaceById(id, {
      id: id,
      firstName: 'Replaced!',
      details: {}
    }))!;
  }

  /**
   * Read the test user.
   * @param id User id.
   * @returns Returns a promise to get user entity.
   */
  @Class.Public()
  public async read(id: string): Promise<UserEntity | undefined> {
    return await this.findById(id);
  }

  /**
   * Remove the test user.
   * @param id User id.
   * @returns Returns a promise to get true when the user is removed.
   */
  @Class.Public()
  public async remove(id: string): Promise<boolean> {
    return (await this.deleteById(id))!;
  }
}

/**
 * Test operations.
 */
async function example(): Promise<void> {
  const client = new MongoDB.Client();
  console.log('Connecting...');
  if (await client.connect('mongodb://127.0.0.1/mapper-test')) {
    const session = client.getSession();
    const mapper = new UserMapper(session);
    // Setup collection
    if (!(await client.hasCollection(UserEntity))) {
      await client.createCollection(UserEntity);
      console.log('Collection created');
    } else {
      await client.modifyCollection(UserEntity);
      console.log('Collection modified');
    }
    // Create user
    const id = await mapper.create();
    const before = (await mapper.read(id))!;
    console.log('Create:', id, before.firstName, before.lastName, before.details.birthDate, before.details.phone, before.details.email);
    // Update user
    const update = await mapper.change(id);
    const middle = (await mapper.read(id))!;
    console.log('Update:', update, middle.firstName, middle.lastName, middle.details.birthDate, middle.details.phone, middle.details.email);
    // Replace user
    const replace = await mapper.replace(id);
    const after = (await mapper.read(id))!;
    console.log('Replace:', replace, after.firstName, after.lastName, after.details.birthDate, after.details.phone, after.details.email);
    // Delete user
    console.log('Delete:', await mapper.remove(id));
    // Disconnect
    await client.disconnect();
    console.log('Disconnect');
  } else {
    console.error('Failed to connect to the database.');
  }
}

// Run example.
example();
