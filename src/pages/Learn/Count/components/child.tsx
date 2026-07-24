import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Button, Input, Space, Typography } from 'antd'
import type { InputRef } from 'antd'

const { Text } = Typography

// 1. Props 类型:父传子的数据 + 子传父的回调
export interface ChildProps {
    name: string                      // 父 → 子:父组件传进来的展示数据
    onSendMsg?: (msg: string) => void // 子 → 父:子组件把消息回传给父组件
}

// 2. ref 类型:定义父组件通过 ref 可以调到哪些命令式方法
export interface ChildRef {
    focus: () => void              // 让父组件主动 focus 到子组件的 input
    fill: (text: string) => void   // 让父组件主动往子组件的 input 里写内容
}

// 3. forwardRef 让父组件可以用 ref 拿到我们暴露的方法
const Child = forwardRef<ChildRef, ChildProps>(({ name, onSendMsg }, ref) => {
    const [text, setText] = useState('')
    const inputRef = useRef<InputRef>(null)

    // 把方法挂到 ref 上,父组件通过 childRef.current.focus() 等即可调用
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus()
        },
        fill: (val: string) => {
            setText(val)
            inputRef.current?.focus()
        },
    }))

    const handleSend = () => {
        // 子 → 父:调用父组件传下来的回调,把数据传回去
        onSendMsg?.(text || '(子组件空消息)')
    }

    return (
        <div>
            <p>
                父组件传过来的名字:<Text strong>{name}</Text>
            </p>
            <Space>
                <Input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="在子组件里输入"
                    style={{ width: 240 }}
                />
                <Button type="primary" onClick={handleSend}>
                    发送到父组件
                </Button>
            </Space>
        </div>
    )
})

// 给 DevTools 一个友好的组件名(forwardRef 后默认显示为 ForwardRef)
Child.displayName = 'Child'

export default Child
