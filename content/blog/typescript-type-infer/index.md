---
title: TypeScript类型推断机制
date: 2019-12-30
ns: blog
description: 探究Typescript中的类型推断机制
# socialImage:
---

所谓类型推断是指：当我们在写代码的时候并不需要指定变量的类型或者函数的返回值，TypeScript 可以根据已写的代码和自身的某些规则自动的推断出一个类型。

类型推断主要分为以下三种：

- 基础类型推断
- 最佳通用类型推断
- 上下文类型推断

### 基础类型推断

基础类型推断是指一些比较简单、一眼就能看出来的的类型，看一下实例:

```ts
let a
let b = 1
let c = [1]
let d = (x = 1) => x + 1
```

上面代码中 a 会被推断成 any 类型、b 会被推断成 number 类型、c 会被推断成 number 数组、d 会被推断成参数可选类型为 number 类型并且返回值也是 number 类型的函数。如下：

```ts
let a: any
let b: number = 1
let c: number[] = [1]
let d: (x?: number) => number = (x = 1) => x + 1
```

### 最佳通用类型推断

当需要从多个类型中推断出一个类型时，例如从一个数组的元素中推断出数组的类型，TypeScript 会推断出一个通用类型，这就是最佳通用类型推断。

```ts
let arr = [1, '1'] // (string | number)[]
let arr = [1, '1', true] // (string | number | boolean)[]
let arr = [1, '1', true, undefined] // (string | number | boolean)[]
let arr = [1, '1', true, undefined, null] // (string | number | boolean)[]
let arr = [1, '1', true, undefined, null, []] // (string | number | boolean | any[])[]
let arr = [1, '1', true, undefined, null, [], {}] // {}[]
```

### 上下文类型推断

举个 🌰：

```ts
window.onKeypress = function (event) {}
```

例如上面的时间绑定，此时 TypeScript 会根据左侧的事件绑定推断出事件处理函数参数的类型，当我们在事件处理函数中取 event 的属性的时候会出现语法提示，并且当取了一个 event 上不存在的值的时候 TypeScript 编译器会报错。

```ts
window.onKeypress = function (event) {
  console.log(evnet.target)
  console.log(event.button) //error
}
```

### 总结

使用类型推断可以让我们在写 TS 代码的时候少些一些代码，通过推断机制推断出最佳的类型。
