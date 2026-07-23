export type ComponentElementMap = Record<string, HTMLElement>;

export abstract class ComponentElement<TElement extends ComponentElementMap> extends HTMLElement {
  public readonly element = {} as TElement & { style: HTMLStyleElement };

  protected mountTemplate(tagName: string, fields: readonly (keyof TElement)[], styles: string): void {
    const template = document.getElementById(`${tagName}-template`) as HTMLTemplateElement | null;
    if (!template) {
      throw new Error(`Template ${tagName}-template not found.`);
    }

    const clone = template.content.cloneNode(true) as DocumentFragment;
    this.element.style = document.createElement('style');
    this.element.style.textContent = styles;

    for (const field of fields) {
      const element = clone.querySelector<HTMLElement>(`[data-element="${String(field)}"]`);
      if (!element) {
        throw new Error(`Element ${String(field)} not found in ${tagName}.`);
      }
      (this.element as Record<string, HTMLElement>)[String(field)] = element;
    }

    this.attachShadow({ mode: 'open' }).append(this.element.style, clone);
  }
}
