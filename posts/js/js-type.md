---
title: JS的类型转换
date: 2021-4-14 16:59:11
tags: ['JS']
---

# 前言

看了 N 次 JS 的类型转换决定总结一下。

# 类型转换

> ECMAScript 运行时系统会在需要时从事自动类型转换。为了阐明某些结构的语义，定义一集转换运算符是很有用的。这些运算符不是语言的一部分；在这里定义它们是为了协助语言语义的规范。转换运算符是多态的 — 它们可以接受任何 ECMAScript 语言类型 的值，但是不接受 规范类型 。

首先 JS 中的类型转换可以分为基础类型和引用类型的转换，且只有以下 3 种转换：

- 转换为布尔值
- 转换为数字
- 转换为字符串

那么，下面将分别总结基础类型和引用类型总结。

# 基础类型

- Boolean
- Null
- Undefined
- number
- String
- Symbol

Symbol 本身不可类型转换，抛开总结。

## ToBoolean

| 输入类型  |                  结果                   |
| :-------: | :-------------------------------------: |
| Undefined |                  false                  |
|   Null    |                  false                  |
|  Boolean  |     结果等于输入的参数（不转换）。      |
|  Number   |       除 -0，0，NaN 之外均为 true       |
|  String   | 空串（长度为 0）为 false，其余均为 true |

基础类型发生类型转换不外乎以下几种方式，但最终都是遵循上述表格规则转换。

### 逻辑非运算符

[参考链接](https://yanhaijing.com/es5/#179)

产生式 UnaryExpression : ! UnaryExpression 按照下面的过程执行 :

1. 令 expr 为解释执行 UnaryExpression 的结果 .
2. 令 oldValue 为 **ToBoolean(GetValue(expr))**.
3. 如果 oldValue 为 true ，返回 false.
4. 返回 true.

### Boolean (value)

[参考链接](https://yanhaijing.com/es5/#402)

返回由 **ToBoolean(value)** 计算出的布尔值（非布尔对象）。

注意：参数为空时返回 false

### new Boolean (value)

新构造对象的 [[Prototype]] 内部属性设定为原始布尔原型对象，它是 Boolean.prototype (15.6.3.1) 的初始值。

新构造对象的 [[Class]] 内部属性设定为 "Boolean"。

新构造对象的 [[PrimitiveValue]] 内部属性设定为 **ToBoolean(value)**。

新构造对象的 [[Extensible]] 内部属性设定为 true。

### 二元逻辑运算符：&& 和 ||

[参考链接](https://yanhaijing.com/es5/#208)

#### &&

如果 **ToBoolean(左值)** 为 false ，返回 lval.

#### ||

如果 **ToBoolean(lval)** 为 true ，返回 lval.

## ToNumber

[参考链接](https://yanhaijing.com/es5/#106)

| 输入类型  |         结果         |
| :-------: | :------------------: |
| Undefined |         NaN          |
|   Null    |          +0          |
|  Boolean  |  true=>1;false=>+0   |
|  Number   |        不转换        |
|  String   | 这段比较复杂，看例子 |

```js
console.log(Number()) // +0

console.log(Number(undefined)) // NaN
console.log(Number(null)) // +0

console.log(Number(false)) // +0
console.log(Number(true)) // 1

console.log(Number('123')) // 123
console.log(Number('-123')) // -123
console.log(Number('1.2')) // 1.2
console.log(Number('000123')) // 123
console.log(Number('-000123')) // -123

console.log(Number('0x11')) // 17

console.log(Number('')) // 0
console.log(Number(' ')) // 0

console.log(Number('123 123')) // NaN
console.log(Number('foo')) // NaN
console.log(Number('100a')) // NaN
```

> 如果通过 Number 转换函数传入一个字符串，它会试图将其转换成一个整数或浮点数，而且会忽略所有前导的 0，如果有一个字符不是数字，结果都会返回 NaN，鉴于这种严格的判断，我们一般还会使用更加灵活的 parseInt 和 parseFloat 进行转换。

> parseInt 只解析整数，parseFloat 则可以解析整数和浮点数，如果字符串前缀是 "0x" 或者"0X"，parseInt 将其解释为十六进制数，parseInt 和 parseFloat 都会跳过任意数量的前导空格，尽可能解析更多数值字符，并忽略后面的内容。如果第一个非空格字符是非法的数字直接量，将最终返回 NaN：

```js
console.log(parseInt('3 abc')) // 3
console.log(parseFloat('3.14 abc')) // 3.14
console.log(parseInt('-12.34')) // -12
console.log(parseInt('0xFF')) // 255
console.log(parseFloat('.1')) // 0.1
console.log(parseInt('0.1')) // 0
```

## ToString

[参考链接](https://yanhaijing.com/es5/#111)

| 输入类型  |            结果             |
| :-------: | :-------------------------: |
| Undefined |         "undefined"         |
|   Null    |           "null"            |
|  Boolean  | true=>"true";false=>"false" |
|  Number   |   参见下文的文法和注释。    |

ToString 运算符将数字 m 转换为字符串格式的给出如下所示：

1. 如果 m 是 NaN，返回字符串 "NaN"。
2. 如果 m 是 +0 或 -0，返回字符串 "0"。
3. 如果 m 小于零，返回连接 "-" 和 ToString (-m) 的字符串。
4. 如果 m 无限大，返回字符串 "Infinity"。
   否则，令 n, k, 和 s 是整数，使得 k ≥ 1, 10k-1 ≤ s < 10k，s × 10n-k 的数字值是 m，且 k 足够小。要注意的是，k 是 s 在十进制表示中的数字的个数。s 不被 10 整除，且 s 的至少要求的有效数字位数不一定要被这些标准唯一确定。
5. 如果 k ≤ n ≤ 21，返回由 k 个 s 在十进制表示中的数字组成的字符串（有序的，开头没有零），后面跟随字符 '0' 的 n-k 次出现。
6. 如果 0 < n ≤ 21，返回由 s 在十进制表示中的、最多 n 个有效数字组成的字符串，后面跟随一个小数点 '. '，再后面是余下的 k-n 个 s 在十进制表示中的数字。
7. 如果 -6 < n ≤ 0，返回由字符 '0' 组成的字符串，后面跟随一个小数点 '. '，再后面是字符 '0' 的 -n 次出现，再往后是 k 个 s 在十进制表示中的数字。
   否则，如果 k = 1，返回由单个数字 s 组成的字符串，后面跟随小写字母 'e'，根据 n-1 是正或负，再后面是一个加号 '+' 或减号 '-' ，再往后是整数 abs(n-1) 的十进制表示（没有前置的零）。
8. 返回由 s 在十进制表示中的、最多的有效数字组成的字符串，后面跟随一个小数点 '. '，再后面是余下的是 k-1 个 s 在十进制表示中的数字，再往后是小写字母 'e'，根据 n-1 是正或负，再后面是一个加号 '+ ' 或减号 '-' ，再往后是整数 abs(n-1) 的十进制表示（没有前置的零）。

# 引用类型

对象到字符串和对象到数字的转换都是通过调用待转换对象的一个方法来完成的。而 JavaScript 对象有两个不同的方法来执行转换，一个是 toString，一个是 valueOf。注意这个跟上面所说的 ToString 和 ToNumber 是不同的，这两个方法是真实暴露出来的方法。

## ToBoolean

引用类型转布尔值均为 true

## 对象转字符串和数字

对象转字符串和数字时会先调用 ToPrimitive 将其转为基本类型，而后分别根据所需转类型的规则再转换。

根据[规范](https://yanhaijing.com/es5/#105)：

| 输入类型 |                                          结果                                           |
| :------: | :-------------------------------------------------------------------------------------: |
|  Object  | 转字符串 <br>1. primValue = ToPrimitive(input, String) <br>2. 返回 ToString(primValue). |
|  Object  |  转数字 <br>1. primValue = ToPrimitive(input, Number) <br>2. 返回 ToNumber(primValue).  |

## ToPrimitive

ToPrimitive: [参考链接](https://yanhaijing.com/es5/#103)

DefaultValue: [参考链接](https://yanhaijing.com/es5/#100)

ToPrimitive 实际上就是调用对象的内部方法[[DefaultValue]]

如果是 ToPrimitive(obj, Number)，处理步骤如下：

1. 如果 obj 为 基本类型，直接返回
2. 否则，调用 valueOf 方法，如果返回一个原始值，则 JavaScript 将其返回。
3. 否则，调用 toString 方法，如果返回一个原始值，则 JavaScript 将其返回。
4. 否则，JavaScript 抛出一个类型错误异常。

如果是 ToPrimitive(obj, String)，处理步骤如下：

1. 如果 obj 为 基本类型，直接返回
2. 否则，调用 toString 方法，如果返回一个原始值，则 JavaScript 将其返回。
3. 否则，调用 valueOf 方法，如果返回一个原始值，则 JavaScript 将其返回。
4. 否则，JavaScript 抛出一个类型错误异常。
