import { Bloc, BlocEvent, BlocState } from '../src'

abstract class TestEvent extends BlocEvent {}
class SomeTestEvent extends TestEvent {
  constructor(public yieldNotUsedTestState = false) {
    super()
  }
}
class ThrowErrorTestEvent extends TestEvent {}

abstract class TestState extends BlocState {}
class InitialTestState extends TestState {}
class NotInitialTestState extends TestState {}
class NeverUsedTestState extends TestState {
  isEqual() {
    return true
  }
}

class TestBloc extends Bloc<TestEvent, TestState> {
  async *mapEventToState(event: TestEvent) {
    if (event instanceof SomeTestEvent) {
      if (event.yieldNotUsedTestState) {
        yield new NeverUsedTestState()
      } else {
        yield new NotInitialTestState()
      }
    } else if (event instanceof ThrowErrorTestEvent) {
      throw new Error()
    }
  }
}

describe('core logic', () => {
  it('should receive InitialTestState when no events was dispatched', async () => {
    const bloc = new TestBloc(new InitialTestState())

    const result = await new Promise((resolve) => {
      bloc.subscribe((state) => {
        resolve(state)
      })
    })

    expect(result).toBeInstanceOf(InitialTestState)
  })

  it('should receive NonInitialTestState when SomeTestEvent was dispatched', async () => {
    const bloc = new TestBloc(new InitialTestState())

    const result = await new Promise((resolve) => {
      bloc.subscribe((state) => {
        if (state instanceof InitialTestState) return
        resolve(state)
      })

      bloc.dispatch(new SomeTestEvent())
    })

    expect(result).toBeInstanceOf(NotInitialTestState)
  })

  it('should not receive NeverUsedTestState when isEqual() method returns true', async () => {
    const bloc = new TestBloc(new InitialTestState())

    const result = await new Promise((resolve) => {
      bloc.subscribe((state) => {
        if (state instanceof InitialTestState) return
        resolve(state)
      })

      bloc.dispatch(new SomeTestEvent(true))
      bloc.dispatch(new SomeTestEvent())
    })

    expect(result).toBeInstanceOf(NotInitialTestState)
  })

  it('should return current state', async () => {
    const bloc = new TestBloc(new InitialTestState())

    const result = await new Promise((resolve) => {
      bloc.subscribe((state) => {
        if (state instanceof InitialTestState) return
        resolve(state)
      })

      bloc.dispatch(new SomeTestEvent())
    })

    expect(result).toBeInstanceOf(NotInitialTestState)
    expect(bloc.getState()).toBe(result)
  })
})

describe('logger', () => {
  it('should log events and states', async () => {
    const mockedLogger = { info: jest.fn(), error: jest.fn() }
    Bloc.logger = mockedLogger

    const bloc = new TestBloc(new InitialTestState())
    await new Promise((resolve) => {
      bloc.subscribe((state) => {
        if (state instanceof InitialTestState) return
        resolve(state)
      })
      bloc.dispatch(new SomeTestEvent())
    })

    expect(mockedLogger.info).toBeCalled()
    expect(mockedLogger.error).not.toBeCalled()
  })

  it('should log errors', async () => {
    const mockedLogger = { info: jest.fn(), error: jest.fn() }
    Bloc.logger = mockedLogger

    const bloc = new TestBloc(new InitialTestState())
    await new Promise((resolve) => {
      bloc.subscribe(() => {})
      bloc.dispatch(new ThrowErrorTestEvent())
      setTimeout(resolve)
    })

    expect(mockedLogger.error).toBeCalled()

    // ----------------------------------------------------------

    mockedLogger.error.mockReset()
    Bloc.logger = undefined

    await new Promise((resolve) => {
      bloc.subscribe(() => {})
      bloc.dispatch(new ThrowErrorTestEvent())
      setTimeout(resolve)
    })

    expect(mockedLogger.error).not.toBeCalled()
  })
})
