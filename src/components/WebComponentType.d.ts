/**
 * Constructor type plus static metadata required by the Web Component helper
 * factories.
 */
type WebComponentType<T extends HTMLElement> = (new (...args: any[]) => T) & {
    /** Custom element tag name. */
    tagName: string;
    /** Keys for HTML elements exposed through the component `element` map. */
    elementFields: string[];
    /** Id postfixes matching `elementFields`. */
    elementPostfix: string[];
    /** Component-level null sentinel. */
    null: T;
    /** Component-level undefined sentinel. */
    undefined: T;
};
export { type WebComponentType };
export default WebComponentType;
