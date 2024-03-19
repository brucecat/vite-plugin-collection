import fs from 'fs'
import path from 'path'
import { Plugin } from 'vite'

function getFolderSize(folderPath: string): number {
  if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
    return 0
  }

  let totalSize = 0
  const files = fs.readdirSync(folderPath)

  files.forEach(file => {
    const filePath = path.join(folderPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isFile()) {
      totalSize += stats.size
    } else if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath)
    }
  })

  return totalSize
}

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0.00'
  const megabytes = bytes / (1024 * 1024)
  return megabytes.toFixed(decimals)
}

function calculateDistSizePlugin(): Plugin {
  let distPath = ''

  return {
    name: 'calculate-dist-size',
    enforce: 'post' as const,
    apply: 'build' as const,

    configResolved(config) {
      // 可以在这里获取打包输出的目录
      const outDir = config.build.outDir

      distPath = outDir
    },

    closeBundle() {
      if (!distPath) {
        console.error('Fail to get size of dist folder.')
        return
      }
      const distSize = getFolderSize(distPath)
      const formattedSize = formatBytes(distSize)
      console.log(`Size of dist folder: ${formattedSize} MB`)
    }
  }
}

export default calculateDistSizePlugin
