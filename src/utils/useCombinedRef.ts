import { useCallback } from 'react'
import type { Ref, RefCallback } from 'react'

export function useCombinedRef<T>(
  ...refs: (Ref<T> | null | undefined)[]
): RefCallback<T> {
  return useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (!ref) return
        if (typeof ref === 'function') {
          ref(node)
        } else {
          // RefObject — asignación directa
          ;(ref as React.MutableRefObject<T>).current = node
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  )
}
