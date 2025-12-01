import { ObjectLiteral, Repository } from 'typeorm';

// [ Type ]
export type MockedObject<T = unknown> = Record<keyof T, jest.Mock>;

// [ Utility Function ]

// Return mocked prototype chain except constructor
const mockPrototypeChain = <T>(
  prototypeProperty: string[],
): MockedObject<T> => {
  return prototypeProperty
    .filter((property) => property !== 'constructor')
    .reduce((chain: Record<string, jest.Mock>, key: string) => {
      chain[key] = jest.fn();
      return chain;
    }, {}) as MockedObject<T>;
};

// Mock Repository Factory
// Mock TypeORM Repository class prototype and custom repository methods
class MockRepositoryFactory {
  static create<T extends Repository<ObjectLiteral>>(
    repository: new (...args: any[]) => T,
  ): MockedObject<T> {
    return mockPrototypeChain(
      [Repository, repository].flatMap((cls: Function) =>
        Object.getOwnPropertyNames(cls.prototype),
      ),
    );
  }
}

// Mock Service Factory
class MockServiceFactory {
  static create<T>(service: new (...args: any[]) => T): MockedObject<T> {
    return mockPrototypeChain(
      [service].flatMap((cls: Function) =>
        Object.getOwnPropertyNames(cls.prototype),
      ),
    );
  }
}
