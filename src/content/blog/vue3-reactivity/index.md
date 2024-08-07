---
title: vue3响应式原理
pubDatetime: 2022-08-03T09:10:35.205Z
description: vue3响应式原理解析及源码分析
featured: true
draft: false
tags:
  - Vue
---

# 响应式基本原理

什么是响应式数据？顾名思义就是当一个数据发生变化的时候，所引用响应式数据的地方都能得到更新。

```ts
const obj = {
  name: "kim",
};
function render() {
  document.body.innerText = obj.name;
}
obj.name = "kimwangchong";
```

上面代码中定义了一个obj对象有一个name属性，随后定义了一个render函数并且这个函数中引用了`obj.name`输出到body上，然后修改name属性的值。当obj是响应式数据时，我们期望引用`obj.name`的地方，也就是render函数可以重新执行从而更新body的内容。

我们来简单总结如果要实现数据响应式需要哪些东西：

1. 数据劫持：我们需要感知到数据值的变化，值的读取以及更新
2. 依赖收集：当感知到数据值的读取时，需要将引用响应式数据的最小单元(effectFn)收集起来
3. 依赖更新：当感知到数据值更新时，需要将更新属性收集的依赖重新执行，得到新数据

## 副作用函数

vue中是如何感知数据读取或者说如何收集依赖的呢？vue将访问响应式数据并且我们期望收集依赖的函数叫做`副作用函数`。函数是定义在代码里的，那vue是如何感知的呢？是通过`函数是一等公民`的特性，定义一个函数，将副作用函数作为该函数的参数传入到内部，vue就可以获取到当前函数，这里是通过`effect`API来完成的

```ts
const runner = effect(() => {
  console.log("name", obj.name);
});
```

我们先简单看一下effect函数具体做了什么事情。

```ts
let activeEffect = null;
const effect = (fn: Function) => {
  try {
    activeEffect = fn;
    fn();
  } finally {
    activeEffect = null;
  }
};
```

vue中巧妙用到了js单线称的特性，在代码里很多地方都用到全局变量来存储`activeXXX/currentXXX`变量，用来存储某一特性的当前实例，例如组件实例、effect实例等等。

极简版`effect`做的事情非常简单，将当前`effectFn`存出到全局，然后执行`effectFn`，执行结束后再将`activeEffect`设置为null。当然这个实现比较粗糙实际上还涉及到`延迟执行`、`effect嵌套`、`依赖清理`、`递归引用`等等。

## 依赖收集

依赖收集也可以叫做依赖追踪。当响应式数据发生变化的时候，需要知道哪里使用了响应式数据，进而更新依赖。依赖收集就是将访问响应式数据的副作用函数收集起来的过程。

从开头分析我们知道，要想知道哪里使用了响应式数据我们需要先对数据进行代理，当访问响应式数据时劫持将依赖收集起来。vue2中是通过`Object.defineProperty`实现，vue3的reactivity包则暴露出`reactive`API，其原理是通过`Proxy`API来实现。

```ts
const obj = reactive({
  name: "kim",
});
```

极简版`reactive`如下：

```ts
const reactive = (obj: object) => {
  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);
      const res = Reflect.get(target, key, receiver);
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const res = Relfect.set(target, key, value, receiver);
      if (!Object.is(value, oldValue)) {
        trigger(target, ket, value);
      }
      return res;
    },
  });
};
```

我们先来看get函数的内容，极简版比较简单。

在`副作用函数`我们知道`effect`会先将副作用函数存储到activeEffect中，然后再执行副作用函数。在执行副作用函数过程中如遇到响应式属性读取则会触发get操作，走track（依赖收集）逻辑。

极简版`track`如下:

```ts
const deps = [];
const track = (target, key) => {
  deps.push(activeEffect);
};
```

此时全局`activeEffect`就起作用了，将副作用函数（依赖）收集起来。

## 依赖更新

当响应式数据发生变化时，Proxy会劫持数据set操作，如果新旧数据不一致，则会触发trigger，trigger的作用就是去更新数据访问劫持过程中收集到的依赖。

```ts
const trigger = () => {
  for (let dep of deps) {
    dep();
  }
};
```

# 源码分析

## reactive/shallowReactive/readonly/shallowReadonly

reactivity包中将一个对象转为响应式对象API分为两类共四个API：

- reactive：将对象转为深度响应式对象
- shallowReactive: 将对象转为浅层响应式对象
- readonly: 将对象转为深度只读对象
- shallowReadonly: 将对象转为浅层只读对象

并且不同API所产生的响应式对象被隔离开：

```ts
export const reactiveMap = new WeakMap<Target, any>();
export const shallowReactiveMap = new WeakMap<Target, any>();
export const readonlyMap = new WeakMap<Target, any>();
export const shallowReadonlyMap = new WeakMap<Target, any>();
```

原本只分了两类：reactiveMap和readonlyMap，这么做是因为这个[issue](https://github.com/vuejs/core/issues/2843),大致内容是他用reactive将一个对象转为响应式，又用shallowReactive将同一个对象转为响应式结果两个响应式对象相同。这个bug出现的原因是：调用API将对象转为响应式对象都会将`对象-响应式对象`的映射关系存到Map中，下次调用在Map中找到映射关系时直接将对应的响应式对象返回出去。

四个响应式API其内部都是调用的同一个函数来创建的响应式对象。

```ts
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target;
  }
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // only specific value types can be observed.
  const targetType = getTargetType(target);
  if (targetType === TargetType.INVALID) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
```

从上面代码中我们可以得知一下信息：

1. 响应式API只能将对象转为响应式，无法将原始值转为响应式
2. 响应式API只能readonly嵌套reactive，其余都无效，也就是说只能readonly(reactiveObj)这种才会生效readonly特性，其余都会返回原对象。
3. 响应式API将对象分为了三类，类别为`INVALID`的会被跳过，其他不同类别走不同的handler处理
4. 将源对象与响应式对象映射存到对应API Map中

主要看一下第三点：

```ts
function targetTypeMap(rawType: string) {
  switch (rawType) {
    case "Object":
    case "Array":
      return TargetType.COMMON;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return TargetType.COLLECTION;
    default:
      return TargetType.INVALID;
  }
}

function getTargetType(value: Target) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value));
}
```

响应式API想对象分为COMMON、COLLECTION、INVALID三类。

- COMMON： Object, Array
- COLLECTION：Set、WeakSet、Map、WeakMap
- 被标记为SKIP、不可扩展的以及其他

什么情况下会被标记为`SKIP`呢？reactivity提供了一个`markRaw`API，用来标记对象为`SKIP`，被这个API标记过的对象都是不能转为响应式对象的。

```ts
export function markRaw<T extends object>(
  value: T
): T & { [RawSymbol]?: true } {
  def(value, ReactiveFlags.SKIP, true); // Object.defineProperty
  return value;
}
```

上面提到当target为普通对象时走`baseHandlers`逻辑，当target为集合对象时走`collectionHandlers`逻辑，我们先来看下`baseHandlers`中的get/set都做了什么事。

### baseHandlers

#### get

针对普通对象的四种响应式API的`get`逻辑都统一走了`createGetter`这个函数，通过参数来区分场景。

```ts
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // 访问key为 ReactiveFlags.IS_REACTIVE、ReactiveFlags.IS_READONLY、ReactiveFlags.IS_SHALLOW、		ReactiveFlags.RAW的处理。
    // .....
    const targetIsArray = isArray(target);
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    // builtInSymbols
    // Symbol(Symbol.asyncIterator)、Symbol(Symbol.hasInstance)、Symbol(Symbol.isConcatSpreadable)
    // Symbol(Symbol.iterator)、Symbol(Symbol.match)、Symbol(Symbol.matchAll)、Symbol(Symbol.replace)
    // Symbol(Symbol.search)、Symbol(Symbol.species)、Symbol(Symbol.split)、Symbol(Symbol.toPrimitive)
    // Symbol(Symbol.toStringTag)、Symbol(Symbol.unscopables)、Symbol(Symbol._hidden)、Symbol(Symbol.observable)
    // isNonTrackableKeys
    // __proto__,__v_isRef,__isVue
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    // 依赖追踪
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}
```

从上面代码我们得到信息如下：

1. 对数组某些key的处理
2. key为symbol或者某些内部不能被track的key直接返回结果
3. 非readonly下追踪依赖
4. 数组索引访问返回原数据，值为ref返回value
5. 值为对象深度响应式

##### 1. 对数组某些key的处理

先看代码

```ts
const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations: Record<string, Function> = {};
  // instrument identity-sensitive Array methods to account for possible reactive
  // values
  (["includes", "indexOf", "lastIndexOf"] as const).forEach(key => {
    instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
      const arr = toRaw(this) as any;
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, TrackOpTypes.GET, i + "");
      }
      // we run the method using the original args first (which may be reactive)
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        // if that didn't work, run it again using raw values.
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  // instrument length-altering mutation methods to avoid length being tracked
  // which leads to infinite loops in some cases (#2137)
  (["push", "pop", "shift", "unshift", "splice"] as const).forEach(key => {
    instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
      pauseTracking();
      const res = (toRaw(this) as any)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
```

数组的一些查找、遍历方法时间复杂度是O(n)的（includes', 'indexOf', 'lastIndexOf 竟然不是二分），也就是说其方法内部对数组进行了遍历，那么当数组被Proxy代理后，其内部查找的属性以及索引访问都会触发`get`。例如：

```ts
const arr = [1, 2, 3, 4];
const proxyArr = new Proxy(arr, {
  get(target, key, receiver) {
    console.log("get: ", key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("set: ", key, value);
    return Reflect.set(target, key, value, receiver);
  },
});
arr.includes(3);
// Console:
// get: includes
// get: length
// get: 0
// get: 1
// get: 2
// true
arr.push(5);
// Console:
// get: push
// get: length
// set: 4 5
// set: length 5
```

那么为啥需要对数组的这些key特殊处理呢？ 我们先删掉这部分处理代码来看一下。

先来看下查询方法的处理。

当数组的项为对象时：

```ts
const obj = {};
const arr = reactive([1, 2, 3, obj]);
const is = arr.includes(obj); // true or false ?
```

来分析一下过程：

```ts
// get: includes
// get: length
// get: 0 取值 1 === obj false
// get: 1 取值 2 === obj false
// get: 2 取值 3 === obj false
// get: 3 取值 obj === obj ? false
```

因为`get`对值为对象的逻辑逻辑是`reactive(obj)`，此时返回的是代理对象，而不是原对象，因此需要对这部分方法特殊处理，获取到原对象执行`includes`方法。

在处理过程中`track`所有的索引key是为了与原proxy的拦截逻辑保持一直，去收集索引的依赖

```ts
const arr = reactive([1, 2, 3, 4, 5]);
effect(() => {
  console.log(arr.includes(6));
});
// false
arr[0] = 6;
// true
```

再来看一些改变数组长度的方法。

这部分处理是为了避免依赖循环触发的问题，但实际上在trigger阶段已经避免了递归依赖

```ts
const arr = reactive([1, 2, 3, 4]);
effect(() => {
  arr.push(5);
});
// get push
// get length
// set  4 5
// set length 5
```

当没有特殊处理的情况下：在effect中先收集了length，push后又改变了length，trigger先前收集到的依赖，循环执行effectFn。

##### 2.数组索引访问返回原数据，值为ref返回value

这个地方在使用的过程中可能需要注意一下，比如说：

```ts
// 数组索引访问返回原数据
const refs = reactive([ref(1), ref(2), ref(3)]);
const is = isRef(refs[0]); // true
console.log(is.value); // 1
```

- 当ref作为数组项时并不会自动解包
- ref作为key的unref是个懒解包，只有在访问的时候才会解包

一个类型的问题：

```ts
const refs = reactive([ref(1), ref(2)] as const); // readonly[number, number]
refs[0].value; // Type Error.
```

## track

track主要做的事情是依赖收集，在`get`阶段，如果是非readonly情况下，会对所访问对象的属性进行依赖收集

```ts
if (!isReadonly) {
  track(target, TrackOpTypes.GET, key);
}
```

我们在`响应式基本原理中`实现了一个极简版的`track`和`trigger`，我们来看下极简版会有哪些问题。

```ts
//极简版
// track
const deps = []
const track = (target, key) => {
  deps.push(activeEffect)
}
// trigger
const trigger = () => {
  for (let dep of deps) {
    dep()
  }
}
// your code
const obj = reactive({
  a: 1,
  b: false
})

// effectFn1
effect(() => {
  console.log(obj.a)
})

// effectFn2
effect(() => {
  console.log(obj.2)
})
obj.a = 2
```

当去更新`obj.a`的值时，可见effectFn1以及effectFn2都会重新触发，因为在track阶段将所有activeEffect都收集到deps数组内，而在trigger时无法区分是key的变化与之有关的副作用函数是哪些。因此需要明确的建立key与副作用函数的依赖关系，才能正确的触发与之相关的副作用函数。

我们先来看下track中做了哪些事情

```ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = createDep()));
    }

    const eventInfo = __DEV__
      ? { effect: activeEffect, target, type, key }
      : undefined;

    trackEffects(dep, eventInfo);
  }
}
```

track做的事情就是为当前所追踪的key建立依赖树，通过上面例子代码建立的依赖关系树为：

```ts
targetMap [WeakMap]
		|
  	|- obj -> depsMap [Map]
								|
  							|- a -> deps [Set]
													|- effectFn1
								|- b -> deps [Set]
													|- effectFn2
```

我们再来看下trackEffects做了什么事

```ts
export function trackEffects(
  dep: Dep,
  debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
  let shouldTrack = false;
  // 这块和effect一起说
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit; // set newly tracked
      shouldTrack = !wasTracked(dep);
    }
  } else {
    // Full cleanup mode.
    shouldTrack = !dep.has(activeEffect!);
  }

  if (shouldTrack) {
    dep.add(activeEffect!);
    activeEffect!.deps.push(dep);
    if (__DEV__ && activeEffect!.onTrack) {
      activeEffect!.onTrack({
        effect: activeEffect!,
        ...debuggerEventExtraInfo!,
      });
    }
  }
}
```

shouldTrack这块逻辑和effect过程一起说，我们先假设shouldEffect为true。那么`trackEffects`实际上就做了一件事：建立依赖的双向存储。

```ts
dep.add(activeEffect!);
activeEffect!.deps.push(dep);
```

## effect

```ts
export interface ReactiveEffectOptions extends DebuggerOptions {
  lazy?: boolean;
  scheduler?: EffectScheduler;
  scope?: EffectScope;
  allowRecurse?: boolean;
  onStop?: () => void;
}
export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions
): ReactiveEffectRunner {
  if ((fn as ReactiveEffectRunner).effect) {
    fn = (fn as ReactiveEffectRunner).effect.fn;
  }

  const _effect = new ReactiveEffect(fn);
  if (options) {
    extend(_effect, options);
    if (options.scope) recordEffectScope(_effect, options.scope);
  }
  if (!options || !options.lazy) {
    _effect.run();
  }
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner;
  runner.effect = _effect;
  return runner;
}
```

从上面代码中我们得到的信息如下：

1. effect可以传一些配置，非lazy下函数立即触发，lazy下需要手动调用才能触发并收集依赖。
2. 内部会基于fn创建一个ReactiveEffect实例，实际执行时执行的effect.run，并不是直接执行的fn
3. effect返回值是effect.run函数，并且这个函数还可以作为effect的参数重新创建一个effect实例。

这部分浅显易懂，我们重点看一下创建ReactiveEffect实例以及effect.run里面都做了什么

```ts
export class ReactiveEffect<T = any> {
  active = true;
  deps: Dep[] = [];
  parent: ReactiveEffect | undefined = undefined;
  computed?: ComputedRefImpl<T>;
  allowRecurse?: boolean;
  private deferStop?: boolean;
  onStop?: () => void;
  // dev only
  onTrack?: (event: DebuggerEvent) => void;
  // dev only
  onTrigger?: (event: DebuggerEvent) => void;
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null,
    scope?: EffectScope
  ) {
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let parent: ReactiveEffect | undefined = activeEffect;
    let lastShouldTrack = shouldTrack;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;

      trackOpBit = 1 << ++effectTrackDepth;

      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this);
      } else {
        cleanupEffect(this);
      }
      return this.fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this);
      }

      trackOpBit = 1 << --effectTrackDepth;

      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = undefined;

      if (this.deferStop) {
        this.stop();
      }
    }
  }
  stop() {
    // stopped while running itself - defer the cleanup
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
```

#### 1. effect嵌套

当没有处理effect嵌套情况下，看一个例子

```ts
const data = reactive({
  foo: true,
  bar: true,
});
let temp1, temp2;
effect(function effectFn1() {
  console.log("effectFn1执行");
  effect(function effectFn2() {
    console.log("effectFn2执行");
    temp1 = data.foo;
  });
  temp2 = data.bar;
});
```

在运行effectFn1时将activeEffect赋值成effectFn1，然后在内部运行effectFn2将activeEffect赋值成effectFn2，然后访问`data.foo`收集依赖effectFn2，effectFn2直接结束退出，访问`data.bar`，收集依赖effectFn2。由于可见当没有处理effect嵌套的情况下依赖收集会错误，因为所有的effect全局公用一个activeEffect，因此需要维护effect的激活与退出。

通常情况下是使用一个栈来维护activeEffect（Vue.js设计与实现也是这么讲的），不过源码里是用的一个始终指向父effect的单项链表（应该是与内存优化有关）。简化一下代码为

```ts
try {
  let lastShouldTrack = shouldTrack;
  this.parent = activeEffect; // 指向父effect
  activeEffect = this; //  activeEffect 指向自己
} finally {
  activeEffect = this.parent; //  activeEffect 指向父effect
  shouldTrack = lastShouldTrack;
  this.parent = undefined; // 清理 父 effect
}
```

🌰：

```ts
effect(function effectFn1() {
  effect(function effectFn2() {
    effect(function effectFn3() {
      effect(function effectFn4() {});
    });
  });
});
```

effect链为：

```txt
effectFn4
		.parent -> effectFn3
									.parent -> effectFn2
																.parent -> effectFn1
																							.parent -> undefined
```

#### 2. 避免循环依赖

代码里处理循环依赖的地方有两部分，这里先说下第一部分：run函数里的处理

```ts
while (parent) {
  if (parent === this) {
    return;
  }
  parent = parent.parent;
}
```

一个场景是：我们已经知道effect返回一个runner其实就是run函数，并且可以在外部执行。🌰

```ts
let runner;
runner = effect(() => {
  if (runner) {
    runner();
  }
});
```

能想到的方案是这个，但是感觉没人会这样做。

另外一个是`trigger`的时候，需要触发的effect中有与activeEffect相同的则过滤。

```ts
function triggerEffect(effect) {
  if (effect !== activeEffect) {
    effect.run();
  }
}
```

这个场景是:

```ts
const obj = reactive({ count: 0 });
effect(() => {
  obj.count++;
  // obj.count = obj.count + 1
});
```

effectFn内，先访问了`obj.count`收集依赖，然后修改`obj.count`的值去trigger依赖，这样就会触发循环依赖。

#### 3.依赖清理与重复过滤

##### 重复过滤

首先来看一下重复过滤。

🌰

```ts
const obj = reactive({
  a: 1,
});
let tmp1, tpm2;

effect(function effectFn1() {
  tmp1 = obj.a;
  tmp2 = obj.a;
});
```

上面代码在effectFn1中`obj.a`访问了两次，会触发两次track，这样的话就会在a的deps中存两份 effectFn1，并且当effectFn1触发的时候也不应该收集已经收集过的依赖。

我们来看一下源码里是怎么做的。

属性对的dep实际上是个Set，并且Set上有两个属性

```ts
export const createDep = (effects?: ReactiveEffect[]): Dep => {
  const dep = new Set<ReactiveEffect>(effects) as Dep;
  dep.w = 0;
  dep.n = 0;
  return dep;
};
export const wasTracked = (dep: Dep): boolean => (dep.w & trackOpBit) > 0; // 判断依赖是否已被收集
export const newTracked = (dep: Dep): boolean => (dep.n & trackOpBit) > 0; // 判断当前层是否已经收集过依赖
```

- w：（was）表示依赖已经被追踪
- n：（new）表示依赖是一个新的追踪

在effect嵌套的场景中，run函数中会记录嵌套的层级，并且会为每一层增加创建一个二进制标识。

```ts
const maxMarkerBits = 30;
trackOpBit = 1 << ++effectTrackDepth;
if (effectTrackDepth <= maxMarkerBits) {
  initDepMarkers(this); // 对已经触发过的依赖收集打标记
} else {
  cleanupEffect(this);
}
```

```ts
export const initDepMarkers = ({ deps }: ReactiveEffect) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit; // set was tracked
    }
  }
};
```

effect与属性的deps会双向存储，当第二次触发effectFn的时，会 先将已经收集过的打上标记，避免重复收集。

然后我们回过头来看`track`中跳过的逻辑，如下：

```ts
let shouldTrack = false;
if (effectTrackDepth <= maxMarkerBits) {
  if (!newTracked(dep)) {
    dep.n |= trackOpBit; // set newly tracked
    shouldTrack = !wasTracked(dep);
  }
} else {
  // Full cleanup mode.
  shouldTrack = !dep.has(activeEffect!);
}
if (shouldTrack) {
  dep.add(activeEffect!);
  activeEffect!.deps.push(dep);
}
```

先将shouldTrack置为false，然后走下面是否要收集依赖。

当嵌套层级小于等于最大层级时，先会判断是否是一个新的依赖，如果是一个新的依赖，则dep.n 按位或，也就是给dep打标识，标识当前层该属性已经收集过依赖，下次再走`newTracked`时（这里感觉命名有点相反），则无法通过，进而过滤掉重复依赖。

然后再通过`wasTracked`来解决是否收集依赖。

```ts
// 一层
effectTrackDepth = 1
trakcOpBit = 1 << effectTrackDepth = 2
dep.n |= trakcOpBit = 0010 = 2
```

总结一下：

- newTracked：过滤第一次执行effectFn过程中的重复依赖收集
- wasTracked：过滤第二次及以后effectFn过程中的重复依赖收集

##### 依赖清理（分支切换）

再借`vuejs设计与实现`的一个例子

```ts
const obj = reactive({
  ok: true,
  text: "Hello world",
});

effect(function effectFn() {
  document.body.innerText = obj.ok ? obj.text : "not";
});
```

我们来分析一下此时依赖树是什么样子

```ts
targetMap [WeakMap]
		|
  	|- obj -> depsMap [Map]
								|
  							|- ok -> deps [Set]
													|- effectFn
								|- text -> deps [Set]
													|- effectFn
```

```ts
obj.ok = false;
```

当把obj.ok设置为false时，那么后面的逻辑effectFn不会走到obj.text分支。

```ts
obj.text = "Hello Kim";
```

由于text已经收集了依赖，那么当obj.text修改时，依然会找到之前收集的effectFn并触发，导致不必要的更新。

因此我们来看下是如何清理依赖的。

我们知道在触发effectFn的时候会对已经收集过标记

```ts
targetMap [WeakMap]
		|
  	|- obj -> depsMap [Map]
								|
  							|- ok -> deps [Set].w = 2
													|- effectFn
								|- text -> deps [Set].w = 2
													|- effectFn
```

在track阶段中会对dep打上`n`这个标记，text分支无法走到，因此不会触发track，所以也不会打标记

```ts
targetMap [WeakMap]
		|
  	|- obj -> depsMap [Map]
								|
  							|- ok -> deps [Set].w = 2, n = 2
													|- effectFn
								|- text -> deps [Set].w = 2, n = 0
													|- effectFn
```

在fn执行后的finally阶段中会执行`finalizeDepMarkers`这个函数，我们来看一个这个函数做了啥

```ts
export const finalizeDepMarkers = (effect: ReactiveEffect) => {
  const { deps } = effect;
  if (deps.length) {
    let ptr = 0;
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect);
      } else {
        deps[ptr++] = dep;
      }
      // clear bits
      dep.w &= ~trackOpBit;
      dep.n &= ~trackOpBit;
    }
    deps.length = ptr;
  }
};
```

这个函数里遍历与当前effect有关联的dep，如果当前dep已经被收集过并且在本次是一个新的依赖，也就是代码里的`wasTreacked(dep) && !newTracked(dep)`，则认为是一个过期的依赖需要进行清理。

未完待续...
