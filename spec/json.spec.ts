import 'mocha';
import { JSONArray, JSONObject, JSONPrimitive, JSONValue } from '../src/types';

describe('JSON', () => {

    const
        Some_String: string = 'string',
        Some_Number: number = 1,
        Some_Boolean: boolean = false,
        Some_Object = {k1: Some_String, k2: Some_Number},
        Some_Array = [Some_String, Some_Number, Some_Boolean, Some_Object];

    /** @test {JSONArray} */
    describe('JSONArray', () => {
        it(`describes an array that's a valid JSON`, () => {
            const array: JSONArray = Some_Array;
        });
    });

    /** @test {JSONObject} */
    describe('JSONObject', () => {
        it(`describes a JavaScript object serialised to JSON`, () => {
            const object: JSONObject = {
                string: Some_String,
                number: Some_Number,
                boolean: Some_Boolean,
                object: Some_Object,
                array: Some_Array,
            };
        });
    });

    /** @test {JSONPrimitive} */
    describe('JSONPrimitive', () => {
        it(`describes any primitive that can be part of JSON`, () => {
            const s: JSONPrimitive = 'string',
                n: JSONPrimitive = 42,
                b: JSONPrimitive = false,
                e: JSONPrimitive = null;
        });
    });

    /** @test {JSONValue} */
    describe('JSONValue', () => {
        it('describes any value that can be represented as JSON', () => {
            const
                ss: JSONValue = Some_String,
                sn: JSONValue = Some_Number,
                sb: JSONValue = Some_Boolean,
                so: JSONValue = Some_Object,
                sa: JSONValue = Some_Array;
        });
    });
});
