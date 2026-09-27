import { RuntimeWorkerServer } from 'mathjslab/runtime';

new RuntimeWorkerServer(globalThis as unknown as ConstructorParameters<typeof RuntimeWorkerServer>[0]);
