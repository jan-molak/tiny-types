export type Null = null;
export type NonNullJSONPrimitive = string | number | boolean;
export type JSONPrimitive = NonNullJSONPrimitive | Null;
export interface JSONObject {
    [_: string]: JSONPrimitive | JSONObject | JSONArray;
}
export interface JSONArray extends Array<JSONValue> {}                         // tslint:disable-line:no-empty-interface
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
