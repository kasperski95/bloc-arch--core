# @bloc-arch/core <!-- omit in toc -->

![https://travis-ci.com/kasperski95/bloc-arch--core.svg?branch=master](https://travis-ci.com/kasperski95/bloc-arch--core.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/kasperski95/bloc-arch--core/badge.svg?branch=master)](https://coveralls.io/github/kasperski95/bloc-arch--core?branch=master)

BLoC (Business Logic Component) is the most popular architecture (pattern) for Flutter development introduced at Google I/O in 2019.

This package provides essential logic to recreate this pattern in JavaScript (and TypeScript).


## Table of Contents <!-- omit in toc -->
- [Related packages](#related-packages)
- [Diagram](#diagram)
- [Usage Example](#usage-example)

---

## Related packages
- [@bloc-arch/cli](https://www.npmjs.com/package/@bloc-arch/cli)
- [@bloc-arch/react](https://www.npmjs.com/package/@bloc-arch/react)

## Diagram
![diagram](https://raw.githubusercontent.com/kasperski95/bloc-arch--core/master/documentation/bloc.png)

## Usage Example
```ts
// UserBloc.ts:

import { Bloc } from '@bloc-arch/core'
import * as UserEvents from './UserEvent'
import * as UserStates from './UserState'

export class UserBloc extends Bloc<UserEvents.UserEvent, UserStates.UserState> {
  public jwt: string | undefined

  constructor(
    private authRepository: AuthRepository,
    private userRepository: UserRepository
  ) {
    super(new UserStates.Authenticating())
  }

  async *mapEventToState(event: UserEvents.UserEvent) {
    if (event instanceof UserEvents.Authenticate) {
      yield new UserStates.Authenticating()
      this.jwt = await this.authRepository.authenticate(
        event.login,
        event.password
      )
      if (!this.jwt) {
        yield new UserStates.Anonymous()
      } else {
        const user = await this.userRepository.me(this.jwt)
        if (user.role === 'admin') {
          yield new UserStates.Administrator(user.username)
        } else {
          yield new UserStates.Authenticated(user.username)
        }
      }
    } else if (event instanceof UserEvents.LogOut) {
      this.jwt = undefined
      yield new UserStates.Anonymous()
    }
  }
}

```

```ts
// UserState.ts:

import { BlocState } from '@bloc-arch/core'

export abstract class UserState extends BlocState {}

export class Authenticating extends UserState {}

export class Anonymous extends UserState {}

export class Authenticated extends UserState {
  constructor(public username: string) {
    super()
  }
}

export class Administrator extends Authenticated {}

```

```ts
// UserEvent.ts:

import { BlocEvent } from '@bloc-arch/core'

export abstract class UserEvent extends BlocEvent {}

export class Authenticate extends UserEvent {
  constructor(public login: string, public password: string) {
    super()
  }
}

export class LogOut extends UserEvent {}

```