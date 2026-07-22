import { useEffect, useState } from "react"


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
            <div></div>
            <div onClick={handleClick}>{count}</div>
        </>
    )
}
export default Count 