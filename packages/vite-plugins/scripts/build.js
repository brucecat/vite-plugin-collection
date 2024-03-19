const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const glob = require('glob')
const fse = require('fs-extra')


const curPath = process.cwd()
const srcDir = path.join(curPath, 'src')
const distDir = path.join(curPath, 'dist')

// 打印当前执行目录
console.log('当前执行目录:', curPath)
console.log('srcDir: ', srcDir);
console.log('distDir: ', distDir);

// 使用tsup编译ts文件
const compileWithTsup = filePath => {
  try {
    const tsupCMD = `tsup ${filePath} --dts --format cjs,esm --target esnext --no-splitting`
    console.log('tsupCMD: ', tsupCMD);
    execSync(tsupCMD, { stdio: 'inherit' })
  } catch (error) {
    console.error(`Error compiling ${filePath}: ${error.message}`)
  }
}


// 如果dist目录存在，清空目录
if (fs.existsSync(distDir)) {
  fse.emptyDirSync(distDir)
} else {
  fs.mkdirSync(distDir, { recursive: true })
}

// 编译src目录下的所有ts文件
const tsFiles = glob.sync('**/*.ts', { cwd: srcDir, absolute: true })
console.log('tsFiles: ', tsFiles);
tsFiles.forEach(compileWithTsup)

// 拷贝打包结果到dist目录下
// const buildFiles = glob.sync('**/*.{js,jsx,ts,tsx}', { cwd: srcDir, absolute: true })
// buildFiles.forEach(copyFilesToDist)


// 拷贝文件到dist目录下
const copyFilesToDist = file => {
  const relativePath = path.relative(srcDir, file)
  const destPath = path.join(distDir, relativePath)
  const destDir = path.dirname(destPath)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  fs.copyFileSync(file, destPath)
}
