import { PlotEngine } from './PlotEngine';

/**
 * Mutable rendering request shared between interpreter built-ins and prompt
 * output handling.
 */
const insertOutput = { type: '' };

/**
 * Output renderers keyed by the `insertOutput.type` value produced by
 * interpreter built-ins.
 */
const outputFunction: { [k: string]: Function } = {
    ...PlotEngine.outputFunction,
};
export { outputFunction, insertOutput };
export default { outputFunction, insertOutput };
