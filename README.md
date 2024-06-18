# Paginated Connection

<a href="https://www.treedom.net/it/organization/treedom/event/treedom-open-source"><img src="https://badges.treedom.net/badge/f/treedom-open-source" alt="plant-a-tree" border="0" /></a>

Paginated Connection is a utility library for handling pagination in your applications. It simplifies the process of managing paginated data, making it easy to integrate into your projects. It has built for GraphQL, and it's fully compliant with [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm) 

__Made with ❤️ at&nbsp;&nbsp;[<img src="https://assets.treedom.net/image/upload/manual_uploads/treedom-logo-contrib_gjrzt6.png" height="24" alt="Treedom" border="0" align="top" />](#-join-us-in-making-a-difference-)__, [join us in making a difference](#-join-us-in-making-a-difference-)! 

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Example](#basic-example)
  - [MySQL Example](#mysql-example)
  - [MongoDB Example](#mongodb-example)
  - [Return value](#return-value)
- [Edges](#edges)
  - [Compose using createEdge](#compose-using-createedge)
  - [Compose using createEdges](#compose-using-createedges)
  - [Compose manually](#compose-manually)
  - [Manually compose Edges](#manually-compose-edges)
- [Cursor Types](#cursor-types)
  - [Default Cursor Type](#default-cursor-type)
  - [Custom Cursor Type](#custom-cursor-type)

- [API Reference](#api-reference)
  - [paginatedConnection](#paginatedconnection)
  - [mysqlPaginatedConnection](#mysqlpaginatedconnection)
  - [mongoDbPaginatedConnection](#mongodbpaginatedconnection)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Pagination is essential for managing large datasets in a user-friendly manner. Paginated Connection provides a straightforward way to implement pagination logic in your applications, supporting both simple and complex use cases.

## Features

- Easy to set up and use
- Highly customizable
- Fully complaint with [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm) 
- Supports various pagination strategies
- Works seamlessly with different data sources

## Installation

To install Paginated Connection::

```sh
npm install paginated-connection
```

## Usage

### Basic example

Here is a basic example to get you started with Paginated Connection:

```typescript
import { paginatedConnection, PaginationInput } from 'paginated-connection';

// Define a simple node type
type Node = {
  id: string;
};

// Define encode and decode functions

// Function to get cursor object from node
const getCursor = node => ({ after: node.id });

// encodeCursor should return a string
const encodeCursor = ({ node, getCursor }) => Buffer.from(JSON.stringify(getCursor())).toString('base64');

// decodeCursor should return an object 
const decodeCursor = cursor => JSON.parse(Buffer.from(cursor, 'base64url').toString())

// Sample data loader
const dataLoader = async ({ cursor, first, encodeCursor, createEdge }) => {
  // Fetch data based on cursor and first
  const edges = fetchDataFromDataSource(cursor, first);
  return {
    edges: edges.map(node => createEdge(node, getCursor)),
    hasNextPage: checkIfHasNextPage(),
  };
};

// Sample count loader
const countLoader = async ({ cursor }) => {
  return countDataFromDataSource(cursor);
};

const paginationInput: PaginationInput = { after: 'cursor123', first: 10 };
const paginationSafeLimit = 50;

const result = await paginatedConnection<Node>({
  pagination: paginationInput,
  paginationSafeLimit,
  dataLoader,
  encodeCursor,
  decodeCursor,
  countLoader,
});

console.log(result);

```

### Mysql Example

Using Paginated Connection with MySQL:

```typescript
import { mysqlPaginatedConnection } from 'paginated-connection';

// Define a simple node type
type Node = {
  id: string;
};

// Function to get cursor object from node
const getCursor = node => ({ after: node.id });

// Define MySQL specific data loader
const mysqlDataLoader = async ({ cursor, first, encodeCursor }) => {
  // Fetch data from MySQL database
  const edges = fetchDataFromMySQL(cursor, first);
  return {
    edges: edges.map(node => createEdge(node, getCursor)),
    hasNextPage: checkIfHasNextPageInMySQL(),
  };
};

// Define MySQL specific count loader
const mysqlCountLoader = async ({ cursor }) => {
  return countDataInMySQL(cursor);
};

const paginationInput = { after: 'cursor123', first: 10 };
const paginationSafeLimit = 50;

const result = await mysqlPaginatedConnection<Node>({
  pagination: paginationInput,
  paginationSafeLimit,
  dataLoader: mysqlDataLoader,
  countLoader: mysqlCountLoader,
});

console.log(result);

```

In the MySQL implementation, the `+1` handling of data for the calculation of the `hasNextPage` value is implicitly managed by the function execution. This means you don't need to handle it yourself. The `hasNextPage` value is automatically calculated, so you should not return it in your data loader.

### MongoDB Example

Using Paginated Connection with MongoDB:

```typescript
import { mongoDbPaginatedConnection } from 'paginated-connection';

// Define a simple node type
type Node = {
  id: string;
};

// Function to get cursor object from node
const getCursor = node => ({ after: node.id });

// Define MongoDB specific data loader
const mongoDbDataLoader = async ({ cursor, first, encodeCursor }) => {
  // Fetch data from MongoDB
  const edges = fetchDataFromMongoDB(cursor, first);
  return {
    edges: edges.map(node => createEdge(node, getCursor)),
    hasNextPage: checkIfHasNextPageInMongoDB(),
  };
};

// Define MongoDB specific count loader
const mongoDbCountLoader = async ({ cursor }) => {
  return countDataInMongoDB(cursor);
};


const paginationInput = { after: 'cursor123', first: 10 };
const paginationSafeLimit = 50;

const result = await mongoDbPaginatedConnection<Node>({
  pagination: paginationInput,
  paginationSafeLimit,
  dataLoader: mongoDbDataLoader,
  countLoader: mongoDbCountLoader,
});

console.log(result);
```

In the MongoDB implementation, the `+1` handling of data for the calculation of the `hasNextPage` value is implicitly managed by the function execution. This means you don't need to handle it yourself. The `hasNextPage` value is automatically calculated, so you should not return it in your data loader.

### Return value

Every paginatedConnection function returns an object of `PaginatedConnectionReturnType`:

```typescript
export type PaginatedConnectionReturnType<TNode> = Promise<{
  totalCount: () => Promise<number>
  pageInfo: {
    endCursor: string
    hasNextPage: boolean
  }
  edges: Array<{
    node: TNode
    cursor: string
  }>
}>
```

where `TNode` is the type of the `node` loaded by `dataLoader` function.

## Edges

### Compose using createEdge
When returning `edges` value, dataloader function provides a `createEdge` function which is a shortcut to return an `Edge` object, containing `node` and `cursor`.

```typescript
const dataLoader = async ({ cursor, first, encodeCursor }) => {
  const edges = fetchDataFromDataSource(cursor, first);
  return {
    edges: edges.map(node => createEdge(node, getCursor)),
    hasNextPage: checkIfHasNextPage(),
  };
};
```

Function `createEdge` gets in input:
 - `node` object, which should has `TNode` type;
 - `getCursor` function, which should returns an object of type `TCursor`.

Under the hood, it executes the `encodeCursor`function, in order to provide the cursor inside of `Edge`.

### Compose using createEdges
bla bla bla

### Compose manually
Edges could be manually composed, returning an array of `Edge`.

```typescript
const dataLoader = async ({ cursor, first, encodeCursor }) => {
  const edges = fetchDataFromDataSource(cursor, first);
  return {
    edges: edges.map(node => ({ node, cursor: encodeCursor({ node, getCursor }) })),
    hasNextPage: checkIfHasNextPage(),
  };
};
```

## Cursor Types

### Default Cursor Type
By default, the cursor type only includes an `after` field, which is a string. This is simple and suitable for basic pagination scenarios.

```typescript
{ after: string };
```

The default cursor is used when no specific cursor type is provided to `paginatedConnection` (or `mysqlPaginatedConnection`, `mongoDbPaginatedConnection`, ecc...):

```typescript
type Node = {
  id: string;
};

const paginationInput = { after: 'cursor123', first: 10 };

// Return value should be an object containing `after` field only
const getCursor = (node): { after: string } => ({
  after: node.id,
});

// Here we're not passing any custom cursor type to paginatedConnection, so it'll use the default type
const result = await paginatedConnection<Node>({
  ...
  dataLoader,
  ...
});
```


### Custom Cursor Type
For more complex scenarios, you can customize the cursor type to include additional fields, such as sorting information. The value of all cursor fields must be `string`.

```typescript
type CustomCursor = { after: string; sortField: string; sortOrder: 'asc' | 'desc' };
```

When using a custom cursor type, you need to type the `paginatedConnection` (or `mysqlPaginatedConnection`, `mongoDbPaginatedConnection`, ecc...), providing cursor custom type:

```typescript
import { paginatedConnection } from 'paginated-connection';

type Node = {
  id: string;
  sortField: string;
};

// Custom cursor type
type CustomCursor = { after: string; sortField: string; sortOrder: 'asc' | 'desc' };

// Return value should be an object of type `CustomCursor`
const getCursor = (node): CustomCursor => ({
  after: node.id,
  sortField: node.sortField,
  sortOrder: 'asc',
});

// Sample data loader
const dataLoader = async ({ cursor, first, encodeCursor }) => {
  const edges = fetchDataFromDataSource(cursor, first);
  return {
    edges: edges.map(node => createEdge(node, getCursor)),
    hasNextPage: checkIfHasNextPage(),
  };
};

// Provide CustomCursor type
const result = await paginatedConnection<Node, CustomCursor>({
  ...
  dataLoader,
  ...
});

console.log(result);
```
## API Reference

### paginatedConnection

`paginatedConnection<TNode, TCursor>(props: PaginatedConnectionProps<TNode, TCursor>)`

Handles pagination to offset-style ordering, returning Connection-style GraphQL result.

- props (`PaginatedConnectionProps`):
    - `pagination` (`PaginationInput`): Pagination parameters.
    - `paginationSafeLimit` (`number`): Safe limit for pagination.
    - `dataLoader` (`(props: DataloaderProps<TNode, TCursor>) => Promise<{ edges: { node: TNode; cursor: string }[]; -- hasNextPage: boolean }>`): Data loader function.
    - `encodeCursor` (`EncodeCursor<TNode, TCursor>`): Function to encode cursor, it should return a `string.`
    - `decodeCursor` (`(cursor: string) => TCursor`): Function to decode cursor.
    - `countLoader` (`(props: CountLoaderProps<TCursor>) => Promise<number>`): Count loader function.

### mysqlPaginatedConnection

`mysqlPaginatedConnection<TNode, TCursor>(props: MysqlPaginatedConnectionProps<TNode, TCursor>)`

Handles pagination for MySQL databases, extending the basic `paginatedConnection`.

- props (`MysqlPaginatedConnectionProps`):
    - `dataLoader` (`(props: DataloaderProps<TNode, TCursor>) => Promise<{ edges: { node: TNode; cursor: string }[]; }>`): MySQL data loader.
    - `countLoader` (`(props: CountLoaderProps<TCursor>) => Promise<number>`): MySQL count loader.
    - `pagination` (`PaginationInput`): Pagination parameters.
    - `paginationSafeLimit` (`number`): Safe limit for pagination.

In the MySQL implementation, the `+1` handling of data for the calculation of the `hasNextPage` value is implicitly managed by the function execution. This means you don't need to handle it yourself. The `hasNextPage` value is automatically calculated, so you should not return this value in your data loader.

### mongoDbPaginatedConnection

`mongoDbPaginatedConnection<TNode, TCursor>(props: MongoDbPaginatedConnectionProps<TNode, TCursor>)`

Handles pagination for MongoDB databases, extending the basic paginatedConnection.

- props (`MongoDbPaginatedConnectionProps`):
    - `dataLoader` (`(props: DataloaderProps<TNode, TCursor>) => Promise<{ edges: { node: TNode; cursor: string }[]; }>`): MongoDB data loader.
    - `countLoader` (`(props: CountLoaderProps<TCursor>) => Promise<number>`): MongoDB count loader.
    - `pagination` (`PaginationInput`): Pagination parameters.
    - `paginationSafeLimit` (`number`): Safe limit for pagination.

In the MongoDB implementation, the `+1` handling of data for the calculation of the `hasNextPage` value is implicitly managed by the function execution. This means you don't need to handle it yourself. The `hasNextPage` value is automatically calculated, so you should not return this value in your data loader.


## 🌳 Join Us in Making a Difference! 🌳

We invite all developers who use Treedom's open-source code to support our mission of sustainability by planting a tree with us. By contributing to reforestation efforts, you help create a healthier planet and give back to the environment. Visit our [Treedom Open Source Forest](https://www.treedom.net/en/organization/treedom/event/treedom-open-source) to plant your tree today and join our community of eco-conscious developers.

Additionally, you can integrate the Treedom GitHub badge into your repository to showcase the number of trees in your Treedom forest and encourage others to plant new ones. Check out our [integration guide](https://github.com/treedomtrees/.github/blob/main/TREEDOM_BADGE.md) to get started.

Together, we can make a lasting impact! 🌍💚

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a pull request.

## License

This project is licensed under the MIT License.
