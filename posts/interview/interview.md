---
title: 面试题集
date: 2020-03-16 23:22:04
tags: interview
---

# CSS

## 了解 Flex 布局么？平常有使用 Flex 进行布局么？

- 采用 flex 布局的元素，成为 flex 容器（flex container），其自元素自动成为容器成员（flex item）

- 容器默认存在两根轴：水平的主轴（main axis），垂直的交叉轴（cross axis）

- 个人常用：flex-direction justify-content align-item

- flex 属性是 flex-grow, flex-shrink 和 flex-basis 的简写，默认值为 0 1 auto。后两个属性可选。

## 如何解决浮动中高度塌陷的方案？

### 高度塌陷的原因：

如果块级父元素 height 为 auto 或不设置，没有设置 padding 或 border 属性，且只有块级子元素，那么父元素的默认高度将由子元素的盒模型决定，从最高块级子元素的外边框边界到最低块级子元素的外边框边界之间的距离（注意不包含子元素的的外边距 margin 值，当子元素设置为浮动时会脱离文档流，而父元素若没有其他未设置浮动的子元素则会出现高度崩塌

### 解决方案：

#### 清除浮动

##### 清除浮动的原理：

**CSS2.1** 引入了**清除区域**的概念，清除区域是在元素上外边距之上增加的额外间隔（确保浮动元素不会与该元素重叠），不允许浮动元素进入这个范围，意味着设置 clear 属性的元素的外边距并不改变，之所以该元素会向下移动是因为清除区域造成的。

##### 解决方案 1:追加元素并设置**clear**属性。

- 优势：简单，布局灵活，浏览器兼容性好
- 弊端：添加了不必要的 dom

如果父元素高度塌陷，则可以通过在父元素的尾部追加空的子元素，并利用**clear:both**解决塌陷问题。

##### 解决方案 2:使用 CSS 样式插入元素

- 优势：不破坏文档结构，没有副作用
- 弊端：使用 display:block 会使父子元素的垂直外边距重叠

原理其实和追加元素并设置 clear 属性相同，只是使用 css 样式来处理。

```css
.clearfix:after {
  content: '';
  display: block;
  clear: both;
}
```

#### 包含浮动：

##### 包含浮动的原理：

包含浮动即用 BFC 的特性来包含浮动从而解决父元素高度崩塌的问题

##### 什么是 BFC

BFC(Block formatting context)直译为"块级格式化上下文"。它是一个独立的渲染区域，只有 Block-level box 参与， 它规定了内部的 Block-level Box 如何布局，并且与这个区域外部毫不相干。

block-level box:display 属性为 block, list-item, table 的元素，会生成 block-level box。并且参与 block fomatting context；

##### BFC 特性

- BFC 会阻止垂直外边距（margin-top、margin-bottom）折叠（属于同一个 BFC 的两个相邻 Box 的 margin 会发生重叠 ）

- BFC 不会重叠浮动元素

- BFC 可以包含浮动（计算 BFC 的高度时，浮动元素的高度也参与计算 ，可以利用 BFC 的这个特性来“清浮动”，应该说包含浮动。也就是说只要父容器形成 BFC 就可以）

需要注意的是**根元素本身就能触发一个 BFC**，事实上除了根元素以外以下的方式也能触发 BFC

- float （left，right）
- overflow 除了 visible 以外的值（hidden，auto，scroll）
- display (table-cell，table-caption，inline-block)
- position（absolute，fixed）

## 说说 CSS 选择器以及这些选择器的优先级

- !important
- 内联选择器（1000）
- ID 选择器（0100）
- 类选择器/属性选择器/伪类选择器（0010）
- 元素选择器/关系选择器/伪元素选择器（0001）
- 通配符选择器（0000）

**需要注意的是逻辑伪类整个选择器语句的优先级是由括号里面内容决定的，不同的逻辑伪类规则不一样，其中:not()伪类的本身没有优先级，最终优先级是由括号里面的选择器决定的。**

## 了解盒模型么

- 标准盒子模型：box-sizing: content-box（W3C 盒子模型）：元素的宽高大小表现为内容的大小。

- 怪异盒子模型：box-sizing: border-box（IE 盒子模型）：元素的宽高表现为内容 + 内边距 + 边框的大小。背景会延伸到边框的外沿。

## 伪类和伪元素的区别

### 概念区别

伪类操作的是 dom 树上已存在的元素，而伪元素则是创建一个 dom 树外的元素。因此，伪类和伪元素的区别在于：**有没有创建 dom 树之外的元素**

### 使用区别

伪类要求使用单冒号(:)，比如:link、:visited、:hover、:active;
伪元素要求使用双冒号(::)，比如::before、::after

## 布局问题

[布局问题](http://pok888.gitee.io/blog/2020/03/17/css/layout/)

## 如何异步加载 CSS

### JS 动态创建 link 元素

第一种方式是使用 JavaScript 动态创建样式表 link 元素，并插入到 DOM 中

```js
// 创建link标签
const myCSS = document.createElement('link')
myCSS.rel = 'stylesheet'
myCSS.href = 'mystyles.css'
// 插入到header的最后位置
document.head.insertBefore(myCSS, document.head.childNodes[document.head.childNodes.length - 1].nextSibling)
```

### link 元素的 media 属性设置

第二种方式就是将 link 元素的 meida 属性设置为用户浏览器不匹配的媒体类型（或媒体查询），如**meida='print'**。对浏览器来说，如果样式表不适用于当前媒体类型，其优先级会被放低，会在不阻塞页面渲染的情况下再进行下载。

### rel='preload'

```html
<link rel="preload" href="mystyles.css" as="style" onload="this.rel='stylesheet'" />
```

注意，as 是必须的。忽略 as 属性，或者错误的 as 属性会使 preload 等同于 XHR 请求，浏览器不知道加载的是什么内容，因此此类资源加载优先级会非常低。

看起来，rel="preload" 的用法和上面两种没什么区别，都是通过更改某些属性，使得浏览器异步加载 CSS 文件但不解析，直到加载完成并将修改还原，然后开始解析。
但是它们之间其实有一个很重要的不同点，那就是使用 preload，比使用不匹配的 media 方法能够更早地开始加载 CSS。所以尽管这一标准的支持度还不完善，仍建议优先使用该方法。

## CSS 选择器的解析顺序是什么，为什么。

### 解析顺序

css 选择器的解析顺序是从右往左的

### 为什么

因为从右往左的解析顺序可以减少选择器匹配的次数。

dom 树和 css 会合成为 render 树，这个操作实际上就是是需要将 css 附着到 dom 树上，因此需要根据选择器提供的信息对 dom 树进行遍历，才能将样式成功附着到对应的 dom 元素上。

当 dom 树比较复杂的时候，可以发现从右到左解析能够有效减少回溯次数提升性能。

## @import

css 样式文件有两种引入方式。一种是**link**元素，另一种这是 **@import**。应当尽量避免使用 **@import**，因为 **@import** 会影响浏览器的并行下载，使得页面在加载的时候增加额外的延迟，增添了额外的往返耗时。而且多个 **@import**可能会导致下载顺序紊乱。比如一个 css 文件 **index.css** 包含了以下内容：**@import url("reset.css")**。那么浏览器就必须先把 **index.css** 下载、解析和执行后，才下载、解析和执行第二个文件 reset.css。简单的解决方法是使用 **link 元素** 替代 **@import**。

## CSS 引入的方式有哪些？link 和@import 的区别是？

### 引入方式

有四种：内联（元素上的 style 属性）、外链（link）、导入（@import）

### link 和@import 的区别

- link 是 XHTML 标签，除了加载 css 外，还可以定义 RSS 等其他事物；@import 属于 css 范畴，只能加载 css。
- link 引用 css 时，在页面载入时同时加载；@import 需要页面网页完全载入以后再加载。
- link 是 XHTML 标签，无兼容问题；@import 是在 CSS2.1 提出的，低版本的浏览器不支持。
- link 支持使用 Javascript 控制 DOM 去改变样式；而@import 不支持。

## CSS 的加载会阻塞 DOM 树解析和渲染吗？为什么？

![](https://s1.ax1x.com/2020/03/29/GVEpWR.png)

1. 从上面这个图上，我们可以看到，浏览器渲染过程如下：
2. 解析 HTML，生成 DOM 树，解析 CSS，生成 CSSOM 树
3. 将 DOM 树和 CSSOM 树结合，生成渲染树(Render Tree)
4. Layout(回流):根据生成的渲染树，进行回流(Layout)，得到节点的几何信息（位置，大小）
5. Painting(重绘):根据渲染树以及回流得到的几何信息，得到节点的绝对像素
6. Display:将像素发送给 GPU，展示在页面上。

所以

- CSS 加载不会影响 DOM 树的解析 因为 DOM 树和 CSS 树是分开生成解析的

- CSS 的加载会阻塞 DOM 树的渲染，因为 CSS 的下载完成后解析成 CSSOM 与 DOM 生成渲染树后，页面才会渲染，绘制出来

## 回流和重绘

回流必将引起重绘，重绘不一定会引起回流

### 回流

当 **Render Tree** 中部分或全部元素的尺寸、结构、或某些属性发生改变时，浏览器重新渲染部分或全部文档的过程称为回流。

### 重绘

当页面中元素样式的改变并不影响它在文档流中的位置时（例如：**color、background-color、visibility**等），浏览器会将新样式赋予给元素并重新绘制它，这个过程称为重绘。

### 如何避免

- 避免使用**table**布局
- 尽可能在**DOM**树的最末端改变**class**
- 避免设置多层内联样式
- 合并多次对 DOM 和样式的修改，然后一次处理掉
- 隐藏元素，应用修改，重新显示即 使元素脱离文档流、对其进行多次修改、将元素带回到文档中
- 将动画效果应用在**position**属性为**absolute**或**fixed**的元素上
- 避免使用**css**表达式（例如：**calc()**）

# JS

## new 调用函数的过程

1. 创建（或者说构造）一个全新的对象
2. 这个对象会被执行 prototype 连接
3. 这个新对象会绑定到函数调用的 this
4. 如果函数没有返回对象，那么 new 表达式中的函数调用会自动返回这个新对象

## 原型/实例

1. 你不知道的 js 中的定义：在几乎所有的对象创建时都会有一个 **prototype** 属性，它是 js 中一个内置的非空默认对象，其实就是对其他对象的引用

2. 在红宝书第三版中的定义：无论什么时候，只要创建了一个新函数，就会根据一组特定的规则为该函数创建一个 **prototype** 属性，这个属性指向函数的原型对象。

3. 在对于访问对象上的属性时，第一步会检查属性本身是否拥有这个属性，否则就会查找对象的原型链。这个过程会持续直到找到匹配的值，如果最后还是没有则返回 **undefined**

4. 在 Chrome、Firefox 中对象还会有 ** \_proto\_ ** 属性指向该对象的父类的原型。

5. 通过构造函数和 new 创建出来的对象，便是实例。 实例通过 ** \_proto\_ ** 指向其构造函数的原型，通过 **constructor** 指向构造函数。

![](https://ftp.bmp.ovh/imgs/2021/04/a5b7c2c7c9e52ccc.png)

![](https://s1.ax1x.com/2020/04/04/G0N1FP.png)

[参考链接](https://juejin.im/post/5835853f570c35005e413b19)

## constructor

实例.constructor 指向其构造函数，实际上.constructor 是在构造函数的 prototype 上的一个属性，而构造函数.prototype.constructor 默认指向其本身。
所以实例.constructor 只是通过默认的 prototype 委托指向 其构造函数，

## 构造函数

在你不知道的 js 中提到：实际上，new 会劫持所有普通函数并且用构造对象的形式来调用它。换句话说，在 js 中对于“构造函数”最准确的解释是，所有带 new 的函数调用。

## 闭包

闭包最常见的形式就是函数嵌套函数了。

- 在**你不知道的 js**中对闭包的定义是：当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。
- 在 **JavaScript 高级程序设计**中对闭包的定义是：闭包是指有权访问另一个函数作用域中的变量的函数。
- 在**MDN**对闭包的定义为：闭包是指那些能够访问自由变量的函数。 （其中自由变量，指在函数中使用的，但既不是函数参数 arguments 也不是函数的局部变量的变量，其实就是另外一个函数作用域中的变量。）

通常在函数的执行完毕后，函数的整个内部作用域都会因垃圾回收机制而被销毁，而拜 内嵌函数 所声明的位置所赐，它拥有涵盖 外部函数 内部作用域的闭包，使得该作用域能够一 直存活，以供 内嵌函数 在之后任何时间进行引用。
内嵌函数 依然持有对该作用域的引用，而这个引用就叫作闭包。

## 赋值和深浅拷贝

- 赋值

  - 直接用 **=** 赋值
    - 基础类型原数据不受影响
    - 引用类型原数据受影响

- 浅拷贝：以赋值的形式拷贝引用对象，但仍然指向同一个地址，修改时原对象也会受到影响。

  - **Object.assign**
  - 拓展运算符
    - 如果引用对象的值是基础类型则原数据不受影响
    - 如果引用对象的值是引用类型则原数据受影响

- 深拷贝：完全拷贝一个新对象，修改时原对象不会受到影响
  - **JSON.parse(JSON.stringify(...))**
    - 不可用于具有循环引用的对象
    - 当值为函数、undefined 或 symbol 时，无法拷贝
  - 递归进行逐一赋值

用递归实现深拷贝的思路就是先判断需要拷贝的值是引用类型还是基础类型。如果是引用类型则进行递归赋值，是基础类型则直接赋值

[参考资料](https://juejin.im/post/59ac1c4ef265da248e75892b)

## 模块化

### CommonJs

在 node13.12 之前的版本都是采用 CommonJs 的规范。目前 npm 模板中使用较多

- 优点：服务器端模块重用，NPM 中模块包多，有将近 20 万个
- 缺点：加载模块是同步的，只有加载完成后才能执行后面的操作，也就是当要用到该模块了，现加载现用，不仅加载速度慢，而且还会导致性能、可用性、调试和跨域访问等问题。Node.js 主要用于服务器编程，加载的模块文件一般都存在本地硬盘，加载起来比较快，不用考虑异步加载的方式，因此,CommonJS 规范比较适用。

### AMD

鉴于浏览器的特殊情况，又出现了一个规范，这个规范呢可以实现异步加载依赖模块，并且会提前加载那就是 AMD 规范。

- 优点：在浏览器环境中异步加载模块；并行加载多个模块
- 缺点：开发成本高，代码阅读和书写比较困难
- 实现：Require.js

### CMD

Common Module Definition 规范和 AMD 很相似，尽量保持简单，并与 CommonJS 和 Node.js 的 Modules 规范保持了很大的兼容性。

- 优点：都用于浏览器编程，依赖就近，延迟执行，可以很容易在 Node.js 中运行

- 缺点：依赖 SPM 打包，模块的加载逻辑偏重；

- 实现：Sea.js

### ES6 module

ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。

### ES6 和 commonjs 的区别

CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。

CommonJS 模块是运行时加载，ES6 模块是编译时输出接口

## 节流和防抖

防抖与节流函数是一种最常用的 高频触发优化方式，能对性能有较大的帮助。

- 防抖：将多次高频率操作优化为只在最后一次执行，通常使用场景是：用户输入，只需执行最后一次输入的回调。

```js
function debounce(fn, wait, immediate) {
  let timeout, reuslt
  return function () {
    let context = this
    let args = arguments
    if (timeout) clearTimeout(timeout)
    if (immediate) {
      let callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) result = fn.apply(context, args)
    } else {
      timeout = setTimeout(() => {
        result = fn.apply(context, args)
      }, wait)
    }
    return result
  }
}
```

- 节流：每隔一段时间后执行一次，也就是降低执行频率，将高频操作优化成低频操作，通常用于：滚动条事件或 resize 事件

```js
function throttle(fn, wait, immediate) {
  let timer = null
  let callNow = immediate

  return function () {
    const context = this
    const args = arguments
    if (callNow) {
      fn.apply(context, args)
      callNow = false
    }

    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args)
        timer = null
      }, wait)
    }
  }
}
```

## 手写 call、apply、bind

### call

ES6 方式

```js
Function.prototype.myCall(context,...args){
    context = context || window; // this 参数可以传 null，当为 null 的时候，视为指向 window
    context.fn = this; // 将函数设为对象的值
    const result = context.fn(...args); // 声明返回结果变量并赋值为函数执行结果
    delete context.fn; // 删除该函数
    return result; // 返回结果
}
```

普通方式

```js
Function.prototype.myCall(context){
    var context = context || window // this 参数可以传 null，当为 null 的时候，视为指向 window
    context.fn = this // 将函数设为对象的值
    // 收集传入参数
    var args = []
    for(var i = 1; var len = arguments.length; i < len; i++){
      args.push('arguments['+i+']')
    }
    var result = eval('contex.fn(' + args + ')') // 利用数组和字符串拼接时会转换成字符串的特效将参数传入
    delete context.fn
    return result
}
```

### apply

ES6 方式

```js
Function.prototype.myApply(context,arr){
    context = context || window;
    context.fn = this;
    let result
    if(!arr){
        result = context.fn()
    } else{
        result = context.fn(...arr)
    }
    delete context.fn;
    return result;
}
```

普通方式

```js
Function.prototype.apply2 = function (context, arr) {
  var context = context || window
  context.fn = this
  var result
  if (!arr) {
    result = context.fn()
  } else {
    var args = []
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push('arr[' + i + ']')
    }
    result = eval('context.fn(' + args + ')')
  }
  delete context.fn
  return result
}
```

### bind

es6

```js
Function.prototype.myBind = function (contex, ...args) {
  const fn = this
  args = args ? args : []
  return function newFn(...newFnArgs) {
    if (this instanceof newFn) {
      return new fn(...args, ...newFnArgs)
    }
    return fn.apply(context, [...args, ...newFnArgs])
  }
}
```

普通方式

```js
Function.prototype.myBind(context){
    if(typeof this !== 'function'){
        throw Error('Function.prototype.bind - what is trying to be bound is not callable')
    }
    var self = this
    // 获取myBind函数从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments,1)

    var fNOP = function (){}
    var fBound = function(){
        // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments)
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs))
    }
    fNOP.prototype = this.prototype
    fBound.prototype = new fNOP()
    return fBound
}
```

## 什么是提升

### 变量提升

```js
console.log(a) // undefined
var a = 2
```

当你看到 var a = 2; 时，可能会认为这是一个声明。
但 JavaScript 实际上会将其看成两个 声明:var a;和 a = 2;。第一个定义声明是在编译阶段进行的。第二个赋值声明会被留在 原地等待执行阶段。

所以执行顺序应该是

```js
var a
console.log(a)
a = 2
```

### 函数提升

```js
foo()
function foo() {
  var a = 2
  console.log(a) // undefined
}
```

函数同样存在提升

```js
foo() // 不是 ReferenceError, 而是 TypeError!
var foo = function bar() {
  // ...
}
```

函数声明会被提升，但是函数表达式却不会被提升。

### 函数优先

函数声明和变量声明都会被提升。但是一个值得注意的细节(这个细节可以出现在有多个
“重复”声明的代码中)是函数会首先被提升，然后才是变量。

### 暂时性死区（Temporal Dead Zone）

与通过 var 声明的有初始化值 undefined 的变量不同，通过 let 声明的变量直到它们的定义被执行时才初始化。在变量初始化前访问该变量会导致 ReferenceError。该变量处在一个**自块顶部到初始化处理的“暂存死区”中**。

## 如何实现继承

### es5 寄生组合继承

```js
function Parent(value) {
  this.value = value
}
Parent.prototype.getValue = function () {
  console.log(this.value)
}
function Child(value) {
  Parent.call(this, value)
}
Child.prototype = Object.create(Parent.prototype, {
  constructor: {
    value: Child, // 实例的constructor指向其构造函数
    enumerable: false,
    writable: true,
    configurable: true
  }
})
const child = new Child(1)

child.getValue() // 1
child instanceof Parent // true
```

### es6 class 组合继承

```js
class Parent {
  constructor(value) {
    this.value = value
  }
  getValue() {
    console.log(this.value)
  }
}
class Child extends Parnet {
  constructor(value) {
    super(value)
  }
}
```

## 实现 add(1,1).add(2,3) // 7

这里一并实现柯里化和链式调用，关键点在于访问函数时会调用其**toString()**方法，以及利用闭包把前一次执行结果保存并计算返回

```js
function add() {
  let args = [...arguments]
  // 这里利用闭包保存传入参数
  let fn = function () {
    args.push(...arguments)
    return fn
  }
  // 改写toString为计算返回值
  fn.toString = function () {
    return args.reduce((a, b) => a + b)
  }
  Object.prototype.add = fn
  return fn
}
```

## EventLoop

### 简单概念回答

JavaScript 是一门单线程非阻塞的语言，所以意味着只有一个主线程去执行任务或者说执行代码。那么任务又分为同步任务和异步任务，在 js 执行同步任务时，会创建上下文，然后将任务入栈，按照先进后出的顺序执行，而当遇到异步任务时就会按照宏任务和微任务的分类分别放入不同的队列。被放入队列后不会立即执行而是等到主线程闲置时，主线程会去查找队列中是否有任务，如果有就按照队列先进先出的顺序放入执行栈，然后执行其中的同步代码，如此反复就形成了一个循环，而这个循环就是事件循环也就是 eventloop。

### 宏任务与微任务

个人理解的执行顺序：

1. 代码从开始执行调用一个全局执行栈，script 标签作为宏任务执行

2. 执行过程中同步代码立即执行，异步代码放到任务队列中，任务队列存放有两种类型的异步任务，宏任务队列，微任务队列。

3. 同步代码执行完毕也就意味着第一个宏任务执行完毕(script)

   - 1 先查看任务队列中的微任务队列是否存在宏任务执行过程中所产生的微任务

     - ​1-1 有的话就将微任务队列中的所有微任务清空
     - 1-2 微任务执行过程中所产生的微任务放到微任务队列中，在此次执行中一并清空

   - 2 如果没有再看看宏任务队列中有没有宏任务，有的话执行，没有的话事件轮询第一波结束

     - ​2-1 执行过程中所产生的微任务放到微任务队列
     - 2-2 完成宏任务之后执行清空微任务队列的代码

# VUE

## 什么是 vue

Vue 是一套用于构建用户界面的渐进式框架。Vue 被设计为可以自底向上逐层应用。是一个不完全遵循 MVVM 的框架。

## v-show 与 v-if 有什么区别

**v-if**是真正的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；也是**惰性的**：如果在初始渲染时条件为假，则什么都不做直到条件第一次为真时才会渲染

**v-show**不管初始条件是什么，元素总是会被渲染，只是简单地基于 css 属性**display**属性进行切换

## vue 的父组件和子组件生命周期钩子函数执行顺序

- 加载渲染过程

  父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted
  -> 父 mounted

- 子组件更新过程

  父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

- 父组件更新过程

  父 beforeUpdate -> 父 updated

- 销毁过程

  父 beforeDestory -> 子 beforeDestory -> 子 destoryed -> 父 destoryed

## computed 和 watch 的区别和运用场景

- 功能上：computed 是计算属性，也就是依赖其它的属性计算所得出最后的值。watch 是去监听一个值的变化，然后执行相对应的函数

- 使用上：computed 中的函数必须要用 return 返回；watch 的回调里面会传入监听属性的新旧值，通过这两个值可以做一些特定的操作，不是必须要用 return

- 性能上：computed 中的函数所依赖的属性没有发生变化，那么调用当前的函数的时候会从缓存中读取，而 watch 在每次监听的值发生变化的时候都会执行回调

- 场景上：computed：当一个属性受多个属性影响的时候，例子：购物车商品结算；watch：当一条数据影响多条数据的时候，例子：搜索框

## Vue.js 源码入口主要做了些什么处理

在 main.js 中实例化 Vue 时，会调用绑定在绑定在 vue 实例上的\_init 方法

```js
function Vue(options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

\_init 方法合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。

## Vue.js 中的数据劫持是怎么实现的？浏览器兼容性呢

核心逻辑是通过 **Object.defineProperty(...)** 去改写数据的 **get/set** 方法

```js
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
        dep.depend()
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
      dep.notify()
    }
  })
}
```

![](https://s1.ax1x.com/2020/05/03/YSkj56.png)

## Vue.js 中的依赖收集是怎么处理的？和闭包有什么关联吗？

### 依赖收集

首先收集依赖的核心是 Observer 类（数据劫持）和 Watcher 类（订阅者）以及 Dep 类（发布者）

1. 在组件 mount 前，会通过实例化 Observer 类进行数据劫持改写数据的**get/set**方法

   this.\_init->initState->initData->observe->实例化 Observer 类->observeArray/walk->defineReactive->改写 get/set

2. 在组件 mount 的时候会实例化 watcher 类，在构造函数中触发相关逻辑去收集依赖

   vm.\$mount->mountComponent->new Watcher->Watcher.prototype.get->pushTarget(Dep.target 赋值为渲染 watcher)->updateComponent->vm.\_update(vm.\_render(), hydrating)

   这个方法会生成 渲染 VNode，并且在这个过程中会对 vm 上的数据访问，这个时候就触发了数据对象的 getter。

> 那么每个对象值的 getter 都持有一个 dep，在触发 getter 的时候会调用 dep.depend() 方法，也就会执行 Dep.target.addDep(this)。刚才我们提到这个时候 Dep.target 已经被赋值为渲染 watcher，那么就执行到 addDep 方法

### 和闭包有什么关联吗

在执行**defineReactive**方法时会实例化一个 Dep 类，而改写**get**方式时对 Dep 的实例 有访问到从而形成了闭包

## Vue.js 中的模版解析需要经历哪几个阶段？

1. parse 解析模板字符串生成 AST

```js
const ast = parse(template.trim(), options)
```

2. optimize 优化语法树、标记静态节点、静态根

```js
optimize(ast, options)
```

3. generate 将最终的 AST 转化为 render 函数字符串

```js
const code = generate(ast, options)
```

## Vue.js 中的 虚拟节点优势是什么？

- **保证性能下限**：框架的虚拟需要适配任何上层 API 可能产生的操作，它的一些 DOM 操作的实现必须是普适的，所有它的性能并不是最优的；但是比起粗暴的 DOM 操作性能要好很多，因此框架的虚拟 DOM 至少可以保证在你不需要手动优化的情况下，依然可以提供还不错的性能，即保证性能的下限
- **无需手动操作 DOM**：我们只需要写好 View-Model 的代码逻辑，框架会根据虚拟 DOM 和数据双向绑定，帮我们以可预期的方式更新视图，极大提高了开发效率
- **跨平台**：虚拟 DOM 本质上是 JS 对象，而 DOM 与平台强相关，相比之下虚拟 dom 可以进行更方便地跨平台操作，例如 ssr，weex 开发

## props、data、compute、watch、methods、created、mounted 的初始化顺序

1. props
2. methods
3. data
4. compute
5. watch
6. created
7. mounted

```js
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```

```js
export function initState(vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe((vm._data = {}), true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

## slot 是什么？有什么作用？原理是什么？

### 是什么

slot 又名插槽，是 Vue 的内容分发机制，组件内部的模板引擎使用 slot 元素作为承载分发内容的出口。插槽 slot 是子组件的一个模板标签元素，而这一个标签元素是否显示，以及怎么显示是由父组件决定的。

### 有什么作用

slot 分三类：默认插槽、具名插槽、作用域插槽

1. 默认插槽：当 slot 没有指定 name 值时的一个默认显示插槽。一个组件内只有一个默认插槽

2. 具名插槽：带有 name 值的插槽，由父元素向 slot 便签传入 name 值来决定显示哪一个具名插槽。一个组件可以有多个具名插槽

3. 作用域插槽：默认插槽、具名插槽的变体，该插槽的不同点在于子组件渲染作用域插槽时，可以将子组件的数据传递给父组件，让父组件根据子组件传递过来的数据决定如何渲染该插槽

### 原理是什么？

首先 vue 的编译阶段需要经过 parse-optimize-codegen 三个阶段。而编译的顺序是先编译父组件，再编译子组件。

#### 具名插槽和匿名匿名插槽

##### 父组件

1. parse 阶段时，会执行 **processSlotContent**方法，当解析到标签上面有**slot**属性时，会给对应的 AST 元素节点添加**slotTarget**属性

```js
const slotTarget = getBindingAttr(el, 'slot')
if (slotTarget) {
  el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
  // preserve slot as an attribute for native shadow DOM compat
  // only for non-scoped slots.
  if (el.tag !== 'template' && !el.slotScope) {
    addAttr(el, 'slot', slotTarget)
  }
}
```

2. 在 codeGen 阶段，会给 data 添加一个 slot 属性，并指向 slotTarget，之后会用到

##### 子组件

1. 在 parse 阶段会执行 **processSlotOutlet**，当遇到**slot**标签时会获取其**name**属性给到对应的 AST 元素节点

```js
function processSlotOutlet(el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
  }
}
```

2. 在 codegen 阶段会执行**genSlot**，**children**则是 slot 标签开始和闭合标签包裹的内容。**\_t** 函数对应的就是 **renderSlot** 方法

```js
const slotName = el.slotName || '"default"'
const children = genChildren(el, state)
let res = `_t(${slotName}${children ? `,${children}` : ''}`
```

实际上，在编译子组件的之前会执行**initRender**

首先，VUE 是使用到了虚拟 DOM 的，那编译成虚拟 DOM 的大致过程有三步，parse 生成 AST，optimize 优化 AST，codeGen 生成虚拟 DOM，而 VUE 内部则是有个 Vnode 类去描述虚拟 DOM 的。那么在其编译过程顺序是先父后子的，在父组件的 parse 过程中遇到标签具有 slot 属性时就会为其 AST 元素对象添加标识。

## template 预编译是什么？

## 说说 Vue3.0 和 Vue2.0 有什么区别

1. 分离内部模块。新的代码架构下为源码提供了更好的可维护性，并允许终端用户通过 tree-shaking 的形式将减少一半的运行时体积。

2. Vue3.0 使用 typescript 重构了整个项目，对于类型支持更加友好。

3. 移除了一些冷门的 API（比如 filter、inline-template、v-on:keyCode）

4. 数据劫持的优化，由**Object.prototype.definePrototype**改为**Proxy**

   - 可直接监听数组类型的数据变化。
   - 监听的目标为对象本身，不需要像**Object.prototype.definePrototype**一样遍历每个属性，在访问对象时才会变成响应式，有一定的性能提升。
   - 支持更多的类型劫持

5. 优化了 diff 算法、虚拟 DOM。

6. 新增 Compisition API

## Composition API 与 React Hook 的区别

从 React Hook 的实现角度看，React Hook 是根据 useState 调用的顺序来决定下一次重新渲染时的 state 是来源于那个 useState，所以有以下限制：

- 不能在循环、条件、嵌套函数中调用 Hook；
- 必须保证总是在 React 函数的顶层调用 Hook；
- useEffect、useMemo 等函数必须手动确定依赖关系。

而 composition API 是基于 Vue 的响应式实现的，与 React Hook 相比

- 一般来说更符合惯用的 JS 代码的直觉；
- 不需要顾虑调用顺序，也可以用在条件语句中；
- 不会再每次渲染时重复执行，以降低垃圾回收的压力；
- 不存在嵌套函数导致子组件永远更新的问题，也不需要**useCallback**；
- 不存在忘记记录依赖的问题，也不需要**useEffect**和**useMemo**并手动传入依赖。

## nextTick 知道吗，实现原理是什么？

### 是什么

Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。所以当我们想基于更新后的 DOM 来处理逻辑，那么就可以用**Vue.nextTick(callback)**。

### 原理

## Vue.js 中的 M/V/VM 分别指什么

![wY1kid.png](https://s1.ax1x.com/2020/09/10/wY1kid.png)

- Model: 组件中的 data、props 属性
- View: 组件中的 template 部分
- Viewmodel：继承自 vue 的组件实例

**严格的 MVVM 要求 View 不能和 Model 直接通信，而 Vue 在组件提供了\$refs 这个属性，让 Model 可以直接操作 View，违反了这一规定，所以说 Vue 没有完全遵循 MVVM。**

# TS

## TypeScript 与 JavaScript 的区别

|                   TypeScript                   |                JavaScript                |
| :--------------------------------------------: | :--------------------------------------: |
| JavaScript 的超集用于解决大型项目的代码复杂性  |      一种脚本语言，用于创建动态网页      |
|          可以在编译期间发现并纠正错误          | 作为一种解释型语言，只能在运行时发现错误 |
|           强类型，支持静态和动态类型           |         弱类型，没有静态类型选项         |
| 最终被编译成 JavaScript 代码，使浏览器可以理解 |          可以直接在浏览器中使用          |

## js 项目如何升级为 ts？有何影响？

## ts 基础类型都哪些，他们跟 js 的区别

## ts 为什么会流行？与 ECMA 新规范的关系？

## tslint 都能配置哪些功能？对开发流程有何影响？

## 如何使用 js 实现类型约束，枚举等特性么？

## 如何理解接口，泛型?

# 设计模式

## 观察者模式和发布-订阅模式的区别

## MVC/MVP/MVVM 的区别

MVC,MVP 和 MVVM 都是用来解决界面呈现和逻辑代码分离而出现的模式。

### MVC

- M: 模型（model）数据保存
- V: 视图（view）用户界面
- C: 控制器（controller）业务逻辑

各部分之间的通信方式如下。

![wYnNLQ.png](https://s1.ax1x.com/2020/09/10/wYnNLQ.png)

1. View 传送指令到 Controller
2. Controller 完成业务逻辑后，要求 Model 改变状态
3. Model 将新的数据发送到 View，用户得到反馈

### MVP

MVP 模式将 Controller 改名为 Presenter，但所负责的仍是业务逻辑，同时改变了通信方向。

![wYn5Jx.png](https://s1.ax1x.com/2020/09/10/wYn5Jx.png)

1. 各部分之间的通信，都是双向的。
2. View 和 Model 不发生联系，都是通过 Presenter 传递。

### MVC 和 MVP 的关系

MVP 是从 MVC 演变而来的，它们的基本思想相通：Controller/Presenter 负责业务逻辑，Model 提供数据，View 负责显示。

但是不同点在于：MVP 中 View 和 Model 是不联系的，而 MVC 中 VIew 可以直接从 Model 获取数据

### MVVM

MVVM 模式将 Presenter 改名为 ViewModel，基本上与 MVP 模式完全一致。

![wYKdCq.png](https://s1.ax1x.com/2020/09/10/wYKdCq.png)

唯一的区别是，它采用双向绑定（data-binding）：View 的变动，自动反映在 ViewModel，反之亦然。

# webpack

## webpack3 和 webpack4 的区别

# 浏览器

# 网络

## HTTP1 和 HTTP2、HTTP3 的区别

## 介绍一下 HTTPS 和 HTTP 区别

## 跨域
