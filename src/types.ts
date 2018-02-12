export type List<T> = T[];
export type ConstructorOrAbstract<T = {}> = Function & { prototype: T };  // tslint:disable-line:ban-types
