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
 * User entity, base interface.
 */
interface UserEntityBase {
  /**
   * User name.
   */
  name: string;
}

/**
 * User entity.
 */
@Mapping.Schema.Entity('Users')
@Class.Describe()
class UserEntity extends Class.Null implements UserEntityBase {
  /**
   * User id
   */
  @Mapping.Schema.Primary()
  @Mapping.Schema.Alias('_id')
  @Mapping.Schema.Id()
  @Class.Public()
  public readonly id!: any;

  /**
   * User name.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.String()
  @Class.Public()
  public name!: string;
}

/**
 * User mapper.
 */
@Class.Describe()
class UserMapper extends Mapping.Mapper<UserEntityBase> {
  /**
   * Default constructor.
   */
  constructor() {
    super(driver, UserEntity);
  }

  /**
   * Creates a new user.
   * @param name User name.
   * @returns Returns the new user id.
   */
  @Class.Public()
  public async create(name: string): Promise<string> {
    return await this.insert(<UserEntityBase>{
      name: name
    });
  }
}

/**
 * Target entity, base interface.
 */
interface TargetEntityBase {
  /**
   * Target user id.
   */
  userId: any;
}

/**
 * Target entity.
 */
@Mapping.Schema.Entity('Targets')
@Class.Describe()
class TargetEntity extends Class.Null implements TargetEntityBase {
  /**
   * Target user id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Id()
  @Class.Public()
  public userId: any;

  /**
   * Target user entity.
   */
  @Mapping.Schema.Join('id', UserEntity, 'userId')
  @Class.Public()
  public readonly user: any;
}

/**
 * Description entity, base interface.
 */
interface DescriptionEntityBase {
  /**
   * Target user id.
   */
  targets: TargetEntityBase[];
}

/**
 * Description entity.
 */
@Mapping.Schema.Entity('Targets')
@Class.Describe()
class DescriptionEntity extends Class.Null implements DescriptionEntityBase {
  /**
   * Target user id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Array(TargetEntity)
  @Class.Public()
  public targets!: TargetEntityBase[];
}

/**
 * Notification entity, base interface.
 */
interface NotificationEntityBase {
  /**
   * Notification user id.
   */
  userId: any;
  /**
   * Notification description.
   */
  description: DescriptionEntityBase;
}

/**
 * Notification entity.
 */
@Mapping.Schema.Entity('Notifications')
@Class.Describe()
class NotificationEntity extends Class.Null implements NotificationEntityBase {
  /**
   * Notification user id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Id()
  @Class.Public()
  public userId: any;

  /**
   * Notification user entity.
   */
  @Mapping.Schema.Join('id', UserEntity, 'userId')
  @Class.Public()
  public readonly user: any;

  /**
   * Notification description.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Object(DescriptionEntity)
  @Class.Public()
  public description!: DescriptionEntityBase;
}

/**
 * Group entity, base interface.
 */
interface GroupEntityBase {
  /**
   * Group admin id.
   */
  adminId: any;
  /**
   * Id list of users in this group.
   */
  usersIdList: any[];
  /**
   * Notifications of this group
   */
  notifications: NotificationEntityBase[];
}

/**
 * Group entity.
 */
@Mapping.Schema.Entity('Groups')
@Class.Describe()
class GroupEntity extends Class.Null implements GroupEntityBase {
  /**
   * Group admin id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Id()
  @Class.Public()
  public adminId: any;

  /**
   * Group admin entity.
   */
  @Mapping.Schema.Join('id', UserEntity, 'adminId')
  @Class.Public()
  public readonly admin: any;

  /**
   * Id list of users in this group.
   */
  @Mapping.Schema.Array(MongoDB.BSON.ObjectID)
  @Class.Public()
  public usersIdList!: any[];

  /**
   * Entity list of users in this group.
   */
  @Mapping.Schema.Join('id', UserEntity, 'usersIdList')
  @Class.Public()
  public readonly usersList!: UserEntity[];

  /**
   * Notifications of this group
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Array(NotificationEntity)
  @Class.Public()
  public notifications!: NotificationEntityBase[];
}

/**
 * Messages entity, base interface.
 */
interface MessagesEntityBase {
  /**
   * Messages admin id.
   */
  adminId: any;

  /**
   * Id list of users for messages.
   */
  usersIdList: any;
}

/**
 * Messages entity.
 */
@Mapping.Schema.Entity('Messages')
@Class.Describe()
class MessagesEntity extends Class.Null implements MessagesEntityBase {
  /**
   * Messages admin id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Id()
  @Class.Public()
  public adminId: any;

  /**
   * Messages admin entity.
   */
  @Mapping.Schema.Join('id', UserEntity, 'adminId')
  @Class.Public()
  public readonly admin!: UserEntity;

  /**
   * Id list of users for messages.
   */
  @Mapping.Schema.Array(MongoDB.BSON.ObjectID)
  @Class.Public()
  public usersIdList: any;

  /**
   * Entity list of users for messages.
   */
  @Mapping.Schema.Join('id', UserEntity, 'usersIdList')
  @Class.Public()
  public readonly usersList!: UserEntity[];
}

/**
 * Settings entity, base interface.
 */
interface SettingsEntityBase {
  /**
   * Settings contact Id.
   */
  contactId: any;
  /**
   * Id list of shared users in this account.
   */
  sharedUsersIdList: any[];
  /**
   * Settings for messages.
   */
  messages: MessagesEntityBase;
  /**
   * Groups of users in this account.
   */
  groups: GroupEntityBase[];
}

/**
 * Settings entity.
 */
@Mapping.Schema.Entity('Settings')
@Class.Describe()
class SettingsEntity extends Class.Null implements SettingsEntityBase {
  /**
   * Settings contact id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Id()
  @Class.Public()
  public contactId: any;

  /**
   * Settings contact entity.
   */
  @Mapping.Schema.Join('id', UserEntity, 'contactId')
  @Class.Public()
  public readonly contact: any;

  /**
   * Id list of shared users in this account.
   */
  @Mapping.Schema.Array(MongoDB.BSON.ObjectID)
  @Class.Public()
  public sharedUsersIdList!: any[];

  /**
   * Entity list of shared users in this account.
   */
  @Mapping.Schema.Join('id', UserEntity, 'sharedUsersIdList')
  @Class.Public()
  public readonly sharedUsersList!: UserEntity[];

  /**
   * Settings for messages.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Object(MessagesEntity)
  @Class.Public()
  public messages!: MessagesEntityBase;

  /**
   * Group of users in this account.
   */
  @Mapping.Schema.Array(GroupEntity)
  @Class.Public()
  public groups!: GroupEntityBase[];
}

/**
 * Account entity, base interface.
 */
interface AccountEntityBase {
  /**
   * Account owner id.
   */
  ownerId: any;
  /**
   * Id list of allowed users in this account.
   */
  allowedUsersIdList: any[];
  /**
   * Account settings.
   */
  settings: SettingsEntityBase;
}

/**
 * Account entity.
 */
@Mapping.Schema.Entity('Accounts')
@Class.Describe()
class AccountEntity extends Class.Null implements AccountEntityBase {
  /**
   * Account id
   */
  @Mapping.Schema.Primary()
  @Mapping.Schema.Alias('_id')
  @Mapping.Schema.Id()
  @Class.Public()
  public readonly id: any;

  /**
   * Account owner id.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Id()
  @Class.Public()
  public ownerId: any;

  /**
   * Account owner entity.
   */
  @Mapping.Schema.Join('id', UserEntity, 'ownerId')
  @Class.Public()
  public readonly owner: any;

  /**
   * Id list of allowed users in this account.
   */
  @Mapping.Schema.Array(MongoDB.BSON.ObjectID)
  @Class.Public()
  public allowedUsersIdList!: any[];

  /**
   * Entity list of allowed users in this account.
   */
  @Mapping.Schema.Join('id', UserEntity, 'allowedUsersIdList')
  @Class.Public()
  public readonly allowedUsersList!: UserEntity[];

  /**
   * Account settings.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Object(SettingsEntity)
  @Class.Public()
  public settings!: SettingsEntity;
}

/**
 * Account mapper.
 */
@Class.Describe()
class AccountMapper extends Mapping.Mapper<AccountEntityBase> {
  /**
   * Default constructor.
   */
  constructor() {
    super(driver, AccountEntity);
  }

  /**
   * Creates a new account.
   * @param ownerId Account owner id.
   * @param allowedUsersIdList Id list of allows users in this account.
   * @param sharedUsersIdList Id list of shared users in this account.
   * @param usersIdGroupA Id list of users in the first account group.
   * @param usersIdGroupB Id list of users in the second account group.
   * @returns Returns the new account id.
   */
  @Class.Public()
  public async create(ownerId: any, userAId: any, userBId: any, userCId: any): Promise<string> {
    return await this.insert({
      ownerId: ownerId,
      allowedUsersIdList: [userAId, userBId, userCId],
      settings: {
        contactId: ownerId,
        sharedUsersIdList: [userCId, userBId, userAId],
        messages: {
          adminId: ownerId,
          usersIdList: [userAId, userBId, userCId]
        },
        groups: [
          {
            adminId: userAId,
            usersIdList: [userBId, userCId],
            notifications: [
              {
                userId: userAId,
                description: {
                  targets: [{ userId: userBId }, { userId: userCId }]
                }
              },
              {
                userId: userBId,
                description: {
                  targets: [{ userId: userCId }]
                }
              }
            ]
          },
          {
            adminId: userBId,
            usersIdList: [userAId, userCId],
            notifications: [
              {
                userId: userBId,
                description: {
                  targets: [{ userId: userAId }]
                }
              }
            ]
          },
          {
            adminId: userCId,
            usersIdList: [userAId, userBId],
            notifications: []
          }
        ]
      }
    });
  }

  /**
   * Reads an account entity that corresponds to the specified account id.
   * @param id Account id.
   * @returns Returns a promise to get the account entity or undefined when the account was not found.
   */
  @Class.Public()
  public async read(id: any): Promise<AccountEntity | undefined> {
    return <AccountEntity | undefined>await super.findById(id);
  }
}

/**
 * Test operations.
 */
async function crudTest(): Promise<void> {
  // Mappers
  const users = new UserMapper();
  const accounts = new AccountMapper();

  // Connect
  await driver.connect(connection);
  console.log('Connect');

  // Creates the account owner.
  const owner = await users.create('User X');

  // Creates the account users.
  const userA = await users.create('User A');
  const userB = await users.create('User B');
  const userC = await users.create('User C');

  // Creates the account.
  const accountId = await accounts.create(owner, userA, userB, userC);

  // Reads the account.
  console.clear();
  const account = await accounts.read(accountId);
  if (account) {
    console.dir(JSON.parse(JSON.stringify(Mapping.Mapper.normalize(AccountEntity, account))), { depth: null, compact: true });
  }

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

crudTest();
