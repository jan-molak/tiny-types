export type List<T> = T[];
export type ConstructorOrAbstract<T = {}> = Function & { prototype: T };                  // tslint:disable-line:ban-types
export type ConstructorAbstractOrInstance<T = {}> = T | ConstructorOrAbstract;            // tslint:disable-line:ban-types

export type JSONPrimitive = string | number | boolean | null;
export interface JSONObject {
    [_: string]: JSONPrimitive | JSONObject | JSONArray;
}
export interface JSONArray extends Array<JSONValue> {}                         // tslint:disable-line:no-empty-interface
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
