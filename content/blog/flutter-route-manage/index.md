---
title: Flutter：路由管理
date: 2019-12-06
ns: blog
description: Flutter页面间路由管理
# socialImage:
---

无论是前端浏览器页面还是端上 App 路由管理是必不可少的，路由可以让页面间跳转更加流畅。因 Flutter 万物皆 Widget 的特定，路由的跳转其实也就是切换不同的 Widget，这和前端思想很相似（组件化开发），因此很好理解。接下来就看一下 Flutter 中组件是怎么切换的。

在前端中有路由的概念，例如 Vue，有 vue-router 这个库，在 vue-router 中，所有可跳转的组件都会在路由中注册，用 route-link 组件来匹配要展示的视图，最终显示在 route-view 组件所在的位置。而 Flutter 中使用`Navigator`API 来控制路由的跳转。

在 Flutter 中也会维护一个路由的历史记录栈，通过`Navigator.push()`做路由的前进(往记录栈中存路由记录)，通过`Navigator.pop()`做路由的后退(往记录栈中出路由记录)，很像浏览器的 HistoryAPI。

### Navigator.push()

`Navigator.push()`方法用于路由的前进，它接收两个参数：

1. 第一个是当前组件的 context(Flutter 万物皆组件)
2. 第二个是 MaterialPageRoute 类表示 Material 风格的路由切换动画

由于平台的不同，对于不同的平台路由切换动画是会有些区别的

- 对于 Android 平台，当打开新的页面时，新的页面会从屏幕底部滑动到屏幕顶部；当关闭页面的时候，当前页面会从屏幕顶部滑动到屏幕底部后消失，同时上一个页面会显示在屏幕上。
- 对于 IOS 平台，当打开页面时，新的页面会从屏幕右侧边缘一致滑动到屏幕左边，知道新页面全部显示到屏幕上，而上一个页面则会从从当前屏幕滑动到屏幕左侧消失；当关闭页面时，正好相反，当前页面会从屏幕右侧滑出，同时上一个页面会从屏幕左侧滑入。

下面来说一下`MaterialPageRoute`类

MaterialPageRoute 类一共接收四个参数，其意义如下：

- builder：是一个 WidgetBuilder 类型的回调函数，它的作用是构建路由页面的具体内容，返回一个 widget，我们所做的就是实现这个回调，返回我们要跳转到新路由的实例
- settings：settings 包含路由的配置信息，如路由名称、是否是初始路由(首页)等
- maintainState：默认情况下，当入栈一个新路由时，原来的路由仍然会被保存在内存中，如果想在路由没用的时候释放其所占的所有资源，可将 maintainState 设置为 false
- fullscreeDialog：表示新的路由页面是否是一个全屏的模态对话框，在 IOS 中，如果 fullscreeDialog 为 true，新页面将会从屏幕底部滑入(而不是水平方向)

🌰：
有一个 HomePage 的 Widget

```dart
class HomePage extends StatefulWidget {
  final String title;
  HomePage({Key key, this.title}): super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home Page')
      ),
      body: Center(
        child: FlatButton(
          child: Text('open about page'),
          textColor: Colors.red,
          onPressed:() {
            //TODO 跳转的逻辑
          }
        )
      )
    )
  }
}
```

再写一个 AboutPage

```dart
class AboutPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('About Page')
      ),
      body: Center(
        child: Text('About Page Content')
      )
    )
  }
}
```

上面是两个页面的组件，我们要做的是从 HomePage 中点击按钮跳转到 AboutPage。下面来看一下按钮点击事件中的逻辑。

```dart
onPressed: () {
  Navigator.push(context, MaterialPageRoute(builder: () {
    return AboutPage()
  }))
}
```

此时点击 HomePage 中的按钮就会跳转到 AboutPage 页。

### Navitagor.pop()

`Navitagor.pop()`用于路由的回退。我们在 AboutPage 中添加一个回退按钮

```dart
class AboutPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('About Page')
      ),
      body: Center(
        child: FlatButton(
          child: Text('回退'),
          textColor: Colors.blue,
          onPressed: () => Navigator.pop(context)
        )
      )
    )
  }
}
```

当在 AboutPage 页面点击回退按钮时，Flutter 就回退到了 HomePage 页面。

### Navigator.of()

Navigator 类中的第一个参数为 context 的静态方法都会对应一个 Navigator 的实例，例如：

```dart
Navigator.push(context,MaterialPageRoute(builder: () {
  return AboutPage()
}))
//等价于
Navigator.of(context).push(MaterialPageRoute(builder: () {
  return AboutPage()
}))

Navigator.pop(context)
//等价于
Navigator.of(context).pop()
```

### 路由间传值

有页面间跳转，就必然少不了路由间传值，例如进入 App 首先进入一个活动列表页，点击活动列表页的一个活动进入该活动详情页，在详情页里就需要使用到活动 id 去请求该活动的数据，此时就需要从列表页点击活动进行路由跳转的时候带上活动 id。

那么在 Flutter 中怎么做到路由间传值的呢？

首先来说第一种方式：我们都知道每一个页面其实都是一个 Widget，严格来说都是一个类，可以在跳转的时候通过构造函数参数的形式传递进去。

🌰

```dart
class ActivityList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ActivityList')
      ),
      body: ListView(
        children: <Widget>[
          FlatButton(
            child: Text('活动1'),
            textColor: Colors.red,
            onPressed: () {
              Navigator.of(context).push(MaterialPageRoute(builder: () {
                return ActivityDetails(
                  activityId: 1
                )
              }))
            }
          )
        ]
      )
    )
  }
}
```

接下来写活动详情类

```dart
class ActivityDetails extends StatelessWidget {
  final num activityId;
  ActivityDetails({Key key, this.activityId}): super(key: key);
 @override
 Widget build(BuildContext build) {
   return Scaffold(
     appBar: AppBar(
       title: Text('活动详情页')
     ),
     body: Text('活动Id为$activityId')
   )
 }
}
```

Flutter 的 NavigatorAPI 不仅提供了前进可以带数据，还提供了返回带参数。当使用 Navigator.pop()返回的时候，也可以带数据到前一个视图中。

修改一下上面的组件。

```dart
//先修改ActivityDetails
class ActivityDetails extends StatelessWidget {
  final num activityId;
  ActivityDetails({Key key, this.activityId}): super(key: key);
 @override
 Widget build(BuildContext build) {
   return Scaffold(
     appBar: AppBar(
       title: Text('活动详情页')
     ),
     body:Column(
       children: <Widget>[
          Text('活动Id为$activityId'),
          FlatButton(
            child: Text('回退'),
            textColor: Colors.green,
            onPressed: () => Navigator.of(context).pop('我是回退的内容')
          )
       ]
     )
   )
 }
}
```

```dart
//修改ActivityList中的路由Wie可接受数据的
onPressed: async () {
  var result = await Navigator.of(context).push(MaterialPageRoute(builder: () {
    return ActivityDetails(
      activityId: 1
    );
  }));
  print('result:$result');
}
```

由于这个操作本身就是一个异步行为，所以在 ActivityList 中将 onPressed 改为异步的，Navigator.push()的返回值就是 Navigator.pop()中返回的值：`我是回退的内容`。

### 命名路由

通过上面内容已经知道了怎么去做路由的前进与回退和路由间传值。但是我们发现一个问题，路由的前进是通过返回组件实例来做的，难道说所有的组件都要写在一个文件里面吗？又或者所有的文件间引入来引入去吗？这很显然是不行的。

好在 Flutter 提供命名路由的方案。命令路由就是说给每路由都起一个名字，在根组件中维护一个路由表，跳转匹配路由名称确定跳转到哪个页面下。

路由表是一个 key-value 的 Map 结构，如下：

```dart
Map routes = <String, WidgetBuilder> = {
  '/': HomePage(),
  'about': AboutPage()
}
```

router 的配置位置在 App Widget 中，在 MaterialApp 这个 Widget 中配置。

```dart
MaterialApp(
  title: 'Flutter Deom',
  theme: ThemeData(primarySwatch: Colors.red),
  initialRoute: '/', //名字为/的路由作为应用的home(首页)
  // 路由生成钩子
  onGenerateRoute: (RouteSettings settings) {
    return MaterialPageRoute(builder: (context) {
      String routeName = settings.name;
      print(routeName);
      return;
    });
  },
  // 注册路由表
  routes: routes
);
```

上面的 MaterialApp 去掉了 home，多了 initialRoute、onGenerateRoute、routes，这三个都是可命名路由相关的。

- initialRoute：指定命名路由最庸应用的 Home 页
- routes：注册路由表，我们写的 routes 要在这里注册
- onGenerateRoute：如果有路由并没有在 routes 里注册，那么将会走到这里，它是一个方法，return 一个 MaterialPageRoute，MaterialPageRoute 返回的 Widget 实例就是所要跳转的路由。主要是做的路由的兜底。

使用命名路由的方式，在点击跳转的时候就不可以使用 push 了，而是使用 pushNamed 方法，这个方法的第一个参数指定路由表的 key 值。例如：

```dart
Navigator.of(context).pushNamed('about');
```

**命名路由的路由间传值**

当使用命名路由的时候，由于在激活路由跳转的时候并不能操作路由 Widget 了，所以之前的一种传值就不能满足当前的写法。

`Navigator.pushNamed()`方法提供 arguments 的可选命名参数，arguments 就是需要转递到下一个路由的值。

在下一个路由中使用`ModalRoute.of(context).settings.arguments`就可以取到 arguments。

例如：

```dart
// 传值
Navigator.of(context).pushNamed('about', arguments: 'Hello world');

//取值
var result = ModalRoute.of(context).settings.arguments;
print('上一个路由传过来的值：$result');
```

### 如何管理路由

在写 Vue 和 React 的时候我们是把所有的页面放在 pages 目录下，创建一个 routes 目录，在这里做路由的统一管理。Flutter 也是一个 UI 库，其思想和前端框架并不相差太多，所以也可以使用这种工程目录结构。

我们来简单定义一个工程目录结构。

```txt
 /--
  |--pages
    - HomePage.dart
    - AboutPage.dart
  |--routes
    -index.dart
  - main.dart
```

在 index.dart 中定义路由表。

```dart
//引入Material风格Widget
import 'package:flutter/material.dart';
//引入Page下的Widget
import 'package:flutter_demo/pages/HomePage.dart';
import 'package:flutter_demo/pages/AboutPage.dart';

//定义路由表
Map routes = <String, WidgetBuilder> {
  '/': HomePage(),
  'about': AboutPage()
}
```

在 main.dart 中引入`routes/index.dart`,并将 routes 注册到 MaterialApp 中。

```dart
import 'package:flutter/material.dart';
import 'package:flutter_demo/routes/index.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Deom',
        theme: ThemeData(primarySwatch: Colors.red),
        initialRoute: '/', //名字为/的路由作为应用的home(首页)
        onGenerateRoute: (RouteSettings settings) {
          return MaterialPageRoute(builder: (context) {
            String routeName = settings.name;
            print(routeName);
            return;
          });
        },
        // 注册路由表
        routes: routes
      );
  }
}
```

这样在写 Flutter 项目的时候就和写前端项目的体验相同了。

### 总结

Flutter 对前端来说还是很友好的，无论是 dart 语言还是 Flutter 框架的整体思想上和前端框架有很多相似的地方，个人感觉接收起来还是比较容易的，毕竟思想大致相同。Flutter 已经归属到了大前端体系下，值得尝试。
