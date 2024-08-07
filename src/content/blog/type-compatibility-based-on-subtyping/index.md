---
author: Kim
title: Typescript基于子类型的类型兼容性
pubDatetime: 2022-10-26T12:16:04.384Z
slug: type-compatibility-based-on-subtyping
description: Typescript基于子类型的类型兼容性分析。
featured: true
draft: false
tags:
  - Typescript
---

## 目录

# 前言

类型兼容性是指一个类型能否赋值给另外一个类型的约束。不同于一些强类型语言的`标明类型系统`（如C++、Rust、Java等），它们必须保证赋值与被赋值两者的类型签名一直才能完成赋值操作，而对于TS这种`结构化类型系统`来说，任意两个类型只要以相同的结构描述，那么它们就是等价的。

例如：

```rust
struct A {
  name: String,
}
struct B {
  name: String,
}
let mut a = A { name: String::new() };
let mut b = B { name: String::new() };
a = b; //  mismatched types expected struct `A`, found struct `B`
```

```ts
interface A {
  name: string;
}
interface B {
  name: string;
}

let a: A = { name: "hello" };
let b: B = { name: "world" };
a = b;
b = a;
```

在Rust类型系统下，不同的类型签名结构相同是不兼容的，在TS类型系统下，只要结构相同，那么就两个类型就是兼容的。

# 基于子类型的类型兼容性

首先明确一下类型兼容性的方向。当一个类型`Y`可以被赋值给另外一个类型`X`时，则可以称类型`X`兼容类型`Y`。

> 即： X 兼容 Y -> X = Y

类型兼容性包含两个方面：

- 等价性
- 子类型兼容性

等价性是结构化类型系统相同结构的类型等价特点，在上面已经说了，这里来探讨一下子类型兼容性。

子类型实际上是面向对象中继承中的概念，当一个类型A继承自类型B时，则类型A是类型B的子类型，即表示`A <: B`，类型兼容性上则表示 `B兼容A`。

子类型理论主要分为两类：

- 名义子类型
- 结构子类型

名义子类型顾名思义就是只有通过特定语言的继承关系得到的类型才能被称为子类型，也就是说父子关系必须通过继承语法显示名声。C++、Java等属于这一类，TS也有这个特性。

```ts
class User {
  username: string;
  constructor(username: string) {
    this.username = username;
  }
}
class Admin extends User {
  isAdmin: boolean;
  constructor(username: string) {
    super(username);
    this.isAdmin = true;
  }
}
```

我们来写一个`logUsername`函数来测试一下兼容性。

```ts
const logUsername = (user: User) => {
  console.log(user.username);
};
logUsername(new User("kim")); // ✅
logUsername(new Admin("kim")); // ✅
```

结构子类型表示只要两种类型的结构组成符合父子类型关系，那么其中一种类型就是另外一种类型的子类型。我们把上面两个类型使用结构化来重写一下。

```ts
const structAdmin = {
  isAdmin: true,
  username: "kim",
};

const structUser = {
  username: "kim",
};

logUsername(structAdmin); // ✅
logUsername(structUser); // ✅
```

结构化父子类型现在已经有了一定的了解，我们来写一个泛型函数来判断一个类型是否是另外一个类型子类型。

```ts
type IsSubtypeOf<S, P> = S extends P ? true : false;
```

使用上面的类型来测试一下

```ts
type T1 = IsSubtypeOf<Admin, User>; // true
type T2 = IsSubtypeOf<typeof structAdmin, typeof structUser>; // true
```

## 基础类型

基础类型没有引用类型那么多的变体，因此只有相同的类型才会兼容。

```ts
let num = 123;
let str = "123";
num = str; // err
str = num; // err
```

比较可讨论的是`any`和`unknown`这两个类型。从子类型概念上来讲，它俩是所有类型的父类型，因为它们兼容所有类型，甚至彼此，唯一的区别是`unknown`是类型安全的，而`any`不是。

```ts
const anyParams = (v: any) => {
  v.length;
};

const unknownParams = (v: unknown) => {
  v.length(
    // error
    v as string
  ).length;
};
```

使用`any`作为类型标识可以认为对当前类型放弃类型检查，想怎么操作都可以；而使用`unknown`作为类型标识对他访问任何属性都会报错，使用者必须通过类型断言告诉编辑器它是什么类型，所以这里推荐使用`unknown`。

## 联合类型与交叉类型

说到联合类型和交叉类型我们首先想到的是交并集，TS类型系统所有的类型（基础类型和引用类型）都可以作为联合类型和交叉类型的一项，因此尝试使用交并集去理解它们可能会有一些困惑。比如：

```ts
type T1 = string | number; // string | number
type T2 = string & number; // never
type T3 = { name: string } | { age: number }; // {name: string} | {age: number}
type T4 = { name: string } & { age: number }; // { name: string, age: number }
```

❓到底是交集还是并集？
既然是类型，那么它们必然遵守类型兼容性理论，因此下面我们使用子类型来研究这俩。

### 联合类型

联合类型是将多个类型通过`|`连接起来，它兼容被联合的每一个类型，每一个类型的值都可以赋值与它，但在使用时只能访问联合类型中共有的属性和方法。

```ts
let t1: string | number;
t1 = "123";
t1 = 123;

let t1: string | Array<string>;
t1.length;
```

从子类型角度上看联合类型成为了每个类型的父类型，我们使用`IsSubtypeOf`来验证一下。

```ts
type T1 = IsSubtypeOf<string, string | number>; // true
type T2 = IsSubtypeOf<number, string | number>; // true
```

### 交叉类型

交叉类型是将多个类型通过`&`连接起来，它是一个可以把基础类型交叉成`never`、把引用类型交叉成属性并集的特殊操作，这种情况下看感觉使用交并集都没办法解释它。

从子类型角度上如果说联合类型是创建共有父类型的过程，那么交叉类型就是创建共有子类型的过程。

> 注意：无论是创建共有子类还是创建共有父类都是在类型兼容的基础上，和类型本身没什么关系。

首先来看一下`never`，它表示从来都不会发生的类型，其实从实际例子上也可以看出例如`string & number`是怎么想都不可能存在的类型。`never`不兼容所有类型，但它又被所有类型所兼容，因此从类型兼容性上讲`never`是所有类型的子类型。

```ts
let never: never;
let str: string;
let num: number;
never = str; // error 不兼容
never = num; // error 不兼容
str = never;
num = never;
```

这样就可以说的通为什么`string & number`是`never`了，因为`string`和`never`的共有子类型是`never`，而 交叉类型 是创建共有子类型的过程，因此`string & number`是`never`。

接下来我们来看一下引用类型的交叉类型。例如有如下类型：

```ts
let nameInfo: {
  name: string;
  getVal: () => string;
};
let ageInfo: {
  age: number;
  getVal: () => number;
};
```

我们有一个`nameInfo`和`ageInfo`两个变量，它们的类型如上所示。
根据交叉类型的特性，`typeof nameInfo & typeof ageInfo`生成的类型包含两者所有的特性。

```ts
let nameAndAgeInfo: typeof nameInfo & typeof ageInfo;

nameAndAgeInfo.getVal(); // (() => string) & (() => number)
nameInfo = nameAndAgeInfo; // 兼容
nameAndAgeInfo = nameInfo; // error 不兼容
ageInfo = nameAndAgeInfo; // 兼容
nameAndAgeInfo = ageInfo; // error 不兼容
```

## 协变与逆变

协变与逆变并不是TS独有的概念，它们是语言层面类型系统中子类型兼容性方向的表述。

### 协变

我们先来看一下`协变`的定义。

> 一个类型T是协变的，如果有 `S <: P`，则有 `T<S> <: T<P>`

简单的说如果一个类型是协变的，那么通过这个类型生成的父子类型的兼容性和原父子类型的兼容性方向是一致的。

我们先拿`Promise`这个类型来举例，`Promise`也是一个协变。

```ts
type T1 = IsSubtypeOf<Admin, User>; // true
type T2 = IsSubtypeOf<Promise<Admin>, Promise<User>>; // true
```

可以看出它们的兼容性方向是不变的。
我们所写的大部分类型函数都是协变的，TS本身也有许多类型是协变的，比如：

```ts
// Record
type T1 = IsSubtypeOf<Record<string, Admin>, Record<string, User>>; // true
// Map
type T2 = IsSubtypeOf<Map<string, Admin>, Map<string, User>>; // true
// Fn return type
type CreateFnReturn<T> = (args: any) => T;
type T3 = IsSubtypeOf<CreateFnReturn<Admin>, CreateFnReturn<User>>; // true
// Array
type T4 = IsSubtypeOf<Array<Admin>, Array<User>>; // true
//...
```

### 逆变

我们还是先来看下`逆变`的定义。

> 一个类型T是逆变的，如果有`S <: P`，则有 `T<P> <: T<S>`

简单的说如果一个类型是逆变的，那么通过这个类型生成的父子类型的兼容性和原父子类型的兼容性方向是相反的。

目前我所了解到的逆变位置只有函数参数位置，例如：

```ts
type CreateFnParams<T> = (args: T) => void;

type T1 = IsSubtypeOf<Admin, User>; // true
type T2 = IsSubtypeOf<CreateFnParams<User>, CreateFnParams<Admin>>; // true
```

可以看到使用`CreateFnParams`创建的父子类型和原父子类型的兼容方向是相反的。

当然在TS里函数参数位置也是可以`协变`，社区把这块叫做`双向协变`，这是TS语言类型系统一个特殊的地方，其他语言里貌似没有这个特点。

```ts
type T3 = IsSubtypeOf<CreateFnParams<Admin>, CreateFnParams<User>>; // true
```

## 函数子类型

TS类型系统到目前位置还差一个类型没有讲，那就是函数子类型。从`逆变与协变`中我们知道函数的参数位置是`逆变`（也可以说双向协变，这里我们严格些），返回值位置是`协变`，这也就得出函数子类型若要形成父子关系就必须满足这个条件。

```ts
class Kim extends Admin {
  skills: string[];
  constructor(username: string, isSuperAdmin: boolean, skills: string[]) {
    super(username, isSuperAdmin);
    this.skills = skills;
  }
}
let fn1 = (val: Admin): User => val as User;
let fn2 = (val: User): Admin => val as Admin;
let fn3 = (val: Kim): Kim => val as Kim;

fn1 = fn2; // 兼容
fn1 = fn3; // 兼容
fn2 = fn3; // 兼容
fn2 = fn1; // error 不兼容
```

上面代码又写了一个`Kim`类继承自`Admin`，然后写了3个不同参数不同返回值的函数，兼容性如上所示。

到此基本上所有的类型兼容性差不多讲完了，我们最后来分析一个技巧，也就是在写类型函数中经常用到的`联合类型转交叉类型`，我们都知道这个技巧是用到了函数类型参数位置的`协变`，那到底是怎么转成的呢？我们来一探究竟。

首先贴上联合类型转交叉类型的代码。

```ts
type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer V) => void
  ? V
  : never;
```

联合类型转交叉类型的基本原理就是利用联合类型的分布式条件类型构造函数的联合类型，然后去推断参数位置的类型。我们来写一个简单的例子看一下。

```ts
type Name = {
  name: string;
};

type Age = {
  age: number;
};
type T1 = UnionToIntersection<Name | Age>; // {name: string} & {age: number}
```

我们来分析一下上面代码，经过分布式条件类型处理后得到：

```ts
((arg: Name) => void | (arg: Age) => void) extends (arg: infer V) => void ? V : never
```

根据函数子类型理论我们知道，要想上面代码成立，`((arg: Name) => void | (arg: Age) => void)` 必须是`((arg: infer V) => void)`的子类型, 而`infer`会尽可能的满足成立的条件，因此根据函数类型参数位置的`逆变`理论,`V`是`Name | Age`的共有子类型，上面我们有讲过，创建共有子类型的方式是交叉类型，因此`V`的类型为`Name & Age`。
