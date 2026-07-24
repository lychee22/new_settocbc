export interface TCount {
    num: number,
    changeNum?: (count: number) => void
}
const Computer = ({ num, changeNum }: TCount) => {

    const handleAdd = () => {
        changeNum?.(num + 1)
    }


    return (<>
        <div>尝试ing</div>
        <button onClick={handleAdd}>{num}</button>
    </>)
}
export default Computer;