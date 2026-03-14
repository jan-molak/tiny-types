import { TinyType } from '../../TinyType.js';
import { MatcherRule } from './MatcherRule.js';

/**
 * @access private
 */
export class MatchesEqualTinyType<Output_Type> extends MatcherRule<TinyType, Output_Type> {
    constructor(private readonly pattern: TinyType, transformation: (v: TinyType) => Output_Type) {
        super(transformation);
    }

    matches(value: TinyType): boolean {
        return this.pattern.equals(value);
    }
}
