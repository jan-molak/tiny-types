import { MatcherRule } from './MatcherRule';

export class MatchesAnything<Input_Type, Output_Type> extends MatcherRule<Input_Type, Output_Type> {
    constructor(transformation: (v: Input_Type) => Output_Type) {
        super(transformation);
    }

    matches(_: Input_Type): boolean {
        return true;
    }
}
