import { IdentityMatcher, ObjectMatcher, PatternMatcher, StringMatcher } from './pattern-matching';
import { TinyType } from './TinyType';
import { ConstructorOrAbstract } from './types';

// boolean equality matcher
export function match<Output_Type>(_: boolean): {

    when: (
        pattern: boolean,
        transformation: (_: boolean) => Output_Type,
    ) => PatternMatcher<boolean, boolean, boolean, Output_Type>,
};

// number equality matcher
export function match<Output_Type>(_: number): {

    when: (
        pattern: number,
        transformation: (_: number) => Output_Type,
    ) => PatternMatcher<number, number, number, Output_Type>,
};

// number equality matcher
export function match<Output_Type>(_: symbol): {

    when: (
        pattern: symbol,
        transformation: (_: symbol) => Output_Type,
    ) => PatternMatcher<symbol, symbol, symbol, Output_Type>,
};

// string equality and regexp matcher
export function match<Output_Type>(_: string): {
    when: (
        pattern: string | RegExp,
        transformation: (_: string) => Output_Type,
    ) => PatternMatcher<string, string | RegExp, string, Output_Type>,
};

// Tiny Type equality matcher
export function match<Input_Type>(_: Input_Type): {
    when: <Output_Type>(
        pattern: TinyType,
        transformation: (v: TinyType) => Output_Type,
    ) => PatternMatcher<Input_Type, TinyType | ConstructorOrAbstract<Input_Type>, TinyType | Input_Type, Output_Type>,
};

// type matcher
export function match<Input_Type, Output_Type>(_: Input_Type): {

    when: <MT extends Input_Type>(
        pattern: ConstructorOrAbstract<MT>,
        transformation: (v: MT) => Output_Type,
    ) => PatternMatcher<Input_Type, TinyType | ConstructorOrAbstract<Input_Type>, TinyType | Input_Type, Output_Type>,
};

/**
 * @experimental
 *
 * @param value
 * @returns {PatternMatcher<any, any, any, any>}
 */
export function match(value: any): PatternMatcher<any, any, any, any> {
    switch (true) {
        case typeof value === 'string':
            return new StringMatcher(value as string);
        case typeof value === 'object':
            return new ObjectMatcher(value);
        default:
            return new IdentityMatcher(value);
    }
}
