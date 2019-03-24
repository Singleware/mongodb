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

  /**
   * User status.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Enumeration('enabled', 'disabled')
  @Class.Public()
  public status!: 'enabled' | 'disabled';
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
   * @param status User status.
   * @returns Returns the new user id.
   */
  @Class.Public()
  public async create(name: string, status: 'enabled' | 'disabled'): Promise<string> {
    return await this.insert(<UserEntityBase>{
      name: name,
      status: status
    });
  }
}

/**
 * Type entity, base interface.
 */
interface TypeEntityBase {
  /**
   * Type name.
   */
  name: string;
  /**
   * Type description.
   */
  description: string;
}

/**
 * Type entity.
 */
@Mapping.Schema.Entity('Types')
@Class.Describe()
class TypeEntity extends Class.Null implements TypeEntityBase {
  /**
   * Type id
   */
  @Mapping.Schema.Primary()
  @Mapping.Schema.Alias('_id')
  @Mapping.Schema.Id()
  @Class.Public()
  public readonly id!: any;

  /**
   * Type name.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.String()
  @Class.Public()
  public name!: string;

  /**
   * Type description.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.String()
  @Class.Public()
  public description!: string;
}

/**
 * Type mapper.
 */
@Class.Describe()
class TypeMapper extends Mapping.Mapper<TypeEntityBase> {
  /**
   * Default constructor.
   */
  constructor() {
    super(driver, TypeEntity);
  }

  /**
   * Creates a new type.
   * @param name Type name.
   * @param description Type description.
   * @returns Returns the new type id.
   */
  @Class.Public()
  public async create(name: string, description: string): Promise<string> {
    return await this.insert(<TypeEntityBase>{
      name: name,
      description: description
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
   * Account type name.
   */
  typeName: string;
  /**
   * Account role names.
   */
  roleNames: string[];
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
   * Account type name.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.String()
  @Class.Public()
  public typeName!: string;

  /**
   * Account types.
   */
  @Mapping.Schema.JoinAll('name', TypeEntity, 'typeName', {
    sort: {
      description: Mapping.Statements.Order.DESCENDING
    },
    limit: {
      start: 0,
      count: 3
    }
  })
  @Class.Public()
  public typeList!: TypeEntity[];

  /**
   * Account role names.
   */
  @Mapping.Schema.Required()
  @Mapping.Schema.Array(String)
  @Class.Public()
  public roleNames!: string[];

  /**
   * Account roles.
   */
  @Mapping.Schema.JoinAll('name', TypeEntity, 'roleNames', {
    limit: {
      start: 0,
      count: 6
    }
  })
  @Class.Public()
  public roleList!: TypeEntity[];

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
  @Mapping.Schema.Join('id', UserEntity, 'allowedUsersIdList', {
    status: { operator: Mapping.Statements.Operator.EQUAL, value: 'enabled' }
  })
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
   * @param type Account type.
   * @param role Account role types.
   * @param allowedUsersIdList Id list of allows users in this account.
   * @param sharedUsersIdList Id list of shared users in this account.
   * @param usersIdGroupA Id list of users in the first account group.
   * @param usersIdGroupB Id list of users in the second account group.
   * @returns Returns the new account id.
   */
  @Class.Public()
  public async create(ownerId: any, type: string, roles: string[], userAId: any, userBId: any, userCId: any): Promise<string> {
    return await this.insert({
      ownerId: ownerId,
      typeName: type,
      roleNames: roles,
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
  const types = new TypeMapper();
  const accounts = new AccountMapper();

  // Connect
  await driver.connect(connection);
  console.log('Connect');

  // Creates the account owner.
  const owner = await users.create('User X', 'enabled');

  // Creates type account types.
  await types.create('generic', 'Type A');
  await types.create('generic', 'Type B');
  await types.create('generic', 'Type C');
  await types.create('basic', 'Type D');
  await types.create('basic', 'Type E');
  await types.create('basic', 'Type F');

  // Creates the account users.
  const userA = await users.create('User A', 'enabled');
  const userB = await users.create('User B', 'disabled');
  const userC = await users.create('User C', 'enabled');

  // Creates the account.
  const accountId = await accounts.create(owner, 'generic', ['generic', 'basic'], userA, userB, userC);

  // Reads the account.
  const account = await accounts.read(accountId);
  if (account) {
    console.dir(JSON.parse(JSON.stringify(Mapping.Mapper.normalize(AccountEntity, account))), { depth: null, compact: true });
  }

  // Disconnect
  await driver.disconnect();
  console.log('Disconnect');
}

crudTest();
