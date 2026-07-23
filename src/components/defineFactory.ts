import { type WebComponentInterface } from './WebComponentInterface';
import WebComponentType from './WebComponentType';

/**
 * Create a method that registers a Web Component class with `customElements`.
 *
 * @param component Component constructor and static metadata.
 * @returns Registration method bound by the component class.
 */
const defineFactory = <T extends HTMLElement & WebComponentInterface<T>>(component: WebComponentType<T>): (() => void) => {
    return function () {
        customElements.define(component.tagName, component);
    };
};
export { defineFactory };
export default defineFactory;
