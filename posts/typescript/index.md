---
layout: typescript
title: 初识typescript
date: 2020-02-01 13:45:36
tags: typescript
---

**前言：**
趁着春节假期开始学习 typescript 啦，第一遍还是先过文档吧。所以这篇博文还是在于记录我本人觉得的疑难点。

## 一、基础类型

### Typescript 定义数组的方式：

```ts
// 第一种，可以在元素类型后面加[]
let list: number[] = [1, 2, 3]
// 第二种，可以使用数学泛型
let list: Array<number> = [1, 2, 3]
```

### 元组：

```ts
// Declare a tuple type
let x: [string, number]
// Initialize it
x = ['hello', 10] // OK
// Initialize it incorrectly
x = [10, 'hello'] // Error
x[6] = true // Error, 布尔不是(string | number)类型
```

### 枚举

```ts
enum Color {
  Red,
  Green,
  Blue
}
let c: Color = Color.Green
// 默认情况下，从0开始为元素编号。 你也可以手动的指定成员的数值。 例如，我们将上面的例子改成从 1开始编号：
enum Color {
  Red = 1,
  Green,
  Blue
}
let c: Color = Color.Green
// 或者，全部都采用手动赋值：
enum Color {
  Red = 1,
  Green = 2,
  Blue = 4
}
let c: Color = Color.Green
```

### 类型断言

```ts
// 类型断言有两种形式。 其一是“尖括号”语法：
let someValue: any = 'this is a string'
let strLength: number = (<string>someValue).length
// 另一个为as语法：
let strLength1:(someValue as string).length
```

## 二、接口

接口是之前没有接触过的，疑难点会相对多一点，也更需要仔细学一遍。

### 简单实例

```ts
// 定义一个接口，代表了一个有label属性且类型为String的对象
interface LabelledValue {
  label: string
}
// 用于printLabel函数的参数中
function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label)
}

let myObj = { size: 10, label: 'Size 10 Object' }
printLabel(myObj) // Size 10 Object
```

**类型检查器不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。**

### 可选属性

顾名思义，接口中的参数可传可不传

```ts
// 参数带问号意为可选属性
interface SquareConfig {
  color?: string
  width?: number
}
```

### 只读属性

顾名思义，属性只读不可改

```ts
interface Point {
  readonly x: number
  readonly y: number
}
let p1: Point = { x: 10, y: 20 }
p1.x = 5 // error!
```

**注意：最简单判断该用 readonly 还是 const 的方法是看要把它做为变量使用还是做为一个属性。 做为变量使用的话用 const，若做为属性则使用 readonly**

### 函数类型

接口不仅可以描述对象也可以描述函数，如下列代码所示

```ts
//  它就像是一个只有参数列表和返回值类型的函数定义。参数列表里的每个参数都需要名字和类型。
interface SearchFunc {
  (source: string, subString: string): boolean
}
let mySearch: SearchFunc

// 这里函数声明的参数可以跟接口不同名
mySearch = function(src: string, sub: string): boolean {
  let result = src.search(sub)
  return result > -1
}
// 也可以省略参数类型和返回值类型，ts会自己推断
let mySearch1: SearchFunc = function(src, sub) {
  let result = src.search(sub)
  return result > -1
}
```

### 可索引类型

描述那些能够“通过索引得到”的类型，比如 a[10]或 ageMap["daniel"]。

```ts
interface StringArray {
  [index: number]: string
}

let myArray: StringArray
myArray = ['Bob', 'Fred']

let myStr: string = myArray[0]
```

**疑难点：**
TypeScript 支持两种索引签名：字符串和数字。 可以同时使用两种类型的索引，但是数字索引的返回值必须是字符串索引返回值类型的子类型。

```ts
class Animal {
  name: string
}
class Dog extends Animal {
  breed: string
}

// 错误：使用数值型的字符串索引，有时会得到完全不同的Animal! 这是因为当使用 number来索引时，JavaScript会将它转换成string然后再去索引对象。 也就是说用 100（一个number）去索引等同于使用"100"（一个string）去索引，因此两者需要保持一致。
interface NotOkay {
  [x: number]: Animal
  [x: string]: Dog
}
```

### 类类型

接口也可以限制某个类的行为

```ts
interface ClockInterface {
  currentTime: Date
  setTime(d: Date)
}

class Clock implements ClockInterface {
  currentTime: Date
  setTime(d: Date) {
    this.currentTime = d
  }
  constructor(h: number, m: number) {}
}
```

**疑难点：**
一个类实现接口时，静态部分和实例部分是要分开处理的

官网示例代码如下：

```ts
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface
}
interface ClockInterface {
  tick()
}

function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
  return new ctor(hour, minute)
}

class DigitalClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {
    console.log('beep beep')
  }
}
class AnalogClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {
    console.log('tick tock')
  }
}

let digital = createClock(DigitalClock, 12, 17)
let analog = createClock(AnalogClock, 7, 32)
```

个人觉得很麻烦，实际上目的就是检验构造器参数类型，没搞懂为啥要定义函数去处理，可能后面遇到实际场景会更好理解
2020-02-04 00:22:14

```ts
interface ClockInterface {
  tick()
}

class Clock implements ClockInterface {
  tick() {}
  constructor(hour: number, minute: number) {}
}

let clock = new Clock(1, 1)
// 这样也能检验构造器类型
```

## 三、类

### 公共，私有与受保护的修饰符

#### public

在上面的例子里，我们可以自由的访问程序里定义的成员。 如果你对其它语言中的类比较了解，就会注意到我们在之前的代码里并没有使用 public 来做修饰；例如，C#要求必须明确地使用 public 指定成员是可见的。 在 TypeScript 里，成员都默认为 public。

你也可以明确的将一个成员标记成 public。 我们可以用下面的方式来重写上面的 Animal 类：

```ts
class Animal {
  public name: string
  public constructor(theName: string) {
    this.name = theName
  }
  public move(distanceInMeters: number) {
    console.log(`${this.name} moved ${distanceInMeters}m.`)
  }
}
```

#### private

当成员被标记为**private**时，它就不能在类外部被访问。也就是只能在用于它的类里面访问

子类不能继承

```ts
class Animal {
  private name: string
  constructor(theName: string) {
    this.name = theName
  }
}
new Animal('cat').name // Error,name is private
```

#### protect

protected 修饰符与 private 修饰符的行为很相似，但有一点不同， protected 成员在子类中能被继承。

类的实例不能访问

构造函数也可以被标记成 protected。 这意味着这个类不能在包含它的类外被实例化，但是能被继承

```ts
class Person {
  protected name: string
  constructor(name: string) {
    this.name = name
  }
}

class Employee extends Person {
  private department: string
  constructor(name: string, department: string) {
    super(name)
    this.department = department
  }
  public getElevatorPitch() {
    // 这里访问了父类声明为 protect 的属性
    return `Hello,my name is ${this.name} and I word in ${this.department}`
  }
}

let howard = new Employee('Howard', 'Sales')
console.log(howard.getElevatorPitch())
console.log(howard.name) // 属性“name”受保护，只能在类“Person”及其子类中访问
```

### 静态属性

类的静态成员，这些属性存在于类本身上面而不是类的实例上

要通过类本身来访问。如：Grid.origin

不能被继承

实例也不能访问

```ts
class Grid {
  static origin = { x: 0, y: 0 }
  calculateDistanceFromOrigin(point: { x: number; y: number }) {
    let xDist = point.x - Grid.origin.x
    let yDist = point.y - Grid.origin.y
    return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale
  }
  constructor(public scale: number) {}
}

let grid1 = new Grid(1.0) // 1x scale
let grid2 = new Grid(5.0) // 5x scale

console.log(grid1.calculateDistanceFromOrigin({ x: 10, y: 10 }))
console.log(grid2.calculateDistanceFromOrigin({ x: 10, y: 10 }))
```

## 四、泛型

为考虑复用性，使相关代码不仅支持当前数据类型，还能兼顾未来的数据来袭，所以有泛型这个东西。

### 简单示例

示例里我们声明了一个**类型变量:T**，只用于表示类型而不是值

T 帮助我们捕获用户传入的类型（比如：number），之后我们就可以使用这个类型。 之后我们再次使用了 T 当做返回值类型。

```ts
function identity<T>(arg: T): T {
  return arg
}
```

泛型函数有两种调用方式，第一种是传入所有参数

```ts
let output = identity<String>('string')
```

第二种是只传入参数，利用类型推断，由编译器来判断

```ts
let output = identity('string')
```

### 使用泛型变量

在泛型函数中使用泛型变量时，必须把它当作是任意类型或所有类型。

比如，打印未正确声明类型的泛型变量的长度时就会报错，因为有可能传入的类型并没有 **.length** 属性

```ts
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length) // Error: T doesn't have .length
  return arg
}
```

但是假设我们访问的是 T 类型的数组就可以访问到.length 属性

```ts
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length) // Array has a .length, so no more error
  return arg
}
```

### 泛型类型

上面声明的是函数的参数和返回值的泛型，下面是函数本身的泛型

```ts
function indetity<T>(arg: T): T {
  return arg
}
// 也没啥不同，就是声明函数类型前面不是具体的类型声明，而是泛型
let myIdentity1: <T>(arg: T) => T = indetity

// 不同泛型变量名也行，只要数量和使用方式对得上
let myIdentity2: <U>(arg: U) => U = identity
```

也可以声明泛型接口

可以把泛型参数当作整个接口的一个参数，这样更清晰

```ts
interface GenericIdentityFn<T> {
  (arg: T): T
}

function identity<T>(arg: T): T {
  return arg
}

let myIdentity: GenericIdentityFn<number> = identity
```

### 泛型类

除了泛型接口，我们还可以创建泛型类。

```ts
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}

// 类型定义为number时，类的属性是值时要为number；为函数时返回值要是number
let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function(x, y) {
  return x + y
}

// 错误代码
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}

let myGenericNumber = new GenericNumber<string>()
// 不能将类型“0”分配给类型“string”。
myGenericNumber.zeroValue = 0
// 不能将类型“(x: string, y: string) => number”分配给类型“(x: string, y: string) => string”。
myGenericNumber.add = function(x, y) {
  return parseInt(x + y)
}
```

### 泛型约束

在**使用泛型变量**这一章节中，有提到泛型应为任意类型，所以访问有可能其他类型不带有的属性时会报错，比如传入的是 **number** 类型去访问 **.length** 时就会报错。

接下来创建一个包含 .length 属性的接口，使用这个接口和 extends 关键字来实现约束

```ts
interface Lengthwise {
  length: number
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length) // 现在我们知道arg一定会有.length，所以在声明函数阶段不会报错
  return arg
}

loggingIdentity(3) // Error：类型“3”的参数不能赋给类型“Lengthwise”的参数。

loggingIdentity({ length: 10, value: 3 }) // 传入的参数有length属性 不会报错
```

#### 在泛型约束中使用类型 参数

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}

let x = { a: 1, b: 2, c: 3, d: 4 }

getProperty(x, 'a') // okay
getProperty(x, 'm') // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
```

## 五、枚举

使用枚举我们可以定义一些带名字的常量。 使用枚举可以清晰地表达意图或创建一组有区别的用例。 TypeScript 支持数字的和基于字符串的枚举。

### 数字枚举

```ts
// 枚举的第一位赋值为1，也就是使用了初始化器，那么其余成员会从1自动增长。
enum Direction {
  Up = 1,
  Down,
  Left,
  Right
}
// 使用枚举则是通过其属性来访问成员
enum Response {
  No = 0,
  Yes = 1
}

function respond(recipient: string, message: Response): void {
  // ...
}

respond('Princess Caroline', Response.Yes)
```

如果枚举某个成员的前一位成员的值不是初始化器，则其需要初始化器

```ts
enum E {
  A,
  B = getSomeValue(),
  C = 1,
  D = getSomeValue(),
  E // error! 'D' is not constant-initialized, so 'E' needs an initializer
}
```

### 字符串枚举

字符串枚举的每个成员都应该有初始化器，当字符串枚举的第一个成员没有初始化器时，它的值为数字 0，也就说明了枚举可以数字和字符串共存，但是这是不规范的。

```ts
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}
```

## 六、类型兼容性

TypeScript 结构化类型系统的基本规则是，如果 x 要兼容 y，那么 y 至少具有与 x 相同的属性。比如：

```ts
interface Named {
  name: string
}

let x: Named
// y's inferred type is { name: string; location: string; }
let y = { name: 'Alice', location: 'Seattle' }
x = y
y = x // Property 'location' is missing in type 'Named' but required in type '{ name: string; location: string; }'.
```

### 比较函数

函数也是同理

x 的每个参数在 y 中都能找到相应类型的参数，所以 x 可以赋值给 y。但是反过来，y 的参数 s 在 x 中却找不到对应类型的参数所以第一个赋值表达式是错误的

```ts
let x = (a: number) => 0
let y = (b: number, s: string) => 0

y = x // OK
x = y // Error
```

## 七、高级类型

### 交叉类型

也就是 a 继承了两个接口的所有属性

```ts
interface A {
  name: string
  age: number
  sayName: (name: string) => void
}
interface B {
  name: string
  gender: string
  sayGender: (gender: string) => void
}

let a: A & B

// 都是合法的
a.age
a.sayName
```

### 联合类型

Date 构造函数接受一个 number 或 string 或 Date 类型的参数，对应类型为 number | string | Date。

联合类型 Bird | Fish 要么是 Bird 要么是 Fish，因此只有所有源类型的公共成员（“交集”）才能访问。

```ts
interface Bird {
  fly()
  layEggs()
}

interface Fish {
  swim()
  layEggs()
}

function getSmallPet(): Fish | Bird {
  // ...
}

let pet = getSmallPet()
pet.layEggs() // okay
pet.swim() // errors
```

### 类型保护与区分类型（Type Guards and Differentiating Types）

继续沿用上面的例子，当想要判断是否有 pet.swim 后访问 pet.swim 时，以往的 js 写法如下：

```ts
// 每一个成员访问都会报错
if (pet.swim) {
  pet.swim()
} else if (pet.fly) {
  pet.fly()
}
```

这时就会报错，为了让这段代码不得不使用类型断言，但是如果判断很多的话就得一直使用断言很麻烦，所以 ts 有自定义的类型保护

```ts
if ((pet as Fish).swim) {
  ;(pet as Fish).swim()
} else if ((pet as Bird).fly) {
  ;(pet as Bird).fly()
}
```

### 自定义的类型保护

类型保护就是一些表达式，它们会在运行时检查以确保在某个作用域里的类型。 要定义一个类型保护，我们只要简单地定义一个函数，它的返回值是一个 类型谓词：

在这个例子里，pet is Fish 就是类型谓词。 谓词为 parameterName is Type 这种形式，parameterName 必须是来自于当前函数签名里的一个参数名。

每当使用一些变量调用 isFish 时，TypeScript 会将变量缩减为那个具体的类型，只要这个类型与变量的原始类型是兼容的。

```ts
function isFish(pet: Fish | Bird): pet is Fish {}

// 'swim' 和 'fly' 调用都没有问题了
if (isFish(pet)) {
  pet.swim()
} else {
  pet.fly()
}
```

### 使用**in**操作符

**in**操作符可以作为类型细化表达式来使用。

对于**n in x**表达式，其中**n**是字符串字面量或字符串字面量类型且**x**是个联合类型，那么**true**分支的类型细化为有一个可选的或必须的属性**n**，**fals**e 分支的类型细化为有一个可选的或不存在属性**n**。

```ts
function move(pet: Fish | Bird) {
  if ('swim' in pet) {
    return pet.swim()
  }
  return pet.fly()
}
```

### **typeof**类型保护

和js的用法类似

```ts
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value
  }
  if (typeof padding === 'string') {
    return padding + value
  }
  throw new Error(`Expected string or number, got '${padding}'.`)
}
```
