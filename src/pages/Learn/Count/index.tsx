import { useState } from "react"


const Count:React.FC = () => {
    const [count, setCount] = useState(0)
    const handleClick = ()=>{
        setCount(count+1)
    }
    return (
        <div onClick={handleClick}>{count}</div>
    )
}
export default Count 