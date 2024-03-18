import { Plugin } from 'vite'

declare function calculateDistSizePlugin(params: { distPath: string }): Plugin

export default calculateDistSizePlugin
