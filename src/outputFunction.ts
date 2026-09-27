import { insertOutput, PlotEngine } from './PlotEngine';

/**
 * Output renderers keyed by the `insertOutput.type` value produced by
 * interpreter built-ins.
 */
const outputFunction: { [k: string]: Function } = {
    ...PlotEngine.outputFunction,
};
export { outputFunction, insertOutput };
export default { outputFunction, insertOutput };
