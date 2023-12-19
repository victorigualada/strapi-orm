<h1 align="center">Strapi ORM</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@vicodes/strapi-orm">
    <img alt="npm" src="https://img.shields.io/npm/v/@vicodes/strapi-orm" />
  </a>
  <a href="https://www.npmjs.com/package/@vicodes/strapi-orm">
    <img alt="npm" src="https://img.shields.io/npm/dm/@vicodes/strapi-orm" />
  </a>
  <a href="https://github.com/victorigualada/strapi-orm/actions">
    <img alt="GitHub branch checks state" src="https://badgen.net/github/checks/victorigualada/strapi-orm">
  </a>
  <a href="https://snyk.io/test/github/victorigualada/strapi-orm">
    <img alt="Known Vulnerabilities" src="https://snyk.io/test/github/victorigualada/strapi-orm/badge.svg" />
  </a>
  <img alt="Dependabot" src="https://badgen.net/github/dependabot/victorigualada/strapi-orm">
  <img alt="Supported platforms: Express & Fastify" src="https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green" />
</p>

<p align="center">✨✨✨ StrapiORM for backend requests inspired by TypeORM that <b>abstracts filtering, population and sorting</b> ✨✨✨</p>

## Motivation

Strapi is a great headless CMS, and a good entry point for start-ups. Sometimes it might become a core part of the
project, but it can substitute a strong backend application. This is where StrapiORM comes in. It allows the backend
applications to treat Strapi as a database, and abstracts the filtering, population and sorting of the entities.

## Install

```sh
npm i @vicodes/strapi-orm
```

## Example

First create a Manager instance

```ts
const manager = new Manager({
  baseUrl: 'http://localhost:1337/api',
  accessToken: 'super-secret-token',
  flatten: true,
})
```

Then create the entities that represent Strapi Content Types.
Use the `StrapiEntity` decorator to specify the URI path of the Strapi Content Type, either as a string or as a
`StrapiEntityOptions` object with the following properties:

```ts
interface StrapiEntityOptions {
  path: string
}
```

```ts
import { StrapiEntity } from './strapi-entity.decorator'

@StrapiEntity('scopes')
export class Scope {
  id: number
  name: string
}

@StrapiEntity({ path: 'roles' })
export class Role {
  id: number
  name: string
  scope: Scope
}

@StrapiEntity('users')
export class User {
  id: number
  firstName: string
  lastName: string
  role: Role
}
```

### Using Repository

```ts
import { Manager } from '@vicodes/strapi-orm'
import { User } from './user.entity'

const roleRepository = manager.getRepository(Role)
const scopeRepository = manager.getRepository(Scope)

const scope = await scopeRepository.findById(1)

const adminRole: Role = {
  name: 'admin',
  scope: scope,
}

await roleRepository.create(adminRole)
```

### Using QueryBuilder

You can use the QueryBuilder to create complex queries. This will create the query params to select, populate filter
and sort without the hustle of creating the query string or object.

```ts
import { Manager } from '@vicodes/strapi-orm'
import { User } from './user.entity'

const manager = new Manager({
  baseUrl: 'http://localhost:1337/api',
  accessToken: 'super-secret-token',
  flatten: true,
})

const respository = manager.getRepository(User)

const users = await respository
  .createQueryBuilder()
  .select(['firstName', 'lastName'])
  .populate('role')
  .populate('role.scope', '*', { name: { $in: ['read-only', 'read-write'] } })
  .filter('role.scope.name', 'read-only')
  .getMany()
```

### Overriding the default request service

StrapiORM uses a [default request service](src/service/strapi-request.service.ts) that uses `fetch` to make the requests to the Strapi API.
It can be overridden by passing a custom request service to the Manager constructor.

```ts
import { Manager, RequestService } from '@vicodes/strapi-orm'

class CustomRequestService extends RequestService {
  constructor(config: ConnectionConfig) {
    super(config)
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: 'Basic user:password',
    }
  }

  handleResponse<T>(jsonResponse: unknown): Promise<T> {
    // Do something with the response, like modifying the data
    // By default here is where the response is flattened
  }

  request<T>(path: string, requestOptions: RequestOptions): Promise<T> {
    // Use your custom request library, like axios
  }
}
```

## API

### Manager

#### `new Manager(options: ConnectionConfig, requestService?: RequestService)`

Creates a new `Manager` instance.

`ConnectionConfig` is an object with the following properties:

| Property    | Type    | Description                                                                           | Required | Default |
| ----------- | ------- | ------------------------------------------------------------------------------------- | -------- | ------- |
| baseUrl     | string  | Base url of the Strapi API                                                            | true     |         |
| accessToken | string  | Access token of the Strapi API                                                        | true     |         |
| flatten     | boolean | Flatten the response from the Strapi API, removing the attributes and data properties | false    | false   |

#### `manager.getRepository(target: Entity): Repository<Entity>`

Returns a new Repository instance for the given entity.

### Repository

#### `repository.findById(id: number | string): Promise<T>`

Finds an entity by its id.

#### `repository.create(entity: Entity): Promise<Entity>`

Creates a new entity.

#### `repository.update(id: number | string, entity: Entity): Promise<Entity>`

Updates an entity by its id.

#### `repository.delete(id: number | string): Promise<Entity>`

Deletes an entity by its id.

#### `repository.createQueryBuilder(): StrapiQueryBuilder<Entity>`

Creates a new QueryBuilder instance for the given entity.

### QueryBuilder

#### `queryBuilder.select(fields: string | string[]): SelectQueryBuilder<Entity>`

Selects the fields to be returned by the query.

#### `queryBuilder.populate(relation: string, fields?: string | string[], filter?: StrapiFilter, sort?: StrapiSort): SelectQueryBuilder<Entity>`

Populates the given relation of the entity. Optionally, you can select the fields to be returned and filter the populated entities.
To populate a nested relation, use dot notation: `queryBuilder.populate('role.scope')`. There is no limit of nested relations depth.

#### `queryBuilder.filter(field: string, value: any): SelectQueryBuilder<Entity>`

Filters the entities by the given field and value.

#### `queryBuilder.sort(field: string, order: 'asc' | 'desc'): SelectQueryBuilder<Entity>`

Sorts the entities by the given field and order.

#### `queryBuilder.getMany(): Promise<Entity[]>`

Executes the query and returns the entities.

#### `queryBuilder.getOne(): Promise<Entity>`

Executes the query and returns the first entity.
