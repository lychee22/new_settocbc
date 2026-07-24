import { useEffect, useState } from 'react'
import { Card, Space, Typography, Button, Tag } from 'antd'

const { Title, Paragraph, Text } = Typography

/**
 * useEffect 学习页面 —— 演示副作用的几种用法:
 * 1. 不传依赖:每次渲染都执行
 * 2. 传空依赖 []:只在挂载/卸载时执行一次
 * 3. 传依赖 [count]:依赖变化时执行
 * 4. 返回清理函数:卸载时执行
 */
const UseEffect: React.FC = () => {
    const [count, setCount] = useState(0)
    const [name, setName] = useState('张三')
    const [logs, setLogs] = useState<string[]>([])

    // 工具:往日志里追加一条
    const log = (msg: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    // 1. 不传依赖数组 —— 每次渲染都执行
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        log('【示例1】每次渲染都执行 (no deps)')
    })

    // 2. 传空依赖 [] —— 只在挂载时执行一次,卸载时执行清理
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        log('【示例2】挂载时执行一次 (deps: [])')
        return () => {
            log('【示例2】卸载时执行清理 (cleanup)')
        }
    }, [])

    // 3. 传依赖 [count] —— count 变化时才执行
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        log(`【示例3】count 变化时执行, 当前 count=${count} (deps: [count])`)
    }, [count])

    // 4. 传依赖 [name] —— name 变化时才执行
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        log(`【示例4】name 变化时执行, 当前 name=${name} (deps: [name])`)
    }, [name])

    return (
        <Card title="useEffect 学习" style={{ margin: 16 }}>
            <Paragraph>
                <ul>
                    <li>
                        <b>不传依赖</b>:每次渲染都执行副作用
                    </li>
                    <li>
                        <b>传空依赖 []</b>:只在挂载/卸载时各执行一次
                    </li>
                    <li>
                        <b>传依赖 [a, b]</b>:依赖变化时才执行
                    </li>
                    <li>
                        <b>返回函数</b>:在组件卸载或下次副作用前执行清理
                    </li>
                </ul>
            </Paragraph>

            <Title level={5}>触发渲染</Title>
            <Space>
                <Button type="primary" onClick={() => setCount(count + 1)}>
                    count + 1 (当前 {count})
                </Button>
                <Button onClick={() => setName(name === '张三' ? '李四' : '张三')}>
                    切换 name (当前 {name})
                </Button>
            </Space>

            <Title level={5} style={{ marginTop: 24 }}>
                执行日志
            </Title>
            <div
                style={{
                    background: '#fafafa',
                    padding: 16,
                    borderRadius: 8,
                    maxHeight: 300,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: 13,
                }}
            >
                {logs.length === 0 ? (
                    <Text type="secondary">(暂无日志,试着点上方按钮)</Text>
                ) : (
                    logs.map((l, i) => (
                        <div key={i}>
                            <Tag color="blue">{i + 1}</Tag>
                            {l}
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}

export default UseEffect