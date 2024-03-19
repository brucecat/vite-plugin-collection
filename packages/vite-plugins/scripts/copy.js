const path = require('path')
const fs = require('fs')
const glob = require('glob')


const curPath = process.cwd()
const srcDir = path.join(curPath, 'src')
const esDir = path.join(curPath, 'es')

// 打印当前执行目录
console.log('当前执行目录:', curPath)
console.log('srcDir: ', srcDir);
console.log('esDir: ', esDir);


// 将非ts文件都拷贝到es对应的目录下
// 收集src目录下所有的非ts文件
const notTsFile = glob.sync('**/*.*', { cwd: srcDir, absolute: true, ignore: '**/*.ts' });

// 拷贝文件到es对应的目录下
const copyFilesToDist = file => {
  const relativePath = path.relative(srcDir, file)
  const destPath = path.join(esDir, relativePath)
  const destDir = path.dirname(destPath)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  fs.copyFileSync(file, destPath)
}

notTsFile.forEach(file=>{
  console.log('current file: ', file);
  copyFilesToDist(file)
})