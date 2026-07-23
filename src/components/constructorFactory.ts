import { type WebComponentInterface } from './WebComponentInterface';
import WebComponentType from './WebComponentType';

/**
 * Create a constructor body that clones the component template into shadow DOM
 * and wires the declared element map.
 *
 * @param component Component constructor and static metadata.
 * @param styles CSS text injected into the component shadow root.
 * @returns Constructor body used by concrete Web Component classes.
 */
const constructorFactory = <T extends HTMLElement & WebComponentInterface<T>>(component: WebComponentType<T>, styles: string): ((this: T) => void) => {
    return function (this: T): void {
        /* Find template in main DOM. */
        const template = document.getElementById(`${component.tagName}-template`) as HTMLTemplateElement;
        if (template) {
            /* Clone the template content. */
            const clone = template.content.cloneNode(true) as DocumentFragment;
            /* Create a <style> element for the component styles. */
            this.element.style = document.createElement('style');
            this.element.style.textContent = styles;
            component.elementFields.forEach((element: string, index: number) => {
                this.element[element] = clone.getElementById(`${component.tagName}-${component.elementPostfix[index]}`)!;
            });
            this.setId(this.superId);
            /* Attach shadow DOM and add styles before the template clone. */
            this.attachShadow({ mode: 'open' }).append(this.element.style, clone);
            if (this.parentElement) {
                this.element.container = this.parentElement;
            }
        }
    };
};
export { constructorFactory };
export default constructorFactory;
