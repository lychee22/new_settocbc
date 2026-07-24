import { useEffect, useState } from "react"
import Parent from './components/parent' // 新增:父子组件通信演示区
import Computer from "./components/Computer"


const Count:React.FC = () => {
    const [count, setCount] = useState(0)
    const handleClick = ()=>{
        setCount(count+1)
    }

    // 用于处理函数副作用，类似事件监听;三种写法；
    useEffect(()=>{
        document.title = count.toString()
    },[count])

    useEffect(()=>{
        console.log('组件挂载完成') // 类比于类组件的onComponentDidMount

        return ()=>{
            console.log('组件卸载完成')
        }
    },[])

    useEffect(()=>{
        console.log('组件更新完成') // 类比于类组件的onComponentDidUpdate
    })

    return (
        <>
            {/* === 原有 useState + useEffect 演示(完全保留) === */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>useState + useEffect 演示(点数字 +1)</div>
                <div onClick={handleClick}>{count}</div>
            </div>

            {/* === 新增:父子组件通信演示区 === */}
            <Parent />
            <Computer num={count} changeNum={setCount}/>
        </>
    )
}
export default Count