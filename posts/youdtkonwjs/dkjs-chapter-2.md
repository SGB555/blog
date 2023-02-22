---
layout: youdtkonwjs
title: 第二章-词法作用域
date: 2018-08-22 
tags: ['你不知道的JavaScript','读书笔记']
---
刚完成第一章读书笔记之后。。紧接着就是连续的996 公事私事加起来导致很久没有写读书笔记，趁着最近不忙就赶紧补上

定义：作用域主要有两种。第一种是较为普遍的词法作用域也是JS采用的作用域模型；第二种是动态作用域。

![](https://ws1.sinaimg.cn/large/80676d79gy1fung4zi1vcj21a104qt9o.jpg)

**内容:**
1. 词法阶段
2. 欺骗词法

### 词法阶段
第 1 章介绍过，大部分标准语言编译器的第一个工作阶段叫作词法化(也叫单词化)。回 忆一下，词法化的过程会对源代码中的字符进行检查，如果是有状态的解析过程，还会赋 予单词语义。

简单地说，词法作用域就是定义在词法阶段的作用域。换句话说，词法作用域是由你在写 代码时将变量和块作用域写在哪里来决定的，因此当词法分析器处理代码时会保持作用域 不变(大部分情况下是这样的)。

#### 查找
作用域查找会在找到第一个匹配的标识符时停止。
作用域查找始终是从运行时所处的最内部作用域开始，逐级向外或者说向上进行，直到遇见第一个匹配的标识符为止。

无论函数在哪里被调用，也无论它如何被调用，它的词法作用域都只是由函数被声明时所处的位置决定的

词法作用域查找只会查找一级标识符。如果代码中引用了foo.bar.baz 词法作用域查找只会找到foo，之后的查找就会被对象属性访问规则接管。

### 欺骗词法

JS中有两种机制来实现欺骗词法，重要的是 **欺骗词法作用域会导致性能下降**

#### eval

eval() 是全局对象的一个函数属性。

eval() 的参数是一个字符串。如果字符串表示的是表达式，eval() 会对表达式进行求值。如果参数表示一个或多个 JavaScript 语句， 那么 eval() 就会执行这些语句。注意不要用 eval() 来执行一个算术表达式；

例如：
```js
function foo(str,a){
    eval(str); // 欺骗
    console.log(a,b);
}
var b = 2;
foo('var b = =3',1); // 1,3
```
由于eval(...)调用的代码声明了一个新的变量b,因此它对已经存在的词法作用域进行了修改。实际上就是，在foo(...)中创建了一个变量b把全局作用域的变量b遮蔽了
非严格模式下才能执行上述代码。

#### with

with通常被当作重复引用同一个对象的多个属性的快捷方式，可以不需要重复引用对象本身。
例如：
```js
var obj ={
    a:1,
    b:2,
    c:3
}

obj.a = 2;
obj.b = 3;
obj.c = 4;

with(obj){
    a = 2;
    b = 3; 
    c = 4;
}
```
我们写的代码看起来只是对变量a的简单引用，实际上是一个LHS引用。当函数作用域以及全局作用域都没有查找到要引用的值时，就会创建一个全局变量，这样就改变了我们本来的目的（非严格模式）。

#### 性能
JS引擎在便器阶段会进行性能优化。而优化依赖于代码的词法静态分析，而以上两种机制就会导致无法预测从而放弃了优化。所以请不要使用它们