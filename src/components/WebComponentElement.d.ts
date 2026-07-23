/**
 * Element reference map stored on each Web Component instance.
 */
type WebComponentElement<T> = {
    /** Style element injected into the component shadow root. */
    style: HTMLStyleElement;
    /** External container element associated with the component. */
    container: HTMLElement;
} & {
    /** Component-specific element references and injected fields. */
    [K in keyof T]: T[K];
};
export { type WebComponentElement };
export default WebComponentElement;
