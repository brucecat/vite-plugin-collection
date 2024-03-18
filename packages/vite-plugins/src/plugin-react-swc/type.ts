import { JscTarget } from '@swc/core'
import { FilterPattern } from 'vite'

export type ViteOptions = {
  /**
   * Control where the JSX factory is imported from.
   * @default "react"
   */
  jsxImportSource?: string
  include?: FilterPattern
  exclude?: FilterPattern
  target?: JscTarget
}
