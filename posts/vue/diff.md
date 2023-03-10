---
layout: vue
title: 简析vue的diff算法
date: 2020-06-21 22:18:40
tags: vue
---

# 前言

重新回归一周一篇博文！这次先把 vue 的 diff 算法搞一波。

# Virtual DOM

当数据发生变化时，vue 内部则会负责把相应的 DOM 去更新，而直接操作 DOM 的代价是昂贵的，特别是当所需操作的 DOM 数量比较多时，不仅会引起整个 DOM 树的重绘和回流，
而且优化起来很繁琐、困难。所以 Virtual DOM 就应运而生了。

Virtual DOM 通俗点讲就是用一个 js 对象去描述一个 DOM 节点，类似如下伪代码：

```html
<div class="test">
  <p>123</p>
</div>
```

```js
var vnode = {
  tag: 'div',
  className: 'test',
  children: [
    {
      tag: 'p',
      text: '123'
    }
  ]
}
```

# Vue.js 中的 虚拟节点优势是什么？

- **保证性能下限**：框架的虚拟需要适配任何上层 API 可能产生的操作，它的一些 DOM 操作的实现必须是普适的，所有它的性能并不是最优的；但是比起粗暴的 DOM 操作性能要好很多，因此框架的虚拟 DOM 至少可以保证在你不需要手动优化的情况下，依然可以提供还不错的性能，即保证性能的下限。
- **无需手动操作 DOM**：我们只需要写好 View-Model 的代码逻辑，框架会根据虚拟 DOM 和数据双向绑定，帮我们以可预期的方式更新视图，极大提高了开发效率。
- **跨平台**：虚拟 DOM 本质上是 JS 对象，而 DOM 与平台强相关，相比之下虚拟 dom 可以进行更方便地跨平台操作，例如 ssr，weex 开发。

# 分析 diff

## 复杂度

![复杂图图示](https://s1.ax1x.com/2020/06/21/N80dyD.png)

在 diff 算法中 对于需要相比较的节点都是属于同一层的，不会跨层级去对比所以其复杂度为线性增长的 O(n)。

## 源码分析

![思维导图](https://s1.ax1x.com/2020/06/22/NYN2WV.png)

当数据发生变化时，会出发渲染**Watcher**的回调函数，进而执行更新过程，以下展示核心代码部分代码省略：

```js
return function patch(oldVnode, vnode, hydrating, removeOnly) {
  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    // 当没有旧节点时也就时创建根节点，也就不存在diff可言
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else {
    const isRealElement = isDef(oldVnode.nodeType)
    // sameVnode函数用来判断两个virtualDom是否值得更深一步比较
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
    } else {
      // 如果不值得比较，则直接创建新节点去替换旧节点
      // replacing existing element
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)

      // create new node
      createElm(
        vnode,
        insertedVnodeQueue,
        // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )
    }
  }
}
```

### 判断是否值得比较

在不是首次渲染的情况下会调用**sameVnode**函数判断两个节点是否值得比较。

```js
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) && a.asyncFactory === b.asyncFactory && isUndef(b.asyncFactory.error)))
  )
}
```

1. 首先判断节点的 key，如果不同则不需要再深入比较了，这也延伸到另一个面试题：key 值的作用。
2. 同步组件判断两个节点的 **tag**、**isComment**、**data**等值是否相同。
3. 异步组件则判断其异步工厂函数**asyncFactory**是否相同。

判断后则分为两种逻辑执行：

1. 新旧节点不值得深入比较。
2. 新旧节点值得深入比较。

### 新旧节点不值得深入比较

当新旧节点不值得深入比较时则说明新旧节点从第一层开始就完全改变了，所以后续逻辑也就时创建新的节点把旧节点替换掉。

这时候就会执行 patch 的以下逻辑：

1. 以旧节点为参考节点，创建新的节点，并插入到 DOM 中。

```js
const oldElm = oldVnode.elm
const parentElm = nodeOps.parentNode(oldElm)
// create new node
createElm(
  vnode,
  insertedVnodeQueue,
  // extremely rare edge case: do not insert if old element is in a
  // leaving transition. Only happens when combining  transition +
  // keep-alive + HOCs. (#4590)
  oldElm._leaveCb ? null : parentElm,
  nodeOps.nextSibling(oldElm)
)
```

2. 然后把旧节点从 DOM 树中删除。

```js
// destroy old node
if (isDef(parentElm)) {
  removeVnodes(parentElm, [oldVnode], 0, 0)
} else if (isDef(oldVnode.tag)) {
  invokeDestroyHook(oldVnode)
}
```

### 新旧节点值得深入比较

另外一种情况的逻辑则是相对稍微复杂一点。

核心逻辑代码如下：

```js
const oldCh = oldVnode.children
const ch = vnode.children

if (isUndef(vnode.text)) {
  if (isDef(oldCh) && isDef(ch)) {
    if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
  } else if (isDef(ch)) {
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(ch)
    }
    if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
  } else if (isDef(oldCh)) {
    removeVnodes(oldCh, 0, oldCh.length - 1)
  } else if (isDef(oldVnode.text)) {
    nodeOps.setTextContent(elm, '')
  }
} else if (oldVnode.text !== vnode.text) {
  nodeOps.setTextContent(elm, vnode.text)
}
```

判断逻辑如下：

1. 如果**vnode**不是文本节点时。
   - **oldCh**和**ch**都存在且不相同时，使用**updateChildren**函数更新子节点。
   - 如果只有**ch**存在，表示旧节点不需要了，如果不是生产环境的话会用**checkDuplicateKeys**检查重复 key。如果旧节点是文本节点则先把节点的文本清除，然后通过**addVnodes**将**ch**批量插入到新节点的**elm**下。
   - 如果只有**oldCh**存在，表示更新的时空节点，则需要将旧的节点通过**removeVnodes**全部清除
   - 当旧节点时文本节点时，则清除其节点文本内容。
2. 如果**vnode**是个文本节点且新旧文本不相同，则直接替换文本内容。

### updateChildren

**updateChildren**是我个人觉得整个 diff 中较为难理解的部分

首先源码如下，长且难理解，我也是通过看视频并且逐步调试才理解的：

```js
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // removeOnly is a special flag used only by <transition-group>
  // to ensure removed elements stay in correct relative positions
  // during leaving transitions
  const canMove = !removeOnly

  if (process.env.NODE_ENV !== 'production') {
    checkDuplicateKeys(newCh)
  }

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      if (isUndef(idxInOld)) {
        // New element
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
      } else {
        vnodeToMove = oldCh[idxInOld]
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
          oldCh[idxInOld] = undefined
          canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          // same key but different element. treat as new element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(oldCh, oldStartIdx, oldEndIdx)
  }
}
```

首先整个**updateChildren**的大致思路如下

1. 声明了新旧节点列表的开始、结束节点和其下标

2. 新旧节点列表的开始和结束节点两两对比共有四组对比方式
   - 旧开始&新开始
   - 旧结束&新结束
   - 旧开始&新结束
   - 旧结束&新开始
3. 如果 4 种比较都没匹配，如果设置了 key，就会用 key 进行比较

在每次比较后下标都会向中间移动，而且是递归执行和新旧节点对比后就会进行 dom 操作。一旦开始的下标大于结束下标则说明至少有一组节点列表对比结束
