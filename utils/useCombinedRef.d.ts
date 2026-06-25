import { Ref, RefCallback } from '../../node_modules/react';
export declare function useCombinedRef<T>(...refs: (Ref<T> | null | undefined)[]): RefCallback<T>;
