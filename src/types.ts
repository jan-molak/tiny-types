export type List<T> = T[];
// export type Constructor<T> = new (...args: any[]) => T;
// export type Abstract<T> = Function & { prototype: T };  // tslint:disable-line:ban-types
// export type ConstructorOrAbstract<T = {}> = Constructor<T> | Abstract<T>;
export type ConstructorOrAbstract<T = {}> = Function & { prototype: T };  // tslint:disable-line:ban-types
