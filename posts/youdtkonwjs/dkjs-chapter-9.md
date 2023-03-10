---
layout: youdtkonwjs
title: 第九章-原型链
date: 2019-01-14 19:45:42
tags: ['你不知道的JavaScript','读书笔记']
---

![](https://ws1.sinaimg.cn/large/80676d79gy1fz7ovhzfqaj20t40abwff.jpg)

### [[Prototype]]

在几乎所有的对象创建时都会有[[Prototype]]属性（非空），它是JS对象中内置的特殊属性，其实就是对其他对象的引用。

有什么用呢？在你试图引用对象的属性时会触发[[Get]]操作，比如myObject.a。对于默认的[[Get]]操作，第一步就是检查对象本身是否有这个属性，否则就会查找对象的[[Prototype]]链了。
这个过程会持续直到找到匹配的属性，如果查找完整的[[prototype]]链后还是没有则返回undefined。


#### Object.prototype
所有普通的[[prototype]]链最终都会指向内置的Object.prototype。它包含JS中许多通用功能：.toString()和.valueOf()等等。

#### 属性设置和屏蔽
给一个对象设置属性并不是仅仅添加一个新值那么简单。
```js
myObject.foo = 'bar';
```
如果myObject对象中包含名为foo的普通数据访问属性，这条赋值语句只会修改已有的属性值。

- 如果foo不在myObject对象中，就会遍历[[prototype]]链，原型链上没有foo则直接添加到myObject上。
- 如果foo既出现在myObject中也出现在原型链上，那么就会发生屏蔽。myObject中的foo会屏蔽原型链中的foo，因为myObject.foo总是会选择原型链中最底层的foo属性
- 如果foo存在原型链上会有以下几种情况：
    1. 如果存在原型链上且没有被标为只读，就会添加到myObject中，它是**屏蔽属性**。
    2. 如果存在原型链上而且是只读，如果运行在严格模式下，代码会抛出错误。否则，会被忽略。
    3. 如果在原型链上存在foo且是一个setter，那么就会调用setter，而不会添加到myObject，也不会重新定义setter。

如果你想在第二、第三种情况下也能添加foo属性，那就得用Object.defineProperty()。

### “类”

现在你可能会很好奇:为什么一个对象需要关联到另一个对象?这样做有什么好处?
但是在回答之前我们首先要理解 [[Prototype]]“不是”什么。
JavaScript 和面向类的语言不同，它并没有类来作为对象的抽象模式或者说蓝图。JavaScript 中只有对象。
实际上，JavaScript 才是真正应该被称为“面向对象”的语言，因为它是少有的可以不通过类，直接创建对象的语言。
在 JavaScript 中，类无法描述对象的行为，(因为根本就不存在类!)对象直接定义自己的行为。
再说一遍，JavaScript 中只有对象。

#### “类”函数
所有的函数默认都会拥有一个名为prototype的公有并且不可枚举的属性，指向另一个对象：
```js
function Foo(){}
Foo.prototype;
```
这个对象被称为Foo的原型。

最直接的解释就是，这个对象是在调用new Foo()时创建的，最后会被关联到这个“Foo点prototype”对象上。

```js
    function Foo(){}
    var a = new Foo();
    Object.getPrototypeOf(a) === Foo.prototypr; // true
```

调用new Foo()时会创建a，其中一步就是给a一个内部的[[prototype]]链接，关联到Foo.prototype指向的那个对象。

使用new来调用函数，会执行下面操作：

1. 创建（或者说构造）一个全新的对象。
2. 这个对象会被执行[[Prototype]]连接。
3. 这个新对象会绑定到函数调用的this。
4. 如果函数没有返回对象，那么new表达式中的函数调用会自动返回这个新对象。

在面向类的语言中，类可以复制或实例化多次，但是在JS中并没有类似的复制机制。new Foo()会生成一个新对象，这个新对象的内部链接[[prototype]]关联的是Foo.prototype对象。最后我们得到两个对象，它们之间互相关联。实际上我们没有从“类”中复制任何行为到一个对象中，只是让两个对象互相关联。

#### 关于名称
在JS中我们并不会把一个对象（类）复制到另一个对象（实例），只是将它们关联起来。
这个机制通常称为**原型继承**。

“继承”这个词很容易让人误会，令人无法区分JS的关联对象和类继承几乎完全相反的行为。

继承意味着复制操作，JS默认并不会复制对象属性。只会在两个对象之间创建关联，这样一个对象就可以通过**委托**访问另一个对象的属性和函数。

#### “构造函数”
```js
    function Foo(){}
    var a = new Foo();
```
是什么让我们认识Foo是一个类呢？
1. 看到关键字new，在面向类的语言中构造实例会用到new。
2. 看起来我们执行了类的构造函数，Foo()。


```js
function Foo(){}
Foo.prototype.constructor === Foo; // true
var a = new Foo();
a.constructor === Foo;// true
```

Foo.prototype默认有一个公有且不可枚举的属性.constructor,这个属性引用的是对象关联的函数。

还有 
1. 似乎”类“名首字母大写是表示类，但其实对于JS引擎来说用new调用首字母大小写的函数没有任何意义。
2. 实际上，new会劫持所有普通函数并用构造对象的形式调用它。

举例：
```js
function NothingSpecial(){
    console.log("Dont't mind me");
}
let a = new NothingSpecial();
// Dont't mind me
a; //{}
```
NothingSpecial只是一个普通函数，但是使用new调用时，它就会构造一个对象并赋值给a。但是NothingSpecial本身并不是一个构造函数。

换句话说，在JS中”构造函数“就是所有带new的函数调用。
函数不是构造函数，但是当且仅当使用new时，函数调用就会变成”构造函数调用“

#### .constructor属性
之前讨论的.constructor属性，看起来a.constructor === Foo为真意味着a确实有一个指向Foo的.constructor属性。实际上，.constructor同样被委托给了Foo.prototype，而Foo.prototype.constructor默认指向Foo。

因此而认为a是有Foo构造是不合理的，因为a.constructor是通过原型链查找到Foo.constructor而返回的。


### （原型）继承
![kV4vwV.png](https://s2.ax1x.com/2019/01/23/kV4vwV.png)

图中由下到上的箭头表明委托并不是复制。

以下代码就是典型的“原型风格”
```js
function Foo(name){
    this.name = name;
}

Foo.prototype.myName = function (){
    return this.name
}

function Bar(name,label){
    Foo.call(this,name);
    this.label = label;
}
// 创建了一个新的Bar.prototype对象并且关联到Foo.prototype
Bar.prototype = Object.create(Foo.prototype);

Bar.prototype.myLabel = function(){
    return this.label;
}

var a = new Bar("a","obj a");
a.myName() // a
a.myLabel() // obj a
```

这段代码的核心就是调用了Object.create(...)会创建一个新对象并把新对象的[[prototype]]关联到你所传入的对象（本例中是Foo.prototype)

**注意：**
以下两种想要创建关联的方式是错误的：
1. Bar.prototype = Foo.prototype
2. Bar.prototype = new Foo()

Bar.prototype = Foo.prototype这样并不会创建一个关联，而是引用了Foo.prototype。所以改变Bar.prototype的属性时，Foo.prototype也会跟着改变。

Bar.prototype = new Foo()错误的关键在于，Foo()有一些副作用（写日志，修改状态。。。）时就会影响到Bar()的后代。

#### 检查“类”关键

在传统的面向类环境中，检查一个实例（JS中的对象）和继承祖先（JS中的委托关联）的关系通常被称为内省（或者反射）。

有两种方法可以获取关系
1. instanceof
2. isPrototypeOf()

### 对象关联

现在我们知道了，[[prototype]]机制就是存在于对象中的一个内部链接，它会引用其他对象。

通常来说，这个链接的作用就是：在某个对象上没有找到需要的属性时，引擎就会继续在[[prototype]]关联的对象上寻找。同理，如果还是没有找到的话，就会在它关联的对象上继续寻找，以此类推。这一系列的对象的链接被称为“原型链”。

#### 创建关联

```js
var foo = {
    someting(){
        console.log('tell me someting')
    }
};

var bar = Object.create(foo);

bar.something(); // tell me someting
```

Object.create(...)会创建一个新对象（bar)并把它关联到我们指定的对象（foo)，这样就可以创建原型链的关联。