---
layout: youdtkonwjs
title: 第六章-this全面解析
date: 2018-10-17 22:22:46
tags: ['你不知道的JavaScript','读书笔记']
---

![](https://ws1.sinaimg.cn/large/80676d79gy1fwoaufmsq7j20sb0b8q48.jpg)

### 调用位置
在理解this之前，首先要理解调用位置：调用位置就是函数在代码中被调用的位置（而不是声明的位置）。

最重要的是**分析调用栈**（就是为了达到当前执行位置所调用的所有函数）

```js
function baz(){
    // 当前调用栈是：baz
    // 因此，当前调用位置是全局作用域
    console.log('baz');
    bar(); // bar的调用位置
}
function bar(){
    // 当前调用栈是：baz -> bar
    // 因此，当前调用位置是bar中
    console.log('bar');
    foo(); // foo的调用位置
}
function foo(){
    console.log('foo');
}
baz();
```

### 绑定规则
绑定规则通常情况下是有4中的

#### 默认绑定
```js
function foo(){
    console.log(this.a);
}
var a = 2;
foo() // 2
```
当其他规则无法应用是就可以当做是默认绑定。
代码中foo()是直接使用不带任何修饰的函数引用进行调用的，因此只能是默认绑定。
在非严格模式下，默认绑定会绑定到全局对象，如果是严格模式会绑定到undefined。

#### 隐式绑定

```js
function foo(){
    console.log(this.a);
}
var obj ={
    a:2,
    foo:foo
}
obj.foo() // 2
```
隐式绑定则是考虑调用位置是否有上下文对象，或者说被某个对象拥有或包含。
当拥有上下文对象时，this就会绑定到这个上下文对象中。
需要注意的是无论是在obj中定义还是定义后再添加为属性，严格来说这个函数都**不属于obj对象**

而且只对最后一层调用位置起作用，如代码所示：
```js
function foo(){
    console.log(this.a);
}
var obj2 ={
    a:4,
    foo:foo
}
var obj1 ={
    a:2,
    obj2:obj2
}
obj1.obj2.foo() //4
```

##### 隐式丢失
隐式绑定会引发一个问题就是被隐式绑定的函数在以下情况下会丢失绑定对象，也就是说会应用默认绑定
```js
function foo(){
    console.log(this.a);
}
var obj ={
    a:2,
    foo:foo
}
var bar = obj.foo; // 函数别名
var a = 'global' // a是全局对象的属性
bar(); // global
```
实际上，它引用的是foo函数本身，因此此时的bar()其实是一个不带任何修饰的函数调用，因此应用了默认绑定
所以尽量用let声明吧

#### 显式绑定

也就是通过call(...),apply(...)强制绑定this

##### 硬绑定
```js
function foo(){
    console.log(this.a);
}
var obj ={
    a:2,
}
var bar = function(){
    foo.call(obj);
}
bar() // 2
bar.call(windows)// 2
```
就是在调用的时候总是手动绑定

也可以使用es5的bind(...)

```js
function foo(sth){
    console.log(this.a,sth);
    return this.a +sth
}
var obj ={
    a:2
}
var bar = foo.bind(obj);
var b = bar(3); // 2 3
console.log(b);// 5
```
bind(...)会返回一个硬编码的新函数，它会把你指定的参数设置为this的上下文并调用原始函数。

##### api调用的“上下文”
有一些第三方库，以及JS的内置函数，都提供了一个可选的参数，通常称为“上下文”(context)，其作用和bind(...)一样，确保你的回调函数使用指定的this
```js
  function foo(el) {
        console.log(el, this.id);
    }
    var obj = {
        id: 'awesome'
    }
    var arr = [1, 2, 3]
    arr.forEach(foo, obj)// 1 "awesome" 2 "awesome" 3 "awesome"
```

#### new绑定
在传统的面向对象语言中，构造函数是使用new初始化类时会调用类中的构造函数，通常如下代码形式：
```js
sth = new myClass(...);
```
js也有new操作符，但是js的机制实际上和传统的面向对象是完全不同的。

js中的构造函数只是一些使用new操作符时被调用的函数。它们并不会属于某个类，也不会实例化一个类。它们只是被new操作符调用的普通函数而已。
所以，包括内置函数之内的所有函数都可以用new来调用，这种函数调用被称为函数调用。

使用new来调用函数，会执行下面操作：

1. 创建（或者说构造）一个全新的对象。
2. 这个对象会被执行[[Prototype]]连接。
3. 这个新对象会绑定到函数调用的this。
4. 如果函数没有返回对象，那么new表达式中的函数调用会自动返回这个新对象。

```js
function foo(a){
    this.a = a ;
}

var bar = new foo(2);
console.log(bar.a);// 2
```

### 优先级
new>显性绑定>隐式绑定>默认绑定

### 绑定例外
你认为应当应用其他规则时，实际上应用的可能是默认绑定规则

#### 被忽略的this
如果在call、apply、bind是把null当作this的绑定对象传入就会被当作默认绑定
那什么情况下传入null呢，一是用apply来展开一个数组，并当作参数传入函数
```js
function foo(a,b){
    console.log("a:"+a",b:"+b);
}
foo.apply(null,[2,3])//a:2,b:3;
```
二是bind(...)对参数柯里化（预先设置一下参数）。
```js
var bar = foo.bind(null,2);
bar(3);// a:2,b:3
```
当然这两个方法在es6中都能更简单实现
```js
foo(...[2,3]);

function foo(a=2,b){
    ...
};
```
然而，用null来忽略this绑定会产生一些副作用。如果某个函数确实是用来this比如第三方库中的一个函数，那默认绑定就会把this绑定到全局对象，这就导致不可以预计的结果。

#### 更安全的this
作者所认为更安全的this也就是Object.create(null),因为不会关联到原型链上。
```js
function foo(a,b){
    console.log("a:"+a",b:"+b);
}
var ø = Object.craete(null);
foo.apply(ø,[2,3])
var bar = foo.bind(ø,2);
bar(3);
```

#### 间接引用