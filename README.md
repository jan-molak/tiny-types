# Tiny Types

[![npm version](https://badge.fury.io/js/tiny-types.svg)](https://badge.fury.io/js/tiny-types)
[![Build Status](https://travis-ci.org/jan-molak/tiny-types.svg?branch=master)](https://travis-ci.org/jan-molak/tiny-types)
[![Coverage Status](https://coveralls.io/repos/github/jan-molak/tiny-types/badge.svg?branch=master)](https://coveralls.io/github/jan-molak/tiny-types?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm](https://img.shields.io/npm/dm/tiny-types.svg)](https://npm-stat.com/charts.html?package=tiny-types)
[![Known Vulnerabilities](https://snyk.io/test/github/jan-molak/tiny-types/badge.svg)](https://snyk.io/test/github/jan-molak/tiny-types)

TinyTypes is an [npm module](https://www.npmjs.com/package/tiny-types) that makes it easy for TypeScript and JavaScript
projects to give domain meaning to primitive types. It also helps to avoid all sorts of bugs 
and makes your code easier to refactor. [Learn more.](https://janmolak.com/tiny-types-in-typescript-4680177f026e)

## API Docs

API documentation is available at [jan-molak.github.io/tiny-types/](https://jan-molak.github.io/tiny-types/).

## Installation

To install the module from npm:

```
npm install --save tiny-types
```

## Defining Tiny Types

> An int on its own is just a scalar with no meaning. With an object, even a small one, you are giving both the compiler 
and the programmer additional information  about what the value is and why it is being used.
>
> &dash; [Jeff Bay, Object Calisthenics](http://www.xpteam.com/jeff/writings/objectcalisthenics.rtf)

### Single-value types

To define a single-value `TinyType` - extend from `TinyTypeOf<T>()`:

```typescript
import { TinyTypeOf } from 'tiny-types';

class FirstName extends TinyTypeOf<string>() {}
class LastName  extends TinyTypeOf<string>() {}
class Age       extends TinyTypeOf<number>() {}
```
 
Every tiny type defined this way has
a [readonly property](https://www.typescriptlang.org/docs/handbook/classes.html#readonly-modifier)
`value` of type `T`, which you can use to access the wrapped primitive value. For example:

```typescript
const firstName = new FirstName('Jan');

firstName.value === 'Jan';
```

#### Equals

Each tiny type object has an `equals` method, which you can use to compare it by value:

```typescript
const 
    name1 = new FirstName('Jan'),
    name2 = new FirstName('Jan');

name1.equals(name2) === true; 
```

#### ToString

An additional feature of tiny types is a built-in `toString()` method:

```typescript
const name = new FirstName('Jan');

name.toString() === 'FirstName(value=Jan)';
```

Which you can override if you want to:

```typescript
class Timestamp extends TinyTypeOf<Date>() {
    toString() {
        return `Timestamp(value=${this.value.toISOString()})`;
    }
}

const timestamp = new Timestamp(new Date());

timestampt.toString() === 'Timestamp(value=2018-03-12T00:30:00.000Z))'
```

### Multi-value and complex types

If the tiny type you want to model has more than one value,
or you want to perform additional operations in the constructor,
extend from `TinyType` directly:

```typescript
import { TinyType } from 'tiny-types';

class Person extends TinyType {
    constructor(public readonly firstName: FirstName,
                public readonly lastName: LastName,
    ) {
        super();
    }
}

```

You can also mix and match both of the above definition styles:

```typescript
import { TinyType, TinyTypeOf } from 'tiny-types';

class UserName extends TinyTypeOf<string>() {}

class Timestamp extends TinyTypeOf<Date>() {
    toString() {
        return `Timestamp(value=${this.value.toISOString()})`;
    }
}

abstract class DomainEvent extends TinyTypeOf<Timestamp>() {}

class AccountCreated extends DomainEvent {
    constructor(public readonly username: UserName, timestamp: Timestamp) {
        super(timestamp);
    }
}

const event = new AccountCreated(new UserName('jan-molak'), new Timestamp(new Date()));
```

Even such complex types still have both the `equals` and `toString` methods:

```typescript 
const 
    now = new Date(2018, 2, 12, 0, 30),
    event1 = new AccountCreated(new UserName('jan-molak'), new Timestamp(now)),
    event2 = new AccountCreated(new UserName('jan-molak'), new Timestamp(now));
    
event1.equals(event2) === true;

event1.toString() === 'AccountCreated(username=UserName(value=jan-molak), value=Timestamp(value=2018-03-12T00:30:00.000Z))'
``` 

## Serialisation to JSON

Every TinyType defines 
a [`toJSON()` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior), 
which returns a JSON representation of the object. This means that you can use TinyTypes 
as [Data Transfer Objects](https://en.wikipedia.org/wiki/Data_transfer_object).

Single-value TinyTypes are serialised to the value itself:

```typescript
import { TinyTypeOf } from 'tiny-types';

class FirstName extends TinyTypeOf<string>() {}

const firstName = new FirstName('Jan');

firstName.toJSON() === 'Jan'
```

Complex TinyTypes are serialised recursively:

```typescript
import { TinyType, TinyTypeOf } from 'tiny-types';

class FirstName extends TinyTypeOf<string>() {}
class LastName extends TinyTypeOf<string>() {}
class Age extends TinyTypeOf<number>() {}
class Person extends TinyType {
    constructor(
        public readonly firstName: FirstName,
        public readonly lastName: LastName,
        public readonly age: Age,
    ) {
        super();
    }
}

const person = new Person(new FirstName('Bruce'), new LastName('Smith'), new Age(55));

person.toJSON() === { firstName: 'Bruce', lastName: 'Smith', age: 55 }
```

## De-serialisation from JSON

Although you could define standalone de-serialisers, I like to define them 
as [static factory methods](https://en.wikipedia.org/wiki/Factory_method_pattern) on the TinyTypes themselves:

```typescript
import { TinyTypeOf } from 'tiny-types';

class FirstName extends TinyTypeOf<string>() {
    static fromJSON = (v: string) => new FirstName(v);
}

const firstName = new FirstName('Jan'),

FirstName.fromJSON(firstName.toJSON()).equals(firstName) === true
```

When working with complex TinyTypes, you can use the (experimental) `Serialised` interface
to reduce the likelihood of your custom `fromJSON` method being incompatible with `toJSON`:

```typescript
import { TinyTypeOf, TinyType, Serialised } from 'tiny-types';

class EmployeeId extends TinyTypeOf<number>() {
    static fromJSON = (id: number) => new EmployeeId(id);
}

class DepartmentId extends TinyTypeOf<string>() {
    static fromJSON = (id: string) => new DepartmentId(id);
}

class Allocation extends TinyType {
    static fromJSON = (o: Serialised<Allocation>) => new Allocation(
        EmployeeId.fromJSON(o.employeeId as number),
        DepartmentId.fromJSON(o.departmentId as string),
    )

    constructor(public readonly employeeId: EmployeeId, public readonly departmentId: DepartmentId) {
        super();
    }
}
``` 

This way de-serialising a complex type becomes trivial:

```typescript
const allocation = new Allocation(new EmployeeId(1), new DepartmentId('engineering'));

const deserialised = Allocation.fromJSON({ departmentId: 'engineering', employeeId: 1 });

allocation.equals(deserialised) === true
``` 

Although `Serialised` is by no means 100% foolproof as it's only limited to checking whether your input JSON has the same fields
as the object you're trying to de-serialise, it can at least help you to avoid errors caused by typos.

## Your feedback matters!

Do you find TinyTypes useful? [Give it a star!](https://github.com/jan-molak/tiny-types) &#9733;

Found a bug? Need a feature? Raise [an issue](https://github.com/jan-molak/tiny-types/issues?state=open)
or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

## License

TinyTypes library is licensed under the [Apache-2.0](https://github.com/jan-molak/tiny-types/blob/master/LICENSE.md) license.

----

_- Copyright &copy; 2018- [Jan Molak](https://janmolak.com)_
