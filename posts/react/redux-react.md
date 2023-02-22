<!-- ---
layout: react
title: redux-react
date: 2018-07-01 17:38:36
tags: redux
---

# 拆分

react-redux 将所有组件分成 2 类：UI 组件，容器组件，

1. UI 组件是无逻辑通过参数(props)渲染的组件
2. 容器组件就是用于传递参数、数据

==React-Redux 规定，所有的 UI 组件都由用户提供，容器组件则是由 React-Redux 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。==

# 1.connect

用于从 UI 组件生成容器组件。

```js
import { connect } from 'react-redux'
const VisibleTodoList = connect()(TodoList)
```

TodoList 是 UI 组件，VisibleTodoList 就是由 connect 方法自助生成的容器组件。

connect 方法的完整 API：

```js
import { connect } from 'react-redux'

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
```

有两个参数：mapStateToProps 和 mapDispatchToProps。前者负责输入逻辑，就是将 state 映射到 UI 组件的 props，后者负责输出逻辑，也就是 action。

## 1.1mapStateToProps()

作为函数，执行后返回的是一个对象，对象里的每一个键值对就是一个映射。

```js
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter((t) => t.completed)
    case 'SHOW_ACTIVED':
      return todos.filter((t) => !t.completed)
    default:
      throw new Error(`Unkown filter:${filter}`)
  }
}
const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  }
}
```

mapStateToProps 会订阅 Store，每当 state 更新的时候，就会自动执行，重新渲染。

mapStateToProps 有两个参数（state，ownProps）

使用 ownProps 作为参数后，如果容器组件的参数发生变化，也会引发 UI 组件重新渲染。

connect 方法可以省略 mapStateToProps 参数，那样的话，UI 组件就不会订阅 Store，就是说 Store 的更新不会引起 UI 组件的更新。

## 1.2 mapDispatchToProps()

用于建立 UI 组件的参数到 Store.dispatch 方法的映射。可以是函数或者对象。

如果是函数，会得到两个参数 dispatch 和 ownProps 两个参数

```js
const mapDispatchToProps = (
  disptach,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch({
        type: '123',
        filter: ownProps.filter
      })
    }
  }
}
```

如果是对象的话，每个键值对都是函数。

# 2. <Provider>组件

connect 用于生成容器组件，而 provider 则能让 UI 组件拿到数据。

```js
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers'
import App from './components/App'

// 生成Store
let store = createStore(todoApp)

render(
  //传入数据(Store) 那么APP的子组件都是通过this.props获取到数据Ï
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

# 3. 用装饰器的方式写 connect

首先需要 babel 插件：==babel-plugin-transform-decorators-legacy==

```
npm i babel-plugin-transform-decorators-legacy --s
```

在文件中如下使用

```js
import {connect} from 'react-redux'

@connect(
	// 你要state什么属性放到props里
	// 也就是mapStateToProps()
	state=>({num:state.counter}),
	// 你要什么方法，放到props里，自动dispatch
	// 也就是mapDispatchToProps()
	{ addGun, removeGun, addGunAsync }
)
``` -->
