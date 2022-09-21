/*
 * @Author: lsmi
 * @Date: 2021-11-25 20:26:26
 * @LastEditors: lsmi
 * @LastEditTime: 2021-11-25 21:08:32
 * @FilePath: \taro-plaid-shop\src\utils\axios\mergeConfig.ts
 */
import { isObject, deepMerge } from './utils'
import { AxiosRequestConfig } from './type'

const strats = Object.create(null)

function defaultStrat(val1: any, val2 : any){
  return typeof val2 !== 'undefined' ? val2 : val1
}

function fromVal2Strat(val1: any, val2: any){
  if(typeof val2 !== 'undefined'){
    return val2
  }
}

function deepMergeStrat(val1: any, val2: any): any {
  if (isObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 !== 'undefined') {
    return val1
  }
}

const stratKeysFromVal2 = ['url', 'params', 'data']
stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

const stratKeysDeepMerge = ['headers', 'auth']
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

// 第二个配置优先于第一个
export function mergeConfig(config1: AxiosRequestConfig, config2?: AxiosRequestConfig | {}){
  if(!config2){
    config2 = {}
  }
  const config = Object.create(null)
  for (const key in config2) {
    mergeFiled(key)
  }
  for(const key in config1){
    if (!config2[key]) {
      mergeFiled(key)
    }
  }
  function mergeFiled(key){
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }
  return config
}