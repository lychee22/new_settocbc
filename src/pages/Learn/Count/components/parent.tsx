import { useRef, useState } from 'react'
import { Button, Card, Input, Space, Typography } from 'antd'
import Child, { type ChildRef } from './child'

const { Title, Paragraph } = Typography

/**
 * 父组件,演示父子通信三种方式:
 * 1. 父 → 子:Props 传值(name)
 * 2. 子 → 父:回调函数 Props(onSendMsg)
 * 3. 父主动调用子:useRef + useImperativeHandle(child 暴露 focus / fill)
 */
const Parent: React.FC = () => {
    // 子 → 父:用 state 接收子组件回调传过来的消息
    const [msgFromChild, setMsgFromChild] = useState('(还没收到)')
    // 父 → 子:会通过 props 传给子组件的名字
    const [name, setName] = useState('张三')
    // 父主动访问子组件:通过 ref 获取子组件暴露的命令式方法
    const childRef = useRef<ChildRef>(null)

    const handleCallChildFocus = () => {
        // 父 → 子 命令式 —— 通过 ref 调用子组件暴露的方法
        childRef.current?.focus()
    }

    const handleCallChildFill = () => {
        // 父主动命令子组件把文本写到它自己的 input 里
        childRef.current?.fill(`父组件塞进来的内容 @${Date.now()}`)
    }

    return (
        <Card title="父子组件通信演示" style={{ marginTop: 24 }}>
            <Paragraph>
                <ul>
                    <li>
                        <b>父 → 子</b>:通过 Props 把 <code>name</code> 传给 Child 显示
                    </li>
                    <li>
                        <b>子 → 父</b>:Child 调用回调 <code>onSendMsg</code> 把消息传上来
                    </li>
                    <li>
                        <b>父主动调子</b>:通过 <code>useRef + useImperativeHandle</code>{' '}
                        调 Child 暴露的 focus / fill
                    </li>
                </ul>
            </Paragraph>

            <Title level={5}>1. 父 → 子(Props)</Title>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="要传给子组件的 name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: 240 }}
                />
            </Space>

            <Title level={5}>2. 子 → 父(回调函数 Props)</Title>
            <p>
                子组件消息:<code>{msgFromChild}</code>
            </p>

            <Title level={5}>3. 父主动调子(useRef + useImperativeHandle)</Title>
            <Space>
                <Button onClick={handleCallChildFocus}>调用子组件 focus</Button>
                <Button onClick={handleCallChildFill}>
                    调用子组件 fill(塞文本进去)
                </Button>
            </Space>

            <div
                style={{
                    marginTop: 16,
                    padding: 16,
                    background: '#fafafa',
                    borderRadius: 8,
                }}
            >
                <Child
                    ref={childRef}
                    name={name}
                    onSendMsg={(msg) => setMsgFromChild(msg)}
                />
            </div>
        </Card>
    )
}

export default Parent
