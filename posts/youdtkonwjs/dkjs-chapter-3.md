---
layout: youdtkonwjs
title: 第三章-函数作用域和块作用域
date: 2018-09-02 22:11:46
tags: ['你不知道的JavaScript','读书笔记']
---

![](https://ws1.sinaimg.cn/large/80676d79gy1fuvjonv48wj20vr0ast9v.jpg)

### 函数中的作用域

![](https://ws1.sinaimg.cn/large/80676d79gy1fuve94tkubj205q08iaaa.jpg)

在这个代码片段中，f(...)的作用域气泡包含了y、g、z。无论标识符声明出现在作用域中的何处，这个标识符所代表的变量或者函数都将附属于所处作用域的气泡。

其中 g(...)拥有自己的作用域气泡，而全局作用域也有自己的作用域气泡。所以有无法从f(...)的外部（全局作用域）对它们进行访问。

函数作用域的含义：属于这个函数的全部变量都可以在整个函数的范围（嵌套的作用域也可以）内使用

### 隐藏内部实现

作用域隐藏的方法也叫最小授权或最小暴露原则。这个原则是指在软件设计中，应该最小限度地暴露必要内容，而将其他内容隐藏起来。
如下代码：
```js
function doSomething(a){
    b = a + doSomethingElse(a*2);
    console.log(b)
}
function doSomethingElse(a){
    return a - 1;
}
doSomething(2); // 15
```
```js
function doSomething(a){
    function doSomethingElse(a){
        return a - 1;
    }
    var b;
    b = a + doSomethingElse(a*2);
    console.log(b*3);
}
doSomething(2); // 15
```

最小暴露原则的具体体现就是第二段代码。第一段代码虽然能实现字面上的功能，但也相比第二段代码会容易得到非预期的结果，所以最小隐藏原则提倡的就是设计上将具体内容私有化了。

#### 规避冲突
隐藏作用域中的变量和函数所带来的另一个好处就是可以避免同名标识符之间的冲突。同名的话就会产生上一章提到的遮蔽效应。

##### 全局命名空间
变量中途的典型例子就是在引入第三方库的时候，库没有封装好就有可能与你的全局作用域中的标识符冲突。

##### 模块管理
另一个解决冲突的办法就是模块管理。像es6的import/export一样 会有独立的作用域不会污染到本地全局作用域。

### 函数作用域
思考如下代码：
```js
var a = 2;
function foo(){
    var a = 3;
    console.log(a); // 3
}
foo();
console.log(a); // 2
```
1. 这个是函数声明。
2. 这个是个具名函数并且处于全局作用域。

```js
(function foo(){
    var a = 3;
    console.log(a); // 3
})();
console.log(a) // 2
```
1. 这个是函数表达式。
2. 这个是匿名函数。
3. (function foo(){...})作为函数表达式，foo只能在{...}所代表的位置被访问，外部作用域不行。

如果function是声明中的第一个词，那么就是一个函数声明，否则就是一个函数表达式。
函数声明和函数表达式之间最重要的区别就是它们的名称标识符将会绑定在哪。

#### 匿名和具名

```js
setTimeout(function(){
    console.log('123');
},1000)
```
这应该就是最熟悉的函数表达式了。函数表达式可以试匿名的，函数声明则不可以省略函数名。

**匿名函数表达式的缺点：**
1. 错误不好追踪。
2. 无法高效调用自身。
3. 可读性/可理解性 不好。

```js 
setTimeout(function timeoutHandler(){
    console.log('123');
},1000)
```
**行内函数表达式**就能很好解决匿名函数的缺点。

#### 立即执行函数

```js
var a = 2;

(function foo(global){
    var a = 3;
    console.log(a); // 3
    console.log(global.a); // 2
})(window);

console.log(a) // 2
```
这个也是个很常见的模式啦。函数被包含在第一个()里变成了函数表达式，第二个()执行了这个函数。
同时也可以传入一个参数。

### 块作用域
函数作用域是最常见的作用域单元，但其他类型的作用域单元也是存在的。例如：块作用域。
```js
for(var i = 0; i<10;i++){
    console.log(i);
}
```
这就就是很明显的块作用域。但是var 变量声明时绑定在全局作用域的。

#### with
with是从对象中创建出来的作用域仅在with声明中而非外部作用域中有效。

#### try/catch
```js
try{
    undefinded()
}catch(err){
    console.log(err)
}
```
其中在catch(...)中声明的变量只能在catch(){...}这个块作用域中有效。

#### let
let 是es6的语法，是一个新的声明变量的语法。let可以将变量绑定到任意作用域中（通常是{..}内部）。

```js
var foo = true;
if(foo){
    let bar = foo*2;
    bar = something(bar);
    console.log(bar);
}
console.log(bar) // ReferenceError
```
可以看出在一个块作用域外访问let声明的变量是会报错的。

```js
{
    console.log(bar); // ReferenceError!
    let bar = 2;
}
```
用let 声明的变量不存在变量提升的情况。

##### 垃圾收集
有效的创建块作用域有助于提交性能，因为在形成闭包的时候js引擎的垃圾回收机制会忽略掉。

##### let循环
上文提到的var循环声明的变量会污染全局，也有可能会导致意料之外的结果。
那么：
```js
for(let i = 0; i<10;i++){
    console.log(i);
}
```
let 循环则能够很好的讲i绑定到for循环中，并且保证使用上一次循环迭代结束的时候重新进行赋值。

#### const
const 同样是es6的值 作用与let类似但是其值是固定的。
```js
var foo = true;
if(foo){
    var a = 2;
    const b = 3;

    a = 3; // 正常
    b = 4; // 错误
}
console.log(a); // 3
console.log(b); // ReferenceError
```