"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const MongoDB = require("../source");
/**
 * Connection string.
 */
const connection = 'mongodb://127.0.0.1:27017/mapper-test';
/**
 * Database driver.
 */
const driver = new MongoDB.Driver();
/**
 * User entity.
 */
let UserEntity = class UserEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Primary(),
    MongoDB.Schema.Alias('_id'),
    MongoDB.Schema.Id(),
    Class.Public()
], UserEntity.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.String(),
    Class.Public()
], UserEntity.prototype, "name", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Enumeration('enabled', 'disabled'),
    Class.Public()
], UserEntity.prototype, "status", void 0);
UserEntity = __decorate([
    MongoDB.Schema.Entity('Users'),
    Class.Describe()
], UserEntity);
/**
 * User mapper.
 */
let UserMapper = class UserMapper extends MongoDB.Mapper {
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
    async create(name, status) {
        return await this.insert({
            name: name,
            status: status
        });
    }
};
__decorate([
    Class.Public()
], UserMapper.prototype, "create", null);
UserMapper = __decorate([
    Class.Describe()
], UserMapper);
/**
 * Type entity.
 */
let TypeEntity = class TypeEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Primary(),
    MongoDB.Schema.Alias('_id'),
    MongoDB.Schema.Id(),
    Class.Public()
], TypeEntity.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.String(),
    Class.Public()
], TypeEntity.prototype, "name", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.String(),
    Class.Public()
], TypeEntity.prototype, "description", void 0);
TypeEntity = __decorate([
    MongoDB.Schema.Entity('Types'),
    Class.Describe()
], TypeEntity);
/**
 * Type mapper.
 */
let TypeMapper = class TypeMapper extends MongoDB.Mapper {
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
    async create(name, description) {
        return await this.insert({
            name: name,
            description: description
        });
    }
};
__decorate([
    Class.Public()
], TypeMapper.prototype, "create", null);
TypeMapper = __decorate([
    Class.Describe()
], TypeMapper);
/**
 * Target entity.
 */
let TargetEntity = class TargetEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Id(),
    Class.Public()
], TargetEntity.prototype, "userId", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'userId'),
    Class.Public()
], TargetEntity.prototype, "user", void 0);
TargetEntity = __decorate([
    MongoDB.Schema.Entity('Targets'),
    Class.Describe()
], TargetEntity);
/**
 * Description entity.
 */
let DescriptionEntity = class DescriptionEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Array(TargetEntity),
    Class.Public()
], DescriptionEntity.prototype, "targets", void 0);
DescriptionEntity = __decorate([
    MongoDB.Schema.Entity('Targets'),
    Class.Describe()
], DescriptionEntity);
/**
 * Notification entity.
 */
let NotificationEntity = class NotificationEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Id(),
    Class.Public()
], NotificationEntity.prototype, "userId", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'userId'),
    Class.Public()
], NotificationEntity.prototype, "user", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Object(DescriptionEntity),
    Class.Public()
], NotificationEntity.prototype, "description", void 0);
NotificationEntity = __decorate([
    MongoDB.Schema.Entity('Notifications'),
    Class.Describe()
], NotificationEntity);
/**
 * Group entity.
 */
let GroupEntity = class GroupEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Id(),
    Class.Public()
], GroupEntity.prototype, "adminId", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'adminId'),
    Class.Public()
], GroupEntity.prototype, "admin", void 0);
__decorate([
    MongoDB.Schema.ArrayIds(),
    Class.Public()
], GroupEntity.prototype, "usersIdList", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'usersIdList'),
    Class.Public()
], GroupEntity.prototype, "usersList", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Array(NotificationEntity),
    Class.Public()
], GroupEntity.prototype, "notifications", void 0);
GroupEntity = __decorate([
    MongoDB.Schema.Entity('Groups'),
    Class.Describe()
], GroupEntity);
/**
 * Messages entity.
 */
let MessagesEntity = class MessagesEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Id(),
    Class.Public()
], MessagesEntity.prototype, "adminId", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'adminId'),
    Class.Public()
], MessagesEntity.prototype, "admin", void 0);
__decorate([
    MongoDB.Schema.ArrayIds(),
    Class.Public()
], MessagesEntity.prototype, "usersIdList", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'usersIdList'),
    Class.Public()
], MessagesEntity.prototype, "usersList", void 0);
MessagesEntity = __decorate([
    MongoDB.Schema.Entity('Messages'),
    Class.Describe()
], MessagesEntity);
/**
 * Settings entity.
 */
let SettingsEntity = class SettingsEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Id(),
    Class.Public()
], SettingsEntity.prototype, "contactId", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'contactId'),
    Class.Public()
], SettingsEntity.prototype, "contact", void 0);
__decorate([
    MongoDB.Schema.ArrayIds(),
    Class.Public()
], SettingsEntity.prototype, "sharedUsersIdList", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'sharedUsersIdList'),
    Class.Public()
], SettingsEntity.prototype, "sharedUsersList", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Object(MessagesEntity),
    Class.Public()
], SettingsEntity.prototype, "messages", void 0);
__decorate([
    MongoDB.Schema.Array(GroupEntity),
    Class.Public()
], SettingsEntity.prototype, "groups", void 0);
SettingsEntity = __decorate([
    MongoDB.Schema.Entity('Settings'),
    Class.Describe()
], SettingsEntity);
/**
 * Account entity.
 */
let AccountEntity = class AccountEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Primary(),
    MongoDB.Schema.Alias('_id'),
    MongoDB.Schema.Id(),
    Class.Public()
], AccountEntity.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Id(),
    Class.Public()
], AccountEntity.prototype, "ownerId", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.String(),
    Class.Public()
], AccountEntity.prototype, "typeName", void 0);
__decorate([
    MongoDB.Schema.JoinAll('name', TypeEntity, 'typeName', {
        sort: {
            description: MongoDB.Order.Descending
        },
        limit: {
            start: 0,
            count: 3
        }
    }),
    Class.Public()
], AccountEntity.prototype, "typeList", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Array(String),
    Class.Public()
], AccountEntity.prototype, "roleNames", void 0);
__decorate([
    MongoDB.Schema.JoinAll('name', TypeEntity, 'roleNames', {
        limit: {
            start: 0,
            count: 6
        }
    }),
    Class.Public()
], AccountEntity.prototype, "roleList", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'ownerId'),
    Class.Public()
], AccountEntity.prototype, "owner", void 0);
__decorate([
    MongoDB.Schema.ArrayIds(),
    Class.Public()
], AccountEntity.prototype, "allowedUsersIdList", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'allowedUsersIdList', {
        status: { operator: MongoDB.Operator.Equal, value: 'enabled' }
    }),
    Class.Public()
], AccountEntity.prototype, "allowedUsersList", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Object(SettingsEntity),
    Class.Public()
], AccountEntity.prototype, "settings", void 0);
AccountEntity = __decorate([
    MongoDB.Schema.Entity('Accounts'),
    Class.Describe()
], AccountEntity);
/**
 * Account mapper.
 */
let AccountMapper = class AccountMapper extends MongoDB.Mapper {
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
    async create(ownerId, type, roles, userAId, userBId, userCId) {
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
    async read(id) {
        return await super.findById(id);
    }
};
__decorate([
    Class.Public()
], AccountMapper.prototype, "create", null);
__decorate([
    Class.Public()
], AccountMapper.prototype, "read", null);
AccountMapper = __decorate([
    Class.Describe()
], AccountMapper);
/**
 * Test operations.
 */
async function crudTest() {
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
        console.dir(JSON.parse(JSON.stringify(MongoDB.Entity.normalize(AccountEntity, account))), { depth: null, compact: true });
    }
    // Disconnect
    await driver.disconnect();
    console.log('Disconnect');
}
crudTest();
//# sourceMappingURL=relationship.js.map