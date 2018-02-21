export type ConstructorOrAbstract<T = {}> = Function & { prototype: T };                  // tslint:disable-line:ban-types
export type ConstructorAbstractOrInstance<T = {}> = T | ConstructorOrAbstract;            // tslint:disable-line:ban-types
