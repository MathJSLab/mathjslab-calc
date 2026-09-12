import type { BuiltInFunctionTable } from 'mathjslab';
import './outputFunction';
import { PlotEngine } from './PlotEngine';
import { commonExternalFunctionTable } from './commonExternalFunctionTable';

/**
 * Browser-facing numerical and plotting functions exposed by the calculator.
 */
const externalFunctionTable: BuiltInFunctionTable = {
    ...PlotEngine.externalFunctionTable,
    ...commonExternalFunctionTable,
};

export { externalFunctionTable };
export default { externalFunctionTable };
