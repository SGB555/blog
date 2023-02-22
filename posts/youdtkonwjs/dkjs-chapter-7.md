---
layout: youdtkonwjs
title: 第六章-对象
date: 2018-10-31 16:12:44
tags: ['你不知道的JavaScript','读书笔记']
---

![](https://ws1.sinaimg.cn/large/80676d79gy1fwrh4wl53aj20kw0dhq3x.jpg)

### 语法

对象可以通过两种形式定义：声明（文字）形式和构造形式
```js
// 声明（文字）形式
var myObj = { 
    key: value
    ...
};
// 构造形式
var myObj = new Object(); 
myObj.key = value;
```
### 类型
6中主要类型（简单基本类型）：
- string
- number
- boolean
- null 
- undefinded
- object

**注意:**简单基本类型本身不是对象。 typeof null 返回“object” 实际上是JS这个语言的BUG。

原理是不同的对象在底层表示为二进制，在JS中二进制前三位都为0的话就会被判为object类型，null的二进制表示全是0，所以typeof null 返回“object”

有一种常见的错误说法是“JavaScript 中万物皆是对象”，这显然是错误的。
实际上，JavaScript 中有许多特殊的对象子类型，我们可以称之为复杂基本类型。

#### 内置对象

- String
- Number
- Boolean
- Object
- Function
- Array
- Date
- RegExp
- Error

这些内置对象就类似于其他语言的class，如Java中的String class。

但是在JS中，它们实际上只是一些内置函数。这些内置函数可以当做构造函数使用。

```js
var strPrimitive = "I am a string"; 
typeof strPrimitive; // "string" 
strPrimitive instanceof String; // false
var strObject = new String( "I am a string" ); 
typeof strObject; // "object"
strObject instanceof String; // true
```
"I am a string"只是个字面量，如果需要获取长度、访问等等就需要转为String对象。而JS会自动把字符串字面量转换成一个String对象。

```js

var strPrimitive = "I am a string";
console.log( strPrimitive.length ); // 13
console.log( strPrimitive.charAt( 3 ) ); // "m"

```
**注意:**
1. null和undefined没有对应的构造形式，只有文字形式。
2. Date只有构造，没有文字形式。
3. Object，Array，Function，RegExp，无论文字还是构造，它们都是对象，不是字面量。
4. Error对象很少显式创建，一般在异常的时候自动创建。

### 内容

当我们说“内容”的时候，好像在暗示这些值就存储在对象内部，但其实这只是它的表现形式。存储在对象内部的只是这些属性的名称。

```js
var myObject = { a:2};
     myObject.a; // 2
     myObject["a"]; // 2
```
如果要访问属性，我们可以使用点操作符（.）或者中括号操作符([])。
在对象中，属性名永远都是字符串。如果你用字符串之外的值作为key，那它首先会被转换为一个字符串。

#### 可计算属性名

如果你需要通过表达式来计算属性名，那么我们刚刚讲到的 myObject[..] 这种属性访问语 法就可以派上用场了，如可以使用myObject[prefix + name]。
ES6 增加了可计算属性名，可以在文字形式中使用 [] 包裹一个表达式来当作属性名: 
```js
var prefix = "foo";
var myObject = {
    [prefix + "bar"]: "hello",
    [prefix + "baz"]: "world"
};
     myObject["foobar"]; // hello
     myObject["foobaz"]; // world
```

#### 属性与方法
在其他语言中，属于对象的函数通常被称为方法，但是在JS中函数永远不会属于一个对象。因为无论返回值是什么类型，每次访问对象的属性就是属性访问。即使有些函数具有this引用，但是this是根据调用位置动态绑定的。
举例来说:
```js
function foo() { console.log( "foo" );
}
var someFoo = foo; // 对 foo 的变量引用
var myObject = { someFoo: foo
};
foo; // function foo(){..}
someFoo; // function foo(){..} 
myObject.someFoo; // function foo(){..}
```
someFoo 和 myObject.someFoo 只是对于同一个函数的不同引用，并不能说明这个函数是特别的或者“属于”某个对象。

#### 数组
数组也是对象，你可以给数组添加属性：
```js
var myArray = [ "foo", 42, "bar" ]; 
myArray.baz = "baz"; 
myArray.length; // 3
myArray.baz; // "baz"
```
可以看到虽然添加了命名属性(无论是通过 . 语法还是 [] 语法)，数组的 length 值并未发生变化。

#### 复制对象

var newObj = JSON.parse( JSON.stringify( someObj ) );

var newObj = Object.assign( {}, myObject );

#### 属性描述符
```js
var myObject = { a:2
};
Object.getOwnPropertyDescriptor( myObject, "a" ); 
//{
// value: 2,
// writable: true,
// enumerable: true,
// configurable: true 
//}
```
这个普通的对象属性对应的属性描述符(也被称为“数据描述符”，因为它 只保存一个数据值)可不仅仅只是一个 2。它还包含另外三个特性:writable(可写)、 enumerable(可枚举)和 configurable(可配置)。

```js
var myObject = {};
    Object.defineProperty( myObject, "a", {
        value: 2,
        writable: true, 
        configurable: true, 
        enumerable: true
});
myObject.a; // 2
```
我们使用 defineProperty(..) 给 myObject 添加了一个普通的属性并显式指定了一些特性。 然而，一般来说你不会使用这种方式，除非你想修改属性描述符。
1. writable
writable 决定是否可以修改属性的值。
2. Configurable
是否可以配置属性
把 configurable 修改成 false 是单向操作，无法撤销!
要注意有一个小小的例外:即便属性是 configurable:false，我们还是可以 把 writable 的状态由 true 改为 false，但是无法由 false 改为 true。
3. Enumerable
是否可以遍历到
如果为false则会在遍历中跳过这个属性。

#### 不变性
通常来说我们都是不需要冻结对象的，如果有需要用到，那就得重新思考一下程序的设计了。
很重要的一点是，所有的方法创建的都是浅不变形，也就是说，它们只会影响目标对象和 它的直接属性。如果目标对象引用了其他对象(数组、对象、函数，等)，其他对象的内 容不受影响，仍然是可变的。

有以下几种方法实现对象的不变性。
1. 结合 writable:false 和 configurable:false 就可以创建一个真正的常量属性(不可修改、 重定义或者删除)。
2.  Object.preventExtensions( myObject ); 在非严格模式下，创建属性 b 会静默失败。在严格模式下，将会抛出 TypeError 错误。
3. Object.seal(..) 会创建一个“密封”的对象，这个方法实际上会在一个现有对象上调用 Object.preventExtensions(..) 并把所有现有属性标记为 configurable:false。
4. Object.freeze(..) 会创建一个冻结对象，这个方法实际上会在一个现有对象上调用 Object.seal(..) 并把所有“数据访问”属性标记为 writable:false，这样就无法修改它们 的值。

#### [[Get]]
当我们访问对象属性的时候，实际上是执行了[[Get]]操作。对象默认的内置[[Get]]操作首先会在对象中查找是否有名称相同的属性，如果没有则会循环原型链去寻找。最后还是没有的话返回undefined。

#### [[Put]]
[[Put]]被触发的时候，取决于很多因素，其中最重要的是对象中是否存在这个属性。
如果存在，则会进行下面的操作。
1. 属性是否存在访问描述符也就是setter、getter
2. 属性的数据描述符中的writable是否false，是的话，非严格模式下静默失败，严格模式下抛出typeError异常。
3. 如果都不是则将该值设为属性的值。

#### Getter和Setter

getter和setter部分改写默认操作，但是这只能应用在单个属性上，无法应用在整个对象中。
getter是一个隐藏函数，会在获取属性值时调用。
setter也是一个隐藏函数，在设置属性值的时调用。

如果有getter和setter或者两者之一，就会忽略它们的value和writable。

```js
var myObject = {
// 给 a 定义一个 getter 
    get a() {
        return 2; 
    }
};

Object.defineProperty{
    myObject,
    "b",
    {
        get(){
            return this.a * 2;
        },
        enumerable: true
    }
};

myObject.a; // 2
myObject.b; // 4
```
无论是文字语法还是显式定义，二者都会创建一个不含值的属性，访问这个属性的时候就会调用getter。

如果只有getter，对属性复制的操作会被忽略。

合理的写法是getter和setter成对出现：

```js
var myObject = {
// 给 a 定义一个 getter 
    get a() {
        return this._a_; 
    },
    // 给 a 定义一个 setter 
    set a(val) {
        this._a_ = val * 2;
    }
};
    myObject.a = 2;
    myObject.a; // 4
```

#### 存在性
in 和 hasOwnProperty(..) 的区别在于是否查找 [[Prototype]] 链，然而，Object.keys(..) 和 Object.getOwnPropertyNames(..) 都只会查找对象直接包含的属性。

#### 遍历
你可以使用 ES6 的 for..of 语法来遍历数据结构(数组、对象，等等)中的值，for..of 会寻找内置或者自定义的 @@iterator 对象并调用它的 next() 方法来遍历数据值。