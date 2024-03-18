import fs from 'fs'
import path from 'path'

function getFolderSize(folderPath) {
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

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0.00'
  const megabytes = bytes / (1024 * 1024)
  return megabytes.toFixed(decimals)
}

function calculateDistSizePlugin(params) {
  return {
    name: 'calculate-dist-size',
    enforce: 'post',
    apply: 'build',
    closeBundle() {
      const { distPath } = params
      const distSize = getFolderSize(distPath)
      const formattedSize = formatBytes(distSize)
      console.log(`Size of dist folder: ${formattedSize} MB`)
    },
  }
}

export default calculateDistSizePlugin
