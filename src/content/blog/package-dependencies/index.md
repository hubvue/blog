---
title: dependencies、devDependencies、peerDependencies三者的区别
pubDatetime: 2021-12-28T02:58:59.252Z
description: 简单阐述下package.json中三种依赖项的区别
featured: false
draft: false
tags:
  - Dependencies
---

目前的前端项目基本上不直接去写`html`、`css`、`js`三件套了，而是使用工程化，通过包的方式引入依赖项，借助于打包工具输出最终代码。
对于依赖项的安装，package.json中有三种安装方式，`dependencies`、`devDependencies`大家应该都能搞懂，我是一直对`peerDependencies`一知半解，于是学习并简单记录下。

## dependencies
`dependencies`是生产中的依赖。通常`dependencies`下的依赖项会随着打包工具将代码打包到生产代码中，也就是线上实际要运行的代码。

例如一个`vue`框架的项目，必要的`dependencies`依赖项有：
- vue
- vuex
- vue-router
- ...

若要将依赖项安装到`dependencies`下，可以使用相应的包管理器安装，例如安装dep-lib这个包
```shell
# npm
npm install dep-lib
# or
npm install dep-lib --save

# yarn
yarn add dep-lab

# pnpm
pnpm add dep-lab
# or 
pnpm add dep-lab --save-prod
# or
pnpm add dep-lab -P
```

## devDependencies

`devDependencies`是开发中的依赖。通常`devDependencies`下的依赖项并不需要被打包到线上运行，属于开发过程中的工具。
例如：`webpack`、`vite`、`eslint`、`pritter`、`jest`等等。

若要将包安装到`devDependencies`，可使用包管理器安装
```shell
# npm
npm install dep-lab -D
# or
npm install dep-lab --save-de

# yarn
yarn add dep-lab -D
# or
yarn add dep-lab --dev

# pnpm
pnpm add dep-lab -D
# or
pnpm add dep-lab --save-dev
```

## peerDependencies
`peerDependencies`是对等依赖。在业务开发中我们一般不会用到它，使用它的场景是在开发库或框架的时候。
比如说一个库`dep-lab`使用`Typescript`开发，并且使用`Typescript`的版本为4.0.0，这个库的作者期望用户或者说用户若要使用`dep-lab`这个库，项目中`Typescript`的版本必须`>=4.0.0`，这种情况下就需要使用`peerDependencies`来约束。

```json
{
  "peerDependencies": {
    "typescript": ">=4.0.0"
  }
}
```

一般来说对等依赖项的版本应该放宽，只需要要满足库当前版本所使用的安全版本即可。

若要将包安装到`peerDependencies`，可使用包管理器安装
```shell
# npm
npm install dep-lab --save-peer

# yarn
yarn add dep-lab --peer
```

## 总结
什么样的依赖项还是要遵守规则安装在应该在模块下，随意安装是很容易导致bug的出现。
