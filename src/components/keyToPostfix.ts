/**
 * Convert component element field names from camelCase to kebab-case postfixes.
 *
 * @param keyField Field names from a component element map.
 * @returns Postfixes used to resolve template element ids.
 */
const keyToPostfix = (keyField: string[]) => keyField.map((field) => field.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase());
export { keyToPostfix };
export default keyToPostfix;
