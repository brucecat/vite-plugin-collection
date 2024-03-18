// 复杂类型: Object, Function
const isComplex = obj => {
  return typeof obj === 'object' || typeof obj === 'function'
}

// 判断两个复杂类型是否相等
const isComplexEqual = (a, b) => {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false
  }

  const aKVList = Object.entries(a)
  const bKVList = Object.entries(b)

  let flag = true
  aKVList.forEach(([aK, aV], index) => {
    const [bK, bV] = bKVList[index]

    if (!(aK === bK && isEqual(aV, bV))) {
      flag = false
    }
  })

  return flag
}

// 判断两个值是否相等
const isEqual = (a, b) => {
  if (isComplex(a) && !isComplex(b)) {
    return false
  }

  if (!isComplex(a) && isComplex(b)) {
    return false
  }
  if (isComplex(a) && isComplex(b)) {
    return isComplexEqual(a, b)
  }

  return a === b
}

const v1 = { b: 1, a: 1 }
const v2 = { a: 1, b: 1 }
console.log(isEqual(v1, v2))
