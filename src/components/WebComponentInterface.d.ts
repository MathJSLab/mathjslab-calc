/**
 * Runtime fields and methods mixed into each custom Web Component instance.
 */
interface WebComponentInterface<T> {
    /** Component-owned references to template elements. */
    element: WebComponentElement<T>;
    /** Current root id used as the replacement base for child element ids. */
    superId: string;
    /** Public element id. */
    id: string;
    /** Update the component id and related template element ids. */
    setId: (id?: string) => void;
    /** External container element associated with the component. */
    container: HTMLElement;
}
export { type WebComponentInterface };
