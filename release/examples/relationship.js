"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const MongoDB = require("../source");
/**
 * User entity.
 */
let UserEntity = class UserEntity extends Class.Null {
};
__decorate([
    MongoDB.Schema.Primary(),
    MongoDB.Schema.DocumentId(),
    Class.Public()
], UserEntity.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.String(),
    Class.Public()
], UserEntity.prototype, "name", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Enumeration(['enabled', 'disabled']),
    Class.Public()
], UserEntity.prototype, "status", void 0);
UserEntity = __decorate([
    MongoDB.Schema.Entity('Users'),
    Class.Describe()
], UserEntity);
/**
 * User mapper.
 */
let UserMapper = class UserMapper extends Class.Null {
    /**
     * Default constructor.
     * @param session Mapper session.
     */
    constructor(session) {
        super();
        this.mapper = new MongoDB.Mapper(session, UserEntity);
    }
    /**
     * Creates a new user.
     * @param name User name.
     * @param status User status.
     * @returns Returns the new user id.
     */
    async create(name, status) {
        return (await this.mapper.insert({
            name: name,
            status: status
        }));
    }
};
__decorate([
    Class.Private()
], UserMapper.prototype, "mapper", void 0);
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
    MongoDB.Schema.DocumentId(),
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
let TypeMapper = class TypeMapper extends Class.Null {
    /**
     * Default constructor.
     * @param session Mapper session.
     */
    constructor(session) {
        super();
        this.mapper = new MongoDB.Mapper(session, TypeEntity);
    }
    /**
     * Creates a new type.
     * @param name Type name.
     * @param description Type description.
     * @returns Returns the new type id.
     */
    async create(name, description) {
        return (await this.mapper.insert({
            name: name,
            description: description
        }));
    }
};
__decorate([
    Class.Private()
], TypeMapper.prototype, "mapper", void 0);
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
    MongoDB.Schema.ObjectId(),
    Class.Public()
], TargetEntity.prototype, "userId", void 0);
__decorate([
    MongoDB.Schema.Join('id', UserEntity, 'userId', void 0, ['name']),
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
    MongoDB.Schema.ObjectId(),
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
    MongoDB.Schema.ObjectId(),
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
    MongoDB.Schema.ObjectId(),
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
    MongoDB.Schema.ObjectId(),
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
    MongoDB.Schema.DocumentId(),
    Class.Public()
], AccountEntity.prototype, "id", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.ObjectId(),
    Class.Public()
], AccountEntity.prototype, "ownerId", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.String(),
    Class.Public()
], AccountEntity.prototype, "typeName", void 0);
__decorate([
    MongoDB.Schema.JoinAll('name', () => TypeEntity, 'typeName', {
        sort: {
            description: "desc" /* Descending */
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
    MongoDB.Schema.JoinAll('name', () => TypeEntity, 'roleNames', {
        limit: {
            start: 0,
            count: 6
        }
    }),
    Class.Public()
], AccountEntity.prototype, "roleList", void 0);
__decorate([
    MongoDB.Schema.Join('id', () => UserEntity, 'ownerId'),
    Class.Public()
], AccountEntity.prototype, "owner", void 0);
__decorate([
    MongoDB.Schema.ArrayIds(),
    Class.Public()
], AccountEntity.prototype, "allowedUsersIdList", void 0);
__decorate([
    MongoDB.Schema.Join('id', () => UserEntity, 'allowedUsersIdList', {
        status: { eq: 'enabled' }
    }),
    Class.Public()
], AccountEntity.prototype, "allowedUsersList", void 0);
__decorate([
    MongoDB.Schema.Required(),
    MongoDB.Schema.Object(() => SettingsEntity),
    Class.Public()
], AccountEntity.prototype, "settings", void 0);
AccountEntity = __decorate([
    MongoDB.Schema.Entity('Accounts'),
    Class.Describe()
], AccountEntity);
/**
 * Account mapper.
 */
let AccountMapper = class AccountMapper extends Class.Null {
    /**
     * Default constructor.
     * @param session Mapper session.
     */
    constructor(session) {
        super();
        this.mapper = new MongoDB.Mapper(session, AccountEntity);
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
        return (await this.mapper.insert({
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
        }));
    }
    /**
     * Reads an account entity that corresponds to the specified account id.
     * @param id Account id. Fields to be selected.
     * @param select
     * @returns Returns a promise to get the account entity or undefined when the account was not found.
     */
    async read(id, select) {
        return await this.mapper.findById(id, select);
    }
};
__decorate([
    Class.Private()
], AccountMapper.prototype, "mapper", void 0);
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
async function example() {
    const client = new MongoDB.Client();
    console.log('Connecting...');
    if (await client.connect('mongodb://127.0.0.1/mapper-test')) {
        const session = client.getSession();
        const accounts = new AccountMapper(session);
        const users = new UserMapper(session);
        const types = new TypeMapper(session);
        if (!(await client.hasCollection(TypeEntity))) {
            // Create collection.
            await client.createCollection(TypeEntity);
            console.log('Collection created');
            // Create account types.
            await types.create('generic', 'Type A');
            await types.create('generic', 'Type B');
            await types.create('generic', 'Type C');
            await types.create('basic', 'Type D');
            await types.create('basic', 'Type E');
            await types.create('basic', 'Type F');
            console.log('Types created');
        }
        // Create account users.
        const userA = await users.create('User A', 'enabled');
        const userB = await users.create('User B', 'disabled');
        const userC = await users.create('User C', 'enabled');
        // Create account owner.
        const owner = await users.create('User X', 'enabled');
        // Create the account.
        const accountId = await accounts.create(owner, 'generic', ['generic', 'basic'], userA, userB, userC);
        // Read the account.
        const account = await accounts.read(accountId, [
            'owner.name',
            'typeList.description',
            'roleList.description',
            'allowedUsersList.name',
            'settings.contact.name',
            'settings.sharedUsersList.name',
            'settings.messages.admin.name',
            'settings.messages.usersList.name',
            'settings.groups.admin.name',
            'settings.groups.usersList.name',
            'settings.groups.notifications.user.name',
            'settings.groups.notifications.description.targets.user.name'
        ]);
        if (account !== void 0) {
            const entity = MongoDB.Normalizer.create(AccountEntity, account, false, true);
            console.dir(JSON.parse(JSON.stringify(entity)), { depth: null, compact: true });
        }
        // Disconnect
        await client.disconnect();
        console.log('Disconnected');
    }
    else {
        console.error('Failed to connect to the database.');
    }
}
// Run example
example();
//# sourceMappingURL=relationship.js.map