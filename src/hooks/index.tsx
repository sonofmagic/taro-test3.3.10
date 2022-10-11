import Taro, { ShareAppMessageObject, useRouter, useShareAppMessage } from "@tarojs/taro"
import useStateRef from "react-usestateref"
import { View } from '@tarojs/components';
import { Loading, Empty, Button } from "@taroify/core";
import { Replay } from '@taroify/icons'
import { protoString } from "../utils";




interface AsyncData {
  current_page: string | number
  data: any[]
  last_page: number
  total: number
}

let cacheApiFn: () => Promise<any> = () => Promise.resolve()

export function useGetNextList() {
  const [, setList, list] = useStateRef<any[]>([])
  const [, setPage, page] = useStateRef(1)
  const [, setLoading, loading] = useStateRef(false)
  const [, setNoData, noData] = useStateRef(false)
  const [, setTotal, total] = useStateRef(0)

  async function getListAction(asyncData: () => Promise<any>) {
    if (total.current === list.current.length && total.current != 0) {
      // 满数据
      setNoData(true)
      return
    }
    if (loading.current) {
      return
    }
    if (page.current === 1) {
      Taro.showLoading({
        title: '加载中...'
      })
    } else {
      setLoading(true)
    }
    asyncData().then((res: AsyncData | any[]) => {
      if (page.current === 1) {
        Taro.hideLoading()
      } else {
        setLoading(false)
      }
      if (!res) {
        return
      }
      if(Array.isArray(res)){
        setList(res)
        setNoData(true)
        return
      }
      setTotal(res.total)
      if (res.current_page == 1) {
        setList(res.data)
      } else {
        setList(t => ([...t, ...res.data]))
      }
    })
  }
  function reLoadAction(asyncData: () => Promise<any>) {
    cacheApiFn = asyncData
    setNoData(false)
    setLoading(false)
    setPage(1)
    getListAction(asyncData)
  }
  function nextAction(asyncData?: () => Promise<any>) {
    if (loading.current) {
      return
    }
    setPage(t => t + 1)
    getListAction(cacheApiFn)
  }
  function referAction() {
    setNoData(false)
    setLoading(false)
    setPage(1)
    getListAction(cacheApiFn)
  }
  interface Props {
    children?: any
    emptyStyle?: React.CSSProperties
  }
  function renderAction({ children, emptyStyle }: Props) {
    return <View className='lsmi-hooks-list pb-[46px]'>
      {
        list.current.map((item, index) => {
          return children(item, index)
        })
      }
      {
        !list.current.length && <Empty style={emptyStyle || {}}>
          <Empty.Image />
          <Empty.Description>
            <View className=' flex items-center justify-center'>
              <View className='text'>暂无数据</View>
              <View className='btn ml-2 text-blue-400 py-2' style='text-decoration:underline' onClick={referAction}>
                <Replay />
                点击刷新
              </View>
            </View>
          </Empty.Description>
        </Empty>
      }
      <View style={{ display: noData.current ? 'block' : 'none', color: '#ccc' }} className='no-data py-2 text-[24px] text-center w-full' >没有更多数据了~</View>
      {/* style={{ display: loading.current ? 'flex' : 'none' }} */}
      <Loading style={{ display: loading.current ? 'flex' : 'none' }} size='24px' >加载中...</Loading>
    </View>
  }
  renderAction.defaultProps = {
    children: () => {},
    emptyStyle: {}
  }
  return { renderAction, nextAction, reLoadAction, page }
}


// 


