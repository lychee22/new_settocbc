# React学习每日任务清单

> 目标：3-4周内达到React面试水平
> 当前水平：5分（会jQuery，不熟React）
> 每天可用：工作日6-8小时，周末3小时
> 原则：每天按清单做完打勾，不追求完美追求推进

---

## 第1周：React基础 + JS补强

### Day 1 | React入门 + JSX + Props/State

**学习目标**：理解React是什么，能写第一个组件

**任务清单**：
- [ ] 看B站React入门视频第1-2集（搜"React入门 2024"）
- [ ] 理解3个关键词：组件化、虚拟DOM、单向数据流
- [ ] 学习JSX语法：
  - className代替class
  - {}包裹JS表达式
  - 只能有一个根元素
- [ ] 学习函数组件写法
- [ ] 学习Props（父传子，只读）
- [ ] 学习State（useState Hook）

**实战代码**（在你的React项目App.jsx里写）：

```jsx
import { useState } from 'react';

// Props示例
function Welcome({ name }) {
  return <h1>你好，{name}</h1>;
}

// State示例
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>当前数字：{count}</p>
      <button onClick={() => setCount(count + 1)}>加1</button>
      <button onClick={() => setCount(count - 1)}>减1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Welcome name="张三" />
      <Counter />
    </div>
  );
}

export default App;
```

**今日验收**（自己答一遍）：
1. React组件怎么写？

   ```
   函数组件
   const Count:React.FC = (props)=>{
   	retrun <></>
   }
   export default Count;
   
   export function CountFunction() {
   	return <></>
   }
   类组件
   class CountComponent extends React.Component {
   	render(){
   		return <></>
   	}
   }
   ```

   > 衍生知识：创建方法的写法 函数声明、表达式（匿名命名）、箭头函数、对象方法、类方法、构造函数

2. Props和State的区别？

   ```
   Props是父子通信的方法之一，在组件方法里传递，只读，只能由父传子。
   state是可变状态，state是管理组件自己内部数据的。
   
   props适用于：展示数据、配置组件、回调函数、父子传递数据。
   state适用于：UI隐藏、数据缓存、组件内部计算值、定时器/动画。
   ```

3. useState返回什么？

   ```
   const [state, setState] = useState(initialValue);
   是当前快照值
   ```

   

4. 能不能写一个显示"你好，XXX"的组件？  √

**算法**：[ ] LeetCode第1题 Two Sum     √

---

### Day 2 | useEffect + 组件通信

**学习目标**：掌握副作用Hook，掌握父子组件通信

**任务清单**：
- [ ] 学习useEffect的三种用法：
  - 不传依赖数组（每次渲染都执行）
  - 传空数组[]（只执行一次，相当于componentDidMount）
  - 传依赖数组[a, b]（依赖变化时执行）
- [ ] 学习组件通信：
  - 父传子：Props
  - 子传父：回调函数
  - 兄弟通信：状态提升
- [ ] 学习条件渲染（&&、三元运算符）
- [ ] 学习列表渲染（map + key）

**实战代码**：
```jsx
import { useState, useEffect } from 'react';

// useEffect示例：模拟数据请求
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      setUser({ name: '张三', age: 25 });
    }, 1000);
  }, []); // 空数组 = 只执行一次

  return (
    <div>
      {user ? <p>{user.name}, {user.age}岁</p> : <p>加载中...</p>}
    </div>
  );
}

// 父子通信示例
function Parent() {
  const [message, setMessage] = useState('');
  return <Child onSend={(msg) => setMessage(msg)} message={message} />;
}

function Child({ onSend, message }) {
  return (
    <div>
      <button onClick={() => onSend('来自子组件')}>发送</button>
      <p>收到：{message}</p>
    </div>
  );
}
```

**今日验收**：
1. useEffect第二个参数有哪几种？分别什么效果？
2. 父组件怎么调子组件的方法？
3. 为什么列表要加key？

**算法**：[ ] LeetCode第26题 删除有序数组中的重复项

---

### Day 3 | Hooks进阶

**学习目标**：掌握useRef、useMemo、useCallback

**任务清单**：
- [ ] 学习useRef：保存可变值不触发渲染，访问DOM
- [ ] 学习useMemo：缓存计算结果
- [ ] 学习useCallback：缓存函数
- [ ] 理解useMemo和useCallback的区别
- [ ] 学习自定义Hook

**实战代码**：
```jsx
import { useState, useRef, useMemo, useCallback } from 'react';

function Demo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  // useMemo缓存计算结果
  const doubleCount = useMemo(() => count * 2, [count]);

  // useCallback缓存函数
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // useRef访问DOM
  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <p>数字：{count}, 双倍：{doubleCount}</p>
      <button onClick={handleClick}>+1</button>
      <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} />
      <button onClick={focusInput}>聚焦输入框</button>
    </div>
  );
}
```

**今日验收**：
1. useRef和useState的区别？
2. useMemo和useCallback的区别？
3. 什么时候该用useMemo？

**算法**：[ ] LeetCode第14题 最长公共前缀

---

### Day 4 | JS ES6+ 重点补强

**学习目标**：补上现代JS基础

**任务清单**：
- [ ] let/const/var区别
- [ ] 箭头函数（this指向）
- [ ] 解构赋值（对象、数组）
- [ ] 模板字符串
- [ ] 扩展运算符（...）
- [ ] Promise（3种状态、链式调用）
- [ ] async/await
- [ ] 数组方法：map、filter、reduce、forEach、find、some、every

**重点面试题**：
```javascript
// 1. 输出什么？
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 答案：3 3 3（var没有块级作用域）

// 2. 改成let呢？
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 答案：0 1 2

// 3. 数组去重
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]
```

**今日验收**：
1. 箭头函数和普通函数的this区别？
2. Promise的三种状态？
3. map和forEach的区别？

**算法**：[ ] LeetCode第20题 有效的括号

---

### Day 5 | 综合实战：TODO List

**学习目标**：用React做一个完整小项目

**任务清单**：
- [ ] 用React实现一个TODO List
- [ ] 功能要求：
  - 添加待办事项
  - 标记完成/未完成
  - 删除待办
  - 筛选全部/未完成/已完成
- [ ] 用useState管理状态
- [ ] 用map渲染列表
- [ ] 加入localStorage持久化（进阶）

**验收标准**：
- 能独立写出这个项目，不看教程
- 代码能跑起来
- 理解每一行为什么这么写

**算法**：[ ] LeetCode第21题 合并两个有序链表

---

### Day 6-7 | 第一周复盘 + 开始面经

**任务清单**：
- [ ] 整理Day 1-5的所有知识点，用自己的话写一遍笔记
- [ ] 看React面经：
  - useState和useRef区别
  - useEffect依赖项
  - Props和State区别
  - 组件通信方式
- [ ] 整理简历A（前端方向）初稿
- [ ] 刷本周算法复盘（10道左右）

**验收标准**：
- 能脱稿说出React核心概念
- 简历初稿成型
- 算法刷了10道以上

---

## 第2周：React进阶 + TS入门

### Day 8 | React进阶概念

**任务清单**：
- [ ] Virtual DOM原理
- [ ] Diff算法
- [ ] Fiber架构
- [ ] 合成事件
- [ ] React.memo、useMemo、useCallback性能优化
- [ ] 生命周期（类组件，了解即可）

**算法**：[ ] LeetCode第28题 实现strStr

---

### Day 9 | 状态管理

**任务清单**：
- [ ] Context API + useContext
- [ ] useReducer
- [ ] Redux概念（Action/Reducer/Store）
- [ ] Zustand（轻量状态管理）

**算法**：[ ] LeetCode第35题 搜索插入位置

---

### Day 10 | TypeScript基础

**任务清单**：
- [ ] 基础类型：string、number、boolean、数组、元组
- [ ] interface接口
- [ ] type类型别名
- [ ] 泛型基础
- [ ] 联合类型、交叉类型
- [ ] 给React组件加类型（FC、Props类型）

**实战代码**：
```tsx
interface UserProps {
  name: string;
  age: number;
  isActive?: boolean; // 可选
}

const User: React.FC<UserProps> = ({ name, age, isActive = true }) => {
  return <div>{name}, {age}, {isActive ? '活跃' : '非活跃'}</div>;
};
```

**算法**：[ ] LeetCode第53题 最大子序和

---

### Day 11 | 打包部署 + 工程化

**任务清单**：
- [ ] Vite基础（比CRA快，现代项目首选）
- [ ] 知道webpack在干什么（不需要精通）
- [ ] npm/yarn/pnpm包管理
- [ ] ESLint + Prettier（代码规范）
- [ ] Git基础（你已经会）

**算法**：[ ] LeetCode第58题 最后一个单词的长度

---

### Day 12 | React Router + 实战

**任务清单**：
- [ ] React Router v6基础
- [ ] 路由配置（Routes、Route、Link）
- [ ] 路由参数（useParams、useSearchParams）
- [ ] 嵌套路由

**实战**：给TODO List加上路由（首页/关于页）

**算法**：[ ] LeetCode第66题 加一

---

### Day 13-14 | 第二周复盘 + 投简历试水

**任务清单**：
- [ ] 整理第2周所有知识点
- [ ] 完善简历A
- [ ] **开始投简历**（投3-5家试试水）
- [ ] 看面经：Virtual DOM、Diff、合成事件、性能优化
- [ ] 刷算法复盘

**验收标准**：
- 简历A完成，可以投递
- 算法累计20道以上
- 能答出70%的React八股文

---

## 第3周：项目 + 大量投递

### Day 15-17 | 做一个完整项目

**任务清单**：
- [ ] 选一个项目做（推荐）：
  - 天气查询APP（调API）
  - 个人博客
  - 记账本
- [ ] 用React + TS + React Router
- [ ] 放到GitHub上
- [ ] 写README

**目的**：简历上有东西可讲

---

### Day 18-21 | 大量投递 + 面试

**任务清单**：
- [ ] 每天投5-10家
- [ ] 有面试就准备面试
- [ ] 面试完复盘
- [ ] 不会的回来补

**投递平台**：
- BOSS直聘、拉勾、智联
- 目标：每周投20家以上

---

## 第4周：冲刺 + 面试

- 每天继续刷算法、刷面经
- 边面边补
- 根据反馈调整简历
- 如果投20家无面试 → 启动OD保底

---

## 算法刷题进度追踪

| 日期 | 题目 | 难度 | 状态 |
|---|---|---|---|
| Day 1 | Two Sum | Easy | ⬜ |
| Day 2 | 删除有序数组重复项 | Easy | ⬜ |
| Day 3 | 最长公共前缀 | Easy | ⬜ |
| Day 4 | 有效的括号 | Easy | ⬜ |
| Day 5 | 合并两个有序链表 | Easy | ⬜ |
| Day 8 | 实现strStr | Easy | ⬜ |
| Day 9 | 搜索插入位置 | Easy | ⬜ |
| Day 10 | 最大子序和 | Easy | ⬜ |
| Day 11 | 最后一个单词长度 | Easy | ⬜ |
| Day 12 | 加一 | Easy | ⬜ |

---

## 每周复盘模板

每周末问自己：
```
1. 这周学了哪些React知识点？能用自己的话说出来吗？
2. 刷了几道算法题？
3. 投了几家简历？有没有面试邀约？
4. 面试中哪道题不会？下周怎么补？
5. 离"能面试"还有多远？（0-100%）
```
