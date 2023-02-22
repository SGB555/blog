---
title: 观察者模式 vs 订阅-发布模式
date: 2020-04-29 15:33:57
tags: ['JS', '设计模式']
---

# 前言

最近在复习面试题，还是熟悉的 vue 响应式原理题目，翻看到的文章都是描述为数据劫持+观察者模式又称发布-订阅模式，但是无意间了解到观察者模式和发布-订阅模式两者并不相同，就引起了我的探究。

# 观察者模式

## 概念

**观察者模式**在软件设计中是一个对象，维护一个依赖列表，当任何状态发生改变自动通知它们。

这是来自[维基百科](https://zh.wikipedia.org/wiki/%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F)的定义

> 观察者模式定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个目标对象，当这个目标对象的状态发生变化时，会通知所有观察者对象，使它们能够自动更新。

简单来说，观察者模式就是，一个对象（被观察者）的状态发生改变时，会通知所有依赖它的对象（观察者），这两者是关联的。

![](https://s1.ax1x.com/2020/04/29/J7EOv8.png)

## 代码实现

可想而知发布者应该拥有收集订阅者、移除订阅者、通知订阅者等基本功能。

```js
// 定义发布者类
class Publisher {
  constructor() {
    this.observers = []
    console.log('Publisher created')
  }
  // 增加订阅者
  add(observer) {
    console.log('Publisher.add invoked')
    this.observers.push(observer)
  }
  // 移除订阅者
  remove(observer) {
    console.log('Publisher.remove invoked')
    const index = this.observers.findIndex((item) => item === observer)
    this.observers.splice(index, 1)
  }
  notify() {
    console.log('Publisher.notify invoked')
    this.observers.forEach((observer) => {
      observer.update(this)
    })
  }
}

// 定义订阅者类
class Observer {
  constructor(name) {
    console.log('Observer created')
    this.name = name
  }
  update() {
    console.log('Observer.update invoked')
    console.log(this.name)
  }
}

const publisher = new Publisher()
const observer1 = new Observer('observer1')
const observer2 = new Observer('observer2')

publisher.add(observer1)
publisher.add(observer2)
publisher.notify()
```

# 发布-订阅模式

## 概念

在软件架构中，**发布-订阅**是一种消息范式，消息的发送者（称为发布者）不会将消息直接发送给特定的接收者（称为订阅者）。而是将发布的消息分为不同的类别，无需了解哪些订阅者（如果有的话）可能存在。同样的，订阅者可以表达对一个或多个类别的兴趣，只接收感兴趣的消息，无需了解哪些发布者（如果有的话）存在。

[参考资料](https://zh.wikipedia.org/wiki/%E5%8F%91%E5%B8%83/%E8%AE%A2%E9%98%85)

![](https://s1.ax1x.com/2020/05/02/Jvad8e.png)

## 代码实现

```js
// 定义发布者类
class Publisher {
  constructor() {
    this.topics = {}
    console.log('Publisher created')
  }
  // 订阅事件
  subscribe(type, fn) {
    console.log('Publisher.subscribe invoked')
    if (!this.topics[type]) {
      this.topics[type] = []
    }
    this.topics[type].push(fn)
  }
  // 推送事件
  publish(type, ...args) {
    if (!this.topics[type]) {
      return
    }
    this.topics[type].forEach((fn) => {
      fn(...args)
    })
  }
}

class Subscriber {
  constructor(type) {
    this.type = type
  }
}

const publisher = new Publisher()
const subscribe = new Subscriber('log')

publisher.subscribe(subscribe.type, (string) => {
  console.log(string)
})
publisher.publish('log', 'string')
```

# 两者区别

![](https://s1.ax1x.com/2020/05/03/Jze1xS.png)

![](https://s1.ax1x.com/2020/05/03/JzupUs.png)

- 最直观的，观察者模式中 Subject（发布者）是和 Observer（订阅者）直接相关、相互依赖的。而发布-订阅模式则是多了一层「中间商」——事件中心，发布者并不关心订阅者，而是通过一定事件去通知，反之亦然，订阅者只需要关心事件即可。

- 观察者模式中，被观察者发布通知，所有观察者都会收到通知。发布-订阅模式中，发布者发布通知，只有特定类型的订阅者会收到通知。

以下节选自掘金小册《[JavaScript 设计模式核⼼原理与应⽤实践](https://juejin.im/book/5c70fc83518825428d7f9dfb)》

> 大家思考一下：为什么要有观察者模式？观察者模式，解决的其实是模块间的耦合问题，有它在，即便是两个分离的、毫不相关的模块，也可以实现数据通信。但观察者模式仅仅是减少了耦合，并没有完全地解决耦合问题——被观察者必须去维护一套观察者的集合，这些观察者必须实现统一的方法供被观察者调用，两者之间还是有着说不清、道不明的关系。

> 而发布-订阅模式，则是快刀斩乱麻了——发布者完全不用感知订阅者，不用关心它怎么实现回调方法，事件的注册和触发都发生在独立于双方的第三方平台（事件总线）上。发布-订阅模式下，实现了完全地解耦。

> 但这并不意味着，发布-订阅模式就比观察者模式“高级”。在实际开发中，我们的模块解耦诉求并非总是需要它们完全解耦。如果两个模块之间本身存在关联，且这种关联是稳定的、必要的，那么我们使用观察者模式就足够了。而在模块与模块之间独立性较强、且没有必要单纯为了数据通信而强行为两者制造依赖的情况下，我们往往会倾向于使用发布-订阅模式。

# 回顾前言

既然本文是因 vue 源码而起，所以最后还是得回顾前言

![](https://s1.ax1x.com/2020/05/03/JzKQoj.png)

> 在 Vue 中，每个组件实例都有相应的 watcher 实例对象，它会在组件渲染的过程中把属性记录为依赖，之后当依赖项的 setter 被调用时，会通知 watcher 重新计算，从而致使它关联的组件得以更新——这是一个典型的观察者模式。

在 Vue 数据双向绑定的实现逻辑里，有这样三个关键角色：

- observer（监听器）：注意，此 observer 非彼 observer。在我们上节的解析中，observer 作为设计模式中的一个角色，代表“订阅者”。但在 Vue 数据双向绑定的角色结构里，所谓的 observer 不仅是一个数据监听器，它还需要对监听到的数据进行转发——也就是说它同时还是一个发布者。
- watcher（订阅者）：observer 把数据转发给了真正的订阅者——watcher 对象。watcher 接收到新的数据后，会去更新视图。
- compile（编译器）：MVVM 框架特有的角色，负责对每个节点元素指令进行扫描和解析，指令的数据初始化、订阅者的创建这些“杂活”也归它管~
  这三者的配合过程如图所示：

![](https://s1.ax1x.com/2020/05/03/JzKYlV.png)

## 结合代码来看

```ts
// vue/src/core/observer/dep.js
class Dep {
  static target: ?Watcher
  id: number
  subs: Array<Watcher>

  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub)
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// vue/src/core/observer/index/js
// 省略部分代码
export function defineReactive(obj: Object, key: string, val: any, customSetter?: ?Function, shallow?: boolean) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend() // 收集依赖也是增加订阅者
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify() // 通知订阅者
    }
  })
}
```
