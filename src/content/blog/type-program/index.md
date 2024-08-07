---
title: Typescript类型编程
pubDatetime: 2022-10-27T12:16:04.384Z
description: Typescript类型编程方法理论
featured: false
draft: false
tags:
  - Typescript
---

在读本篇文章之前建议先去看下[基于子类型的类型兼容性](../type-compatibility-based-on-subtyping)，在了解类型兼容性的基础上看类型编程相当于在了解一门语言类型的基础上学习语法。

首先问大家一个问题：TS（严格的说TS类型系统）在大家眼里是一门语言还是只是对JS的增强？可能答案各有不同，如果你把TS类型系统当做一门语言来看待的话，那么类型编程应该不成问题。TS类型系统是图灵完备的，它包含语言中最基本的语法规则，做比较基础计算是不成问题的。

# 语言共性

从语言范式上来看TS类型编程更像是函数式编程，这一点在泛型函数上体现的更为明显。接下来我们从语言共性层面来探讨一下TS类型编程。

当我们想要使用一门新的语言来编程或者说写算法的时候，首先要了解这门语言的语法以及API使用，只有知道语言的语法和API如何使用后才能让我们使用它编程时候更得心应手的去处理数据返回问题想要的结果。

很遗憾TS类型系统并没有提供一些常用的API，这种情况如果我们想要去使用比如数组的`push`、`pop`等方法时需要我们手动去实现。面试的时候手写各种实现是不是很熟悉😁。

因此我们通过学习语法来熟悉TS类型系统并且使用它来编程。一门基础的语言若要做到可编程性，需要有以下能力：

- 变量声明
- 函数声明
- 条件判断
- 循环

这里我们使用和JS对比的方式来看下TS类型系统所支持的语法是什么样子的。

|          |    Javascript语法     | Typescript类型系统语法 |
| :------: | :-------------------: | :--------------------: |
| 变量声明 | `var`、`let`、`const` |  `type`、`interface`   |
| 函数声明 |      `function`       |       `泛型函数`       |
| 条件判断 |       `if/else`       |  `类型兼容性 extends`  |
|   循环   |    `for`、`while`     |     `泛型函数递归`     |

## 变量声明

JS声明的变量是某个固定的值，而TS类型声明的变量是类型别名也可以说某个类型。

```ts
// js
const val = "Hello world"; // 值

// ts type
type Val = "Hello world"; // 类型
```

## 函数声明

函数具有封装性，是一段可复用的代码，可以接受参数、返回结果以及定义局部变量。我们来看一下二者的对比。

```ts
// js
function getHello(name: string) {
  const hello = "hello";
  return `${hello} ${name}`;
}

// ts type
type GetHello<N extends string, H = "hello"> = `${H} ${N}`;
```

可以看出TS类型函数的输入以及局部变量都为泛型函数的参数，返回值则是泛型函数的返回值。

一般遇到这种需要写局部参数的泛型函数我都会额外定义一个泛型函数。

```ts
type _GetHello<N extends string, H = "hello"> = `${H} ${N}`;
type GetHello<N extends string> = _GetHello<N>;
```

## 条件判断

TS类型的条件判断是通过类型兼容性来实现的，也就是`extends`关键字。

```ts
// js
if true {
  console.log(1)
} else {
  console.log(2)
}

// ts type

type If<T extends boolean> = T extends true ? 1 : 2
```

由于是类型兼容性，有时候单靠`extends`并不能保证两个类型相等，必要时可以使用双向`extends`来判断类型是否相等。

```ts
type IsEqual<T, U> = T extends U ? (U extends T ? true : false) : false;
```

再者，如果你想区分引用类型的属性中是否存在readonly或者判断类型是否为never，那么就需要使用严格判断。

```ts
export type StrictlyEqual<X extends unknown, Y extends unknown> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
```

这个主要使用用到了函数的返回值位置延时条件类型的一致性检查，这里就不多说了，感兴趣的话可以去看一下官网。

## 循环

TS类型的循环是通过泛型函数递归来实现，这很函数式。我们来写一个addOne的函数来看一下TS循环递归是如何做的。

```ts
// js
function addOne(a: number) {
  return a + 1;
}

// ts type
type ArrayFromNum<
  T extends number,
  A extends any[] = [],
> = A["length"] extends T ? A : ArrayFromNum<T, [...A, ""]>;

type Add<N extends number> = [...ArrayFromNum<N>, ""]["length"];
```

对于JS来说我们直接通过加法操作符对其传入的参数进行加一操作，而TS类型中则没有加一操作符，因只能通过特殊的方式来实现加一。

这里我们通过`ArrayFromNum`来生成一个长度为`N`的数组，然后再往数组里塞入一个元素，此时数组的长度为`N + 1`，然后取数组的长度实现加一。

# 编程实践

趁热打铁找一个简单的算法使用类型编程来实现一下。就以斐波那契数列算法题为例。

> 输入一个正整数，输出这个数的斐波那契数。

斐波那契数列大家都知道，第1位和第2位都是1，其他则遵循`f(n) = f(n - 1) + f(n - 2)`。
使用JS语言实现非常简单，根据公式写了递归就完事，为了方便后续分析我们采用dp的方式来写。

```ts
const fibonacci = n => {
  // if ( n < 2 ) {
  //   return n
  // }
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
};
```

那么使用TS类型编程这道题要怎么写呢？

```ts
type Fibonacci<T extends number> = ...
```

我们来分析一下JS代码：

1. dp数组，存储从0到n的斐波那契数
2. 循环，自底向上遍历，每次+1计算当前数的斐波那契数
3. 状态转移方程：取i-1和i - 2的斐波那契数数相加得到当前数的斐波那契数

由上述分析我们可以确定 斐波那契泛型函数 局部变量定义：

1. dp数组
2. 循环自增i
3. dp[i - 1]
4. dp[i - 2]

因此定义变量的泛型如下：

```ts
type Fibonacci<
  T extends number
  I extends number = 1
  DP extends unknown[][] = [[], ['']]
  II extends number = Add<I>
  L extends unknonw[] = Last<DP>
  LL extends unknown[] = Last<Pop<DP>>
> = ...
```

先来解释一下类型定义：

- T: 输入的数字
- I：循环初始值，这里说一下为什么是1，因为DP初始两个元素数组表示0，1，当T为I时直接取L的长度即可。
- II：i++
- DP：dp数组，这里用二维数组是因为类型数字运算通过数组元素个数变更来实现，直接使用数组避免数字转数组这一步。
- L：dp[i - 1]
- LL: dp[i - 2]

说到这里函数体基本上已经能想到了。

```ts
type Fibonacci<
  T extends number
  I extends number = 1
  DP extends unknown[][] = [[], ['']]
  II extends number = Add<I>
  L extends unknonw[] = Last<DP>
  LL extends unknown[] = Last<Pop<DP>>
> = I extends T
      ? L['length']
      : Fibonacci<T, II, [...DP, [...L, ...LL]]>
```

我们发现代码里还有三个类型函数没有实现分别是`Add`、`Last`以及`Pop`，`Add`泛型函数在上面已经实现过了，剩下两个函数我们来实现一下。

```ts
type Last<T extends unknown[]> = T extends [...infer _, infer R] ? R : never;
type Pop<T extends unknown[]> = T extends [...infer R, infer _] ? R : never;
```

`Last`和`Pop`也是比较简单，使用infer推断一下就ok，致此斐波那契数列类型编程就基本实现了。

> 需要注意的是`Fibonacci`泛型函数只能计算到20,20的斐波那契数已经是6765，超过这个数组TS会抛出‘生成的元组过大，无法表示’。
