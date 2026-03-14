import { List } from '../types/index.js';
import { MatcherRule, MatchesAnything } from './rules/index.js';

/**
 * @access private
 */
export abstract class PatternMatcher<Input_Type, Pattern_Type, Matching_Type, Output_Type> {
    constructor(
        protected readonly value: Input_Type,
        protected readonly rules: List<MatcherRule<Input_Type, Output_Type>> = []) {
    }

    abstract when(pattern: Pattern_Type, transformation: (v: Matching_Type) => Output_Type): PatternMatcher<Input_Type, Pattern_Type, Matching_Type, Output_Type>;

    else(transformation: (v: Input_Type) => Output_Type): Output_Type {
        const matching_rule = this.rules.find(m => m.matches(this.value));

        return (matching_rule || new MatchesAnything(transformation)).execute(this.value);
    }
}
