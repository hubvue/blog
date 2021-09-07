---
title: 解读utility-types
date: 2020-08-13
ns: blog
description: 本篇文章用于解读utility-types包中mapped-types文件下的高级类型实现
# socialImage:
---

之前有系统的学过 Typescript，并且可以在项目中使用一些基本的类型定义，但是对于高级类型却一知半解，看到一些项目或者库中写的高级类型完全是懵逼的状态，于是就决定想办法去改变这种状态。忘记是哪位大神说过：`看源码是最好的学习方式`，于是就决定找个专门做 Typescript 类型的库读读源码。通过同事推荐了两个比较好的库：`utility-types`和`ts-toolbelt`,权衡下`utility-types`star 比较多并且用的也比较多，那就它吧，之后再对`ts-toolbelt`进行解读。

本篇文章主要是对`mapped-types.ts`文件中的类型进行解读。

### SetIntersection

在 Typescript 内置的类型 API 中有个 `Extract` 类型，`SetIntersection` 类型的作用于 `Extract` 是相同，作用都是从类型 A 中获取可兼容类型 B 的类型，大致意思就是获取两个类型的交集。多用于联合类型。

内置的 `Extract` 类型的实现方式和 `SetIntersection` 是相同的

**实现**

```ts
type SetIntersection<A, B> = A extends B ? A : never
```

**示例**

```ts
type SetIntersectionResult = SetIntersection<'a' | 'b' | 'c', 'c' | 'b'> // 'b' | 'c'
```

上面示例结果是怎么得到的呢？我们都知道条件类型作用于联合类型上会变成分布式条件类型，结合上面示例和源码解释下：

```ts
'a' | 'b' | 'c' extends 'c' | 'b' ? 'a' | 'b' | 'c' : never =>
('a' extends 'c' | 'b' ? 'a' : never) |
('b' extends 'c' | 'b' ? 'b' : never) |
('c' extends 'c' | 'b' ? 'c' : never) =>
never | 'b' | 'c' => 'b' | 'c'
```

### SetDifference

与 TypeScript 内置的 `Exclude` 类型相同，`SetDifference` 类型用于获取类型 A 中不可兼容类型 B 的类型
，大致意思是取类型 B 在类型 A 上的补集，多用于联合类型。

**实现**

```ts
type SetDifference<A, B> = A extends B ? never : A
```

**示例**

```ts
type SetDifferenceResult = SetDifference<'a' | 'b' | 'c', 'b'> // 'a' | 'c'
```

上面示例结果是怎么得到的呢？其实和上一个类型的运算结果大致相同，结合示例和源码解释下：

```ts
'a' | 'b' | 'c' extends 'b' ? never : 'a' | 'b' | 'c' =>
('a' extends 'b' ? never : 'a') |
('b' extends 'b' ? never : 'b') |
('c' extends 'b' ? never : 'c') =>
'a' | never | 'c' => 'a' | 'c'
```

源码里还有个类型`SetComplement`，但是实现方式和`SetDifference`相同，只是约束了泛型 B 必须为泛型 A 的子类型，具体就不分析了。

```ts
type SetComplement<A, A1 extends A> = A extends A1 ? never : A
```

### SymmetricDifference

`SymmetricDifference`用于获取类型 A、B 的交集在并集上的补集，多用于联合类型。

**实现**

```ts
type SymmetricDifference<A, B> = SetDifference<A | B, SetIntersection<A, B>>
```

emmmm...有点绕，看个 🌰 吧

```ts
type SymmtricDifferenceResult = SymmetricDifference<
  '1' | '2' | '3',
  '2' | '3' | '4'
> // '1' | '4'
```

例子中两个类型并集为： `'1' | '2' | '3' | '4'`，交集为`'2' | '3'`，因此交集在并集上的补集为`'1' | '4'`。

是怎么做到的呢？从源码中可以看出来，我们用到了`SetDifference`和`SetIntersection`两个类型，并且这两个类型是在之前实现过的，通过组合的方式形成一个功能更加强大的类型。

源码中的解法是这样的：通过 `A|B`获取到 A、B 类型的并集，然后再通过`SetIntersection`类型获取到 A、B 类型的交集，最后再使用`SetDifference`类型求补集得出结果。

### NonUndefined

`NonUndefined`类型用于过滤掉联合类型中的 undefined 类型。

**实现**

```ts
type NonUndefined<T> = T extends undefined ? never : T
```

源码中的实现是上面这样的，下面是借用`SetDifference`的实现。

```ts
type NonUndefined<T> = SetDifference<T, undefined>
```

**示例**

```ts
type NonUndefinedResult = NonUndefined<string | null | undefined> // string | null
```

想要看到上面效果，你需要在 tsconfig.json 中将`strictNullChecks`设置为 true，严格来检查 null 类型，如果不开启的话 ts 就默认 undefined 与 null 是兼容的，所以就会将 null 类型过滤掉。

### FunctionKeys

`FunctionKeys`用于获取对象类型中值为函数的 key。

**实现**

```ts
type FunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never
}[keyof T]
```

源码里是上面这样实现的，但是有些缺陷，在分析原理的时候再说为什么时候缺陷的。

**示例**

```ts
type MixedProps = {
  name: string
  setName: (name: string) => void
  someKeys?: string
  someFn?: (...args: any) => any
  undef: undefined
  unNull: null
}
type FunctionKeysResult = FunctionKeys<MixedProps> //"setName" | "someFn" | "undef"
```

咦，不应该是`"setName" | "someFn"`么，为什么多了两个呢？我们先来分析一下这个类型是怎么实现的，在分析过程中找 bug。

`FunctionKeys`接受的是一个对象类型，因此可以使用索引查询操作符遍历对象类型的每一个 key 值，遍历过程中首先通过`NonUndefined`过滤掉 undefined 类型，然后 extends Function，检测可兼容 Function 类型，那么这个 key 的值类型就是一个函数类型，但是当值类型为 undefined 的时候，会被`NonUndefined`解为 never，然而 Function 类型是兼容 never 的。所以`undef`就被保留了下来。

于是我在源码的基础上改了改。

```ts
type FunctionKeys<T extends object> = {
  [P in keyof T]-?: SetIntersection<NonNullable<T[P]>, Function> extends never
    ? never
    : P
}[keyof T]
```

具体思路是在遍历过程中先将值类型为 undefined、null 的 key 的值类型转为 never，然后再与 Function 取交集，也就是说将所有值类型不是函数类型的都转为 never，由于 never 类型只对自身兼容，所以再判断值类型是否兼容 never 类型，将所有的值为 never 类型的 key 过滤掉，最后再通过索引查询操作符获取到值类型的联合类型即可。

### NonFunctionKeys

`NonFunctionKeys`用于获取对象类型中值不为函数的 key

**实现**

```ts
type NonFunctionKeys<T extends Object> = {
  [P in keyof T]-?: NonUndefined<T[P]> extends Function ? never : P
}[keyof T]
```

**示例**

```ts
type NonFunctionKeysResult = NonFunctionKeys<MixedProps> //"name" | "someKeys" | "unNull"
```

经过`FunctionKeys`类型的分析，`NonFunctionKeys`类型应该就很好理解了。

在遍历对象类型的过程中，先使用`NonUndefined`过滤掉值类型为 undefined 的 key，然后再过滤掉值类型为函数类型的 key，最后通过索引查询操作符获取到值类型的联合类型即可。

### IfEquals

IfEquals 是一个辅助类型函数，用于判断两个类型是否相同。

**实现**

```ts
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B
```

如果你了解一些 TS 的话可能会想到，判断两个类型是否相同不是直接使用双向 extends 就可以了吗，这个是什么玩意？🤔️

我想你说的双向 extends 方式是这样的。

```ts
type Same<X, Y> = X extends Y ? (Y extends X ? true : false) : false
```

对于上面 Same 类型函数这种写法，其实是有缺陷的，它没有办法推断两个类型是否绝对相同，比如说相同结构但带有不同属性修饰符的对象类型。

```ts
type X = {
  name: string
  age: number
}
type Y = {
  readonly name: string
  age: number
}
```

上面这两个类型 Same 类型函数就无法推断，这种情况下就必须要使用`IfEquals`类型函数了。

**示例**

```ts
type SameResult = Same<X, Y> //true
type IfEqualsResult = IfEquals<X, Y> //never
```

`IfEquals`类型函数的核心就是使用了延时条件类型，在兼容性推断的时候依赖了内部类型的一致性检查。`IfEquals`内部最少依赖了两个泛型参数，`X`、`Y`，在传入`X`、`Y`泛型参数后，对类型进行推断，如果能推断出结果就返回最终的类型，否则就延时推断过程，等待确认的类型参数传进来后再进行类型推断。

像`IfEquals`类型函数一样，构造一个延时条件类型很简单，只需要构建一个函数类型并且将函数的返回值构建成依赖泛型参数的条件类型就可以了。

```ts
type DeferConditionalType = <T>(value: T) => T extends string ? number : boolean
```

在使用`DeferConditionalType`泛型的时候就会根据传入的泛型参数延时推断出返回值类型。

### WriteableKeys

`WriteableKeys` 用于获取对象类型中所有可写的 key。

**实现**

```ts
export type WriteableKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >
}[keyof T]
```

**示例**

```ts
type Props = { readonly foo: string; bar: number }

type WriteableKeysResult = WriteableKeys<Props> // "bar"
```

从源码中可以看出使用了 IfEquals 函数，现在我们已经知道 `IfEquals` 函数用于判断两个类型是否严格相等(不清楚的可以看下 IfEquals 函数的解析)，所以就比较好办了。

在遍历对象 key 的过程中，构造两个对象，分别是原 key 构造的对象和去掉 readonly 修饰 key 构造的对象，并且第三个参数传入 key，作为匹配相同的类型函数返回值，因此最终结果就是带有 readonly 修饰的 key 的值类型都是 never，其余的 key 的值类型是 key 本身，最后再通过索引类型访问操作符获取到所有 key 的值类型的联合类型。

### ReadonlyKeys

`ReadonlyKeys` 用于获取对象类型中所有被 readonly 修饰的 key。

**实现**

```ts
export type ReadonlyKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >
}[keyof T]
```

**示例**

```ts
type Props = { readonly foo: string; bar: number }

type ReadonlyKeysResult = ReadonlyKeys<Props> // "foo"
```

`ReadonlyKeys` 的实现方式和 `WriteableKeys` 的实现方式基本相同，区别在于 `IfEquals` 函数的第三、四个参数。在 `WriteableKeys` 中，第三个参数是 key，第四个参数默认是 `never`，而在 `ReadonlyKeys` 中颠倒过来了，原因是，当两个类型匹配成功后，则认定这两个类型是严格相同的，那么就表示当前 key 是不被 readonly 修饰的，所以在 `WriteableKeys` 中返回 key、在 `ReadonlyKeys` 中返回 never；当两个类型匹配不成功后，则认定这两个类型是不相同的。

**RequiredKeys**
`RequiredKeys` 用于获取对象类型中所有必选的 key。

**实现**

```ts
export type RequiredKeys<T extends object> = {
  [P in keyof T]-?: {} extends Pick<T, P> ? never : P
}[keyof T]
```

**示例**

```ts
type RequiredProps = {
  req: number
  reqUndef: number | undefined
  opt?: string
  optUndef?: number | undefined
}

type RequiredKeysResult = RequiredKeys<RequiredProps> //"req" | "reqUndef"
```

`RequiredKeys` 中用到了 Pick，首先说下 Pick 是干嘛的

`Pick` 是 Typescript 内置的泛型函数，接受两个 T, U，第一个参数 T 是一个对象类型，第二个参数 U 是联合类型，并且 U extends keyof T。Pick 用于过滤掉泛型 T 中不能兼容 U 的 key。

例如：

```ts
type Props = {
  req: number
  reqUndef: number | undefined
  opt?: string
  optUndef?: number | undefined
}
type result = Pick<Props, 'req' | 'opt'> //  {req: number,opt?: string}
```

回到 `RequiredKeys` 类型函数上，在遍历泛型 T 的 key 过程中，借用空对象{}去 extends 处理过的 key(此时是一个只包含 key 的对象)，若当前 key 是可选的，那么必然是兼容的，不是我们想要的返回 never，否则是必选的，返回当前 key。

### OptionalKeys

`OptionalKeys` 用于获取对象类型上所有可选的 key。

**实现**

```ts
export type OptionalKeys<T extends object> = {
  [P in keyof T]-?: {} extends Pick<T, P> ? P : never
}[keyof T]
```

**示例**

```ts
type RequiredProps = {
  req: number
  reqUndef: number | undefined
  opt?: string
  optUndef?: number | undefined
}
type OptionalKeysResult = OptionalKeys<RequiredProps> // "opt" | "optUndef"
```

`OptionalKeys` 的实现方式和 `RequiredKeys` 基本相同，区别在于条件类型的取值是相当的，具体细节可以看下 `RequiredKeys` 的实现分析。

### PickByValue

在解读 `RequiredKeys` 类型函数的时候我们说到了 `Pick` 这个内置类型函数，它是根据 key 来过滤对象的 key 的，而 `PickByValue` 则是根据 value 的类型来过滤对象的 key。

**实现**

```ts
export type PickByValue<T, K> = Pick<
  T,
  {
    [P in keyof T]-?: T[P] extends K ? P : never
  }[keyof T]
>
```

**示例**

```ts
type PickByValueProps = {
  req: number
  reqUndef: number | undefined
  opt?: string
}

type PickByValueResult = PickByValue<PickByValueProps, number> //{req: number; reqUndef: number | undefined; }
```

我们来通过结果来反推一下 `PickByValue`，就这个示例而言，首先我们想要的结果是过滤掉所有值类型可兼容 number 的 key，因为是过滤，所以 `PickByValue` 的最外层就必然要用 `Pick` 来做。

```ts
type PickByValue<T, K> = Pick<T, ...>
```

所以目前要实现这个函数只需要搞定第二个参数就可以了。因为第二个参数必然是 keyof T 的子集，所以我们要做就是通过 value 的类型来推出可兼容 value 类型的 key。下一步就必然要遍历 key，并且通过`{}[keyof T]`来获取最终的子集。

```ts
type PickByValue<T, K> = Pick<T, {
  [P in keyof T]: ...
}[keyof T]>
```

在遍历过程中判断`T[P]`的类型是否兼容 K 就可以了，最终结果就是实现的样子。

### PickByValueExact

`PickByValueExact` 是 `PickByValue` 的严格版

**实现**

```ts
export type PickByValueExact<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: [ValueType] extends [T[Key]]
      ? [T[Key]] extends [ValueType]
        ? Key
        : never
      : never
  }[keyof T]
>
```

源码里面是双向 extends，感觉使用 IfEquals 更严格一些。

```ts
export type PickByValueExact<T, K> = Pick<
  T,
  {
    [P in keyof T]-?: IfEquals<[K], [T[P]], P>
  }[keyof T]
>
```

**示例**

```ts
type PickByValueProps = {
  req: number
  reqUndef: number | string
  opt?: string
}

type PickByValueExactResult = PickByValueExact<PickByValueProps, number> //{req: number;}
```

实现思路与 `PickByValue` 大致相同，区别就是判断的地方，`PickByValueExact` 使用 IfEquals 做严格匹配。

### Omit

`Omit` 的作用就是反向 Pick，删除泛型 A 中可匹配泛型 B 的 key。

**实现**

```ts
export type Omit<A, B extends keyof A> = Pick<A, Exclude<keyof A, B>>
```

```ts
type OmitProps = {
  name: string
  age: number
  visible: boolean
  sex: string | number
}

// {
//     name: string;
//     visible: boolean;
//     sex: string | number;
// }
type OmitResult = Omit<OmitProps, 'age'>
```

反向 `Pick` 可以借助 `Pick` 来做，只要对 `Pick` 的第二个参数做处理即可。方式就是使用 `Exclude` 泛型函数对 keyof A、B 取补集，获取到泛型对象 A 中过滤掉兼容泛型 B。

### OmitByValue

反向 `PickByValue`，`PickByValue` 是只包含，`OmitByValue` 是只过滤。

**实现**

```ts
export type OmitByValue<T, U> = Pick<
  T,
  {
    [P in keyof T]: T[P] extends U ? never : P
  }
>
```

**示例**

```ts
type OmitProps = {
  name: string
  age: number
  visible: boolean
  sex: string | number
}
// {
//     age: number;
//     visible: boolean;
//     sex: string | number;
// }
type OmitByValueResult = OmitByValue<OmitProps, string>
```

与 `PickByValue` 类似，只是将 extends 的结果交换了位置，就可以实现反向操作，具体思路请看 `PickByValue` 的分析。

### OmitByValueExact

**实现**

```ts
export type OmitByValueExact<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: [ValueType] extends [T[Key]]
      ? [T[Key]] extends [ValueType]
        ? never
        : Key
      : Key
  }[keyof T]
>
```

源码里使用双向 extends 判断两个类型是否严格兼容，我这里用 `IfEquals` 函数搞了一下。

```ts
export type OmitByValueExact<A, B> = Pick<
  A,
  {
    [P in keyof A]-?: IfEquals<A[P], B, never, P>
  }[keyof A]
>
```

**示例**

```ts
type OmitProps = {
  name: string
  age: number
  visible: boolean
  sex: string | number
}
// {
//   name: string
//   age: number
//   visible: boolean
// }
type OmitByValueExactResult = OmitByValueExact<OmitProps, string | number>
```

相信看过之前的套路，聪明的你一定能想到 `OmitByValueExact` 的实现方式是和 `PickByValueExact` 的实现方式类似的，区别在于 `IfEquals` 类型函数结果返回值交换了位置，具体思路请看 `PickByValueExact` 的实现思路。

### Intersection

`Intersection` 用于获取对象类型 key 的交集。

**实现**

```ts
export type Intersection<T extends object, U extends object> = Pick<
  T,
  Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>
```

**示例**

```ts
type IntersectionProps = {
  name: string
  age: number
  visible: boolean
  value: number
}
type DefaultProps = { age: number; value: number }
// {
//     age: number;
//     value: number;
// }
type IntersectionResult = Intersection<IntersectionProps, DefaultProps>
```

`Intersection` 类型函数接受`<A,B>`两个对象类型，最终得到的是两个对象类型 key 的交集在 A 上的 Pick。
所以我们只要先解两个对象类型 key 的交集，然后再对 A 进行 Pick 就 ok 了。

求交集可以使用 `Extract` 泛型函数，将 A、B 使用索引操作符将 key 转为联合类型，然后使用 `Extract` 求两个联合类型的交集，最后对 A 进行 Pick 即可。

个人认为第二个 `Extract` 是没有必要的因为对两个联合类型求交集，谁先谁后两个结果都是一样的。

### Diff

`Diff` 类型函数接受两个泛型变量 T、U，且 T、U 都是对象类型，用于获取泛型 U 在泛型 T 上的补集。

**实现**

```ts
export type Diff<T extends object, U extends object> = Pick<
  T,
  Exclude<keyof T, keyof U>
>
```

**示例**

```ts
type Props = {
  name: string
  age: number
  visible: boolean
  value: number
}
type Props2 = { age: number; value: number }
// {
//     name: string;
//     visible: boolean;
// }
type DiffResult = Diff<Props, Props2>
```

经过上面类型函数中对 `Pick` 函数的应用，我们应该已经知道 `Pick` 是用来处理对象类型，并返回对象类型的子集，因此求补集就应该从两个对象类型的 key 下手。开始已经提到 `Exclude` 用于求两个联合类型的补集，因此就可以通过索引类型修饰符获取到两个对象类型的 key 的联合类型，然后再通过 `Exclude` 取补集，最后通过 Pick 取 T 的子集即可。

### Overwrite

`Overwrite` 接收两个泛型参数 T、U，且都为对象类型，作用是若 U 中属性在 T 中也存在，则覆盖 T 中的属性。

**实现**

```ts
export type Overwrite<
  T extends object,
  U extends Object,
  I = Diff<T, U> & Intersection<U, T>
> = Pick<I, keyof I>
```

**示例**

```ts
type Props1 = { name: string; age: number; visible: boolean }
type Props2 = { age: string; other: string }

// {
//   name: string
//   age: string
//   visible: boolean
// }
type OverwriteResult = Overwrite<Props1, Props2>
```

如果对 `Diff`、`Intersection` 这两个泛型函数了解的话，那么 `Overwrite` 就小菜一碟了。我们知道 `Diff` 用于获取两个泛型参数的补集，`Intersection` 用于获取两个泛型参数的交集，最后合成交叉类型即可。

你可能会疑问，结果直接`Diff<T, U> & Intersection<U, T>`就可以了，为什么还要使用 Pick 多一次遍历呢？

我们分别用两种情况看一下类型推断结果。

1. 使用 Pick

```ts
type OverwriteResult = Overwrite<Props1, Props2>
//  =>
// {
//   name: string
//   age: string
//   visible: boolean
// }
```

2. 不使用 Pick

```ts
export type Overwrite<T extends object, U extends Object> = Diff<T, U> &
  Intersection<U, T>
type OverwriteResult = Overwrite<Props1, Props2>
// => Pick<OverwriteProps, "name" | "visible"> & Pick<NewProps, "age">
```

可以看出不使用 `Pick` 的结果对于用户是不友好的，无法直接从 IDE 中看到类型推断的结果。

### Assign

`Assign` 比 `Overwrite` 的能力更强大一些。它接收两个泛型参数 T、U，且都为对象类型，作用是若 U 中的属性在 T 中存在则覆盖，不存在则添加。

**实现**

```ts
export type Assign<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T> & Diff<U, T>
> = Pick<I, keyof I>
```

**示例**

```ts
type Props1 = { name: string; age: number; visible: boolean }
type Props2 = { age: string; other: string }
// {
//     name: string;
//     age: string;
//     visible: boolean;
//     other: string;
// }
type AssignResult = Assign<Props1, Props2>
```

`Assign` 在实现上与 `Overwrite` 区别是在处理 I 上比 `Overwrite` 多&了`Diff<U, T>`，`Overwrite` 的作用是覆盖已有元素，那么实现 `Assign` 只需要将在 T 上不存在的属性合并到 T 上就 ok 了，因此就可以使用`Diff<U, T>`的方式获取到在 U 上而不再 T 上的属性，最后与前面和为交叉类型。

### Unionize

`Unionize` 接收一个泛型参数，且为对象类型，作用是将对象类型转为单独 key 对象的联合类型。

**实现**

```ts
export type Unionize<T extends object> = {
  [P in keyof T]: { [Q in P]: T[P] }
}[keyof T]
```

**示例**

```ts
type Props = { name: string; age: number; visible: boolean }
// {
//     name: string;
// } | {
//     age: number;
// } | {
//     visible: boolean;
// }
type UnionizeResult = Unionize<Props>
```

起初看到这个是懵逼的，然后仔细想一下，发现已经写过很多这种方式了，直接遍历对象 key，然后将 value 构造成对象，最后在通过索引操作符取所有值的联合类型就可以了。

### PromiseType

PromiseType 用于获取 Promise 的泛型类型。

**实现**

```ts
export type PromiseType<T extends Promise<unknown>> = T extends Promise<infer V>
  ? V
  : never
```

**示例**

```ts
// string
type PromiseTypeResult = PromiseType<Promise<string>>
```

`PromiseType` 中用到了 infer，infer 的作用是在条件类型中做延时推断，infer 用到绝佳可以实现强大的功能。

`PromiseType` 将泛型 T extends Promise，并在 Promise 泛型类型使用 infer 推断其类型，若 T 为 Promise 类型，则
V 就是 Promise 的泛型类型，否则为 never。

_思考一下，如果深度解析 Promise 泛型呢？_ 🤔

### DeepReadonly

`utility-types`中`DeepX`递归类型基本上相同，`X`的逻辑在上面已经分析过了，主要分析是 `Deep` 逻辑。

**实现**

```ts
export type DeepReadonly<T> = T extends ((...args: any[]) => any) | Primitive
  ? T
  : T extends _DeepReadonlyArray<infer U>
  ? _DeepReadonlyArray<U>
  : T extends _DeepReadonlyObject<infer V>
  ? _DeepReadonlyObject<V>
  : T
export interface _DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
export type _DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}
```

**示例**

```ts
type Props = {
  first?: {
    second?: {
      name?: string
    }
  }
}
type DeepReadonlyResult = DeepReadonly<Props>
```

源码中分别对数组和对象类型做了处理，可以看到`_DeepReadonlyObject`泛型函数在遍历 T 的过程中再次调用`DeepReadonly`进行递归解析。

_思考一下，为什么没有循环引用呢？_ 🤔

### Optional

`Optional` 接收两个泛型参数 T、K，且 T 为对象类型，K 为 T 所有 key 联合类型的子集，作用是 T 中可兼容 K 的属性转换为可选的，默认是全部。

**实现**

```ts
export type Optional<
  T extends object,
  K extends keyof T = keyof T,
  I = Omit<T, K> & Partial<Pick<T, K>>
> = Pick<I, keyof I>
```

**示例**

```ts
type Props = {
  first: string
  second: number
  third: boolean
}
// {
//   first?: string
//   second?: number
//   third: boolean
// }
type OptionsalResult = Optional<Props, 'first' | 'second'>
```

我们可以先想一下，要怎么做才能实现这样的功能。

既然要处理部分属性，所以我们可以先将这部分属性删除，等处理好了之后再合并过来，没错，源码就是这么干的。

如果你是按照顺序读下来的，肯定已经 Omit、Pick 这两个泛型函数的作用了(Omit 只删除、Pick 只保留，忘了的话可以翻上去看看)，因此我们就可以先使用 Omit 将将要处理的属性先删除，然后使用 Pick 只保留将要处理的属性并使用 Partial 泛型函数处理，最后再使用交叉类型将二者合并起来。

### ValuesType

`ValuesType` 接收一个泛型参数，可以是数组或对象，用于获取值的联合类型。数组在这里较多的指元组，因为普通数组所有元素的类型相同，就没必要联合了。

**实现**

```ts
export type ValuesType<
  T extends Array<any> | ReadonlyArray<any> | ArrayLike<any> | object
> = T extends Array<any> | ReadonlyArray<any> | ArrayLike<any>
  ? T[number]
  : T extends object
  ? T[keyof T]
  : never
```

**示例**

```ts
type Props = {
  first: string
  second: number
  third: boolean
}
// string | number | boolean
type ValuesTypeResult = ValuesType<Props>
```

`ValuesType` 处理参数主要分为两部分：对数组的处理和对对象的处理。对数组的处理使用`T[number]`非常优雅，并且是元组类型转联合类型最简单的方式；对对象的处理用的就比较多了，使用索引操作符就可以了。

### ArgumentsRequired

`ArgumentsRequired` 与 `Optional` 类似，用于将对象的某些属性变成必选的

**实现**

```ts
export type ArgumentsRequired<
  T extends object,
  K extends keyof T = keyof T,
  I = Omit<T, K> & Required<Pick<T, K>>
> = Pick<I, keyof I>
```

**示例**

```ts
type Props = {
  name?: string
  age?: number
  visible?: boolean
}
// {
//   name: string
//   age: number
//   visible: boolean
// }
type ArgumentsRequiredResult = ArgumentsRequired<Props>
```

实现方式的解析可以看 `Optional`，这里就不多说了。

### TupleToUnion

在 `ValuesType` 中已经提到一个特别简单的方式。还有一种方式也值得学习一下。

在类型系统中，元组类型是兼容数组类型的。

```ts
// 'true'
type ret = [number, string] extends Array<any> ? 'true' : 'false'
```

因此就可以使用 infer 来推断出数组的泛型类型。

**实现**

```ts
export type TupleToUnion<T extends any[]> = T extends Array<infer U> ? U : never
```

**示例**

```ts
// string | number
type TupleToUnionResult = TupleToUnion<[string, number]>
```

### UnionToIntersection

UnionToIntersection 用于将联合类型转为交叉类型

**实现**

```ts
export type UnionToIntersection<T> = (
  T extends any ? (arg: T) => void : never
) extends (arg: infer V) => void
  ? V
  : never
```

**示例**

```ts
type UnionToIntersectionResult = UnionToIntersection<
  { name: string } | { age: number } | { visible: boolean }
>
```

UnionToIntersection 这个泛型函数还是要好好理解的，这里用到了 Typescript 类型系统中的概念，`同一类型变量的多个候选类型将会被推断为交叉类型`，这是 TS 类型系统函数参数位置逆变的知识。[逆变与协变](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html#%E5%8D%8F%E5%8F%98%E4%B8%8E%E9%80%86%E5%8F%98)这篇文章说的很清晰，可以深入了解一下。

了解了 TS 类型系统后，`UnionToIntersection`就比较好了解了。已知泛型函数接受的是一个联合类型，通过分布式条件类型构建同一类型变量多个候选类型，然后再使用延时推断获取到 V 的类型。

### 总结

解读`utility-types`中的高级类型，我发现`Typescript`远远不止我们在函数参数位置赋予一个类型那么简单，一定要善用 Typescript 类型推断的能力，有时候你会发现，让一个函数具备良好的类型推断能力写的类型竟然比运行代码还长，为了让代码更稳定，更能被同事理解，有时我们也必须这样做 😭，别让你的`Typescript`成为`AnyScripts`。
