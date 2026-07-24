declare module 'mathjslab' {
    export type NodeInput = any;

    export type InterpreterInstance = {
        debug: boolean;
        Parse(input: string): NodeInput;
        Evaluate(input: NodeInput): NodeInput;
        Unparse(input: NodeInput): string;
        UnparseMathML(input: NodeInput): string;
    };

    export const Interpreter: {
        Create(configuration?: Record<string, unknown>): InterpreterInstance;
    };
}
