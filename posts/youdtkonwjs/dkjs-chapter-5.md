---
layout: youdtkonwjs
title: 第五章-关于this
date: 2018-09-23 22:46:37
tags: ['你不知道的JavaScript','读书笔记']
---

![](https://ws1.sinaimg.cn/large/80676d79gy1fvjuvqjx73j20jm054glu.jpg)

### 为什么要用this
<!--more-->
思考如下代码
```js
function identify(){
    return this.name.toUpperCase();
}
function speak(){
    var greeting = "Hello, I'm "+ identify.call(this);
}

var me = {
    name:"Kyle"
}

var you = {
    name: "Reader"
}

identify.call(me); // Kyle
identify.call(you); // Reader

speak.call(me); // Hello, I'm Kyle
speak.call(you); // Hello, I'm Reader
```
上面的代码可以在不同的上下文对象中重复使用函数identify()和speak()，不用针对不同的对象重新编写函数。

如果不用this就会如下代码

```js
function identify(context){
    return context.name.toUpperCase();
}

function speak(context){
    var greeting = "Hello, I'm "+ identify(context);
    console.log(greeting);
}
identify(you) // Reader
speak(me) // Hello, I'm Kyle
```
所以this提供了更为优雅的传递方式，因此可以将API设计的更简洁并且易用。

### 误解
很多人会拘泥于this的字面意思而产生误解。
 
#### 指向自身

思考如下代码：
```js
function foo(num){
    console.log('foo' + num);
    // 想要记录次数
    this.count++
}

foo.count = 0;
for(var i = 0;i<10;i++){
    if(i>5){
        foo(i);
    }
}

// foo:6
// foo:7
// foo:8
// foo:9

console.log(foo.count); // 0
```
日志输出了4次 为什么count值还是0呢？
由于this有4种绑定方式，而foo()是直接使用不带任何修饰的函数引用进行调用的，简单的来说就是直接调用了，所以foo()里面的this是一个默认绑定，默认绑定则是绑定到全局作用域的。foo()函数中的this.count++也就是声明了一个全局变量count = undefined,然后undefined++，也就是输出了NaN。而foo.count声明之后就没有变化过。

同时也证明了this并不一定指向自身。

如果要解决这个问题，则应当如下代码

```js
...
for(var i = 0;i<10;i++){
    if(i>5){
        // 使用call(...)强制绑定this至foo()
---     foo(i);     
+++     foo.call(foo,i);
    }
}
console.log(foo.count); // 4
```

#### 指向作用域

第二种常见的误解就是this一定指向作用域。

需要明确的是，this在任何情况下都不指向函数的词法作用域。

### this到底是什么
this实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。



