---
layout: react
title: redux
date: 2018-07-01 17:37:29
tags: redux
---
# 基本概念
## 1.1 store
store就是保存数据的地方，是一个容器。整个应用只能有一个store
而redux提供==createStore==这个函数，用来生成store
```js
import {createStore} from 'redux'
const store = createStore(fn)
```
createStore接受另一个函数作为参数，返回新的store对象
这个参数通常是reducer

## 1.2 state
==store==对象包含所有数据。==store.getState()==可以拿到当前state的数据
```js
const state = store.getState();
```
redux规定，一个state对应一个view

## 1.3 action
state的变化会导致view的变化，而用户只能接触到view，而action就是view发出的通知，表示state需要改变了。

action是一个对象，其中==type==属性时必须的，用于识别action。
```js
const action={
    type:'ADD_TODO',
    payLoad:'Learn redux'
}
```

可以这样理解，Action描述当前发生的事情。改变State的唯一办法，就是使用action发布事情，并通过dispatch传递到Store。

## 1.4 action creator
通常会用一个函数返回action 这个就叫做action creator（事件创建者）
例如：
```js
const ADD_GUN = '添加枪支'；
export const addGun = () => {
    return { 
        type: ADD_GUN
    };
};
```
## 1.5 store.dispatch()
这个方法是view 发出action 的唯一办法

```js
import {createStore} from 'redux'
const store = createStore();

store.dispatch(addGun())
```
参数通常是action 
## 1.6 reducer
在Store接收到action时，必须给出一个新的state，这样view才会发生改变。而这种计算过程就叫reducer。

```js
const ADD_GUN = '加机关枪';
const REMOVE_GUN = '减机关枪';
// reducer;
export const counter = (state = 0, action) => {
    switch (action.type) {
        case ADD_GUN:
            return state + 1;
        case REMOVE_GUN:
            return state - 1;
        default:
            return 10;
    }
};
```

## 1.7 sotre.subscribe()
用于监听，一旦state发生变化，就会自动执行这个函数

```js

import { createStore } from 'redux';
const store = createStore(reducer);

store.subscribe(listener);
```
只有把（组件的render()或者setState()）放入listen，就会自动渲染

==store.subscribe==方法返回一个函数，调用这个函数就可以解除监听。

```js
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
);

unsubscribe();
```
![image](http://www.ruanyifeng.com/blogimg/asset/2016/bg2016091802.jpg)

# 中间件的概念
通常redux都是同步的，如果需要异步操作就需要用到中间件

# 中间件的用法
```js
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
const store = createStore(counter,
    applyMiddleware(thunk)
);
```
==有的中间件有次序要求，使用前要查一下文档。==

# applyMiddlewares()
它是redux的原生方法，作用是将所有中间件组成一个数组，依次执行。

# 异步操作的基本思路
同步操作只要发出一种 Action 即可，异步操作的差别是它要发出三种 Action。
- 操作发起时的action
- 操作成功时的action
- 操作失败时的action

```js
export const addGunAsync = () => {
    return dispatch => {
        dispatch({ type: 'Fetching' })
        setTimeout(() => {
            dispatch(addGun())
        }, 5000)
    }
}
```