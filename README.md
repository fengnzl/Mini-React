# Mini-React

通过实现简易的一个 React，达到理解 React 的相关理念，懂得为何要如此处理，从而在工作中能更加得心应手。

## 在页面中呈现 app

- [x] 通过 DOM API 呈现要展示的 app 字段
- [x] 将 vdom 对象抽离，dom 渲染写死
- [x] 通过 vdom 动态生成 dom
- [x] 将代码重构成 React API

最终目标：`ReactDom.createRoot(document.querySelector('#root')).render(<App />)`

通过上述代码我们可以知道，`ReactDom` 是一个对象，具有 `createRoot` 方法，该方法接收一个渲染容器，该方法的返回值是一个具有 `render` 方法的对象，`render` 接收一个 `App ` (JSX这里暂时忽略) ，并将该 `App` 内容渲染到容器中去。

首先我们可以通过 `DOM API` 先将 `app` 显示在页面中，然后按照上述步骤一步一步最终实现目标。

### 通过 DOM API 渲染出 app 字段

这里我们直接使用 DOM API 实现如下：

```javascript
const dom = document.createElement('div')
dom.id = 'app'
document.querySelector('#root').append(dom)

const textNode = document.createTextNode("")
textNode.nodeValue = 'app'
dom.appendChild(textNode)
```

并在 `index.html` 中进行引入

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mini-react</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

### 将 vdom 抽离

不管是 React 还是 Vue 这两个框架都采用了虚拟 DOM，这是因为直接修改真实的 DOM 很难跟踪状态发生的改变，同时频繁的操作真是 DOM 会造成性能地下。虚拟 DOM 是一个编程理念，UI 以一种理想化或者虚拟化的方式保存在内存中，并且它是一个相对简单的 JavaScript 对象。

这里我们只是简单的将要渲染的 DOM 元素的相关信息抽离成一个 JavaScript 对象。

这里其实与 Vue 的虚拟 DOM 结构类似，只不过是将 `children` 属性放置在了 `props` 对象中

```javascript
const textEl = {
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue: 'app',
    children: []
  }
}
const el = {
  type: 'div',
  props: {
    id: 'app',
    children: [textEl]
  }
}
const dom = document.createElement(el.type)
dom.id = el.props.id
document.querySelector('#root').append(dom)

const textNode = document.createTextNode('')
textNode.nodeValue = textEl.props.nodeValue
dom.appendChild(textNode)
```

### vdom 动态渲染成 dom

在上一小节我们将 `el` 和 `textEl` 写死，实际上我们在开发过程中是根据元素动态生成对应的元素，因此我们需要创建 `createElement` 和 `createTextNode` 方法，动态生成 vdom 对象。

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child;
      }),
    }
  }
}
function createTextNode(nodeValue) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue,
      children: [],
    },
  }
}
```

当我们有了 vdom 对象时，就需要递归遍历生成真实的 dom 数，这就需要 `render` 函数来进行处理。同时这里只是简单的模拟，因此一些边界情况我们会有一些忽略。

```javascript
function render(el, container) {
  const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(el.type)
  Object.keys(el.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = el.props[key]
    }
  })
  const children = el.props.children
  children.forEach(child => {
    render(child, dom)
  })
  container.append(dom)
}
const el = createElement('div', { id: 'app' }, 'hello', '-react')
render(el, document.querySelector('#root'))
```

### 代码重构成 React API

我们需要将上述代码重构成平时类似写 React 代码时候的结构，如引用、使用等，如下所示：

![image-20240113231758697](./images/image-20240113231758697.png)

这里我们先暂时忽略 `JSX`，根据之前分析，我们可以写出 `ReactDOM` 对象如下所示：

```javascript
// /core/ReactDOM.js
import React from "./React.js"
const ReactDOM = {
  createRoot(container) {
    return {
      render(app) {
        React.render(app, container)
      }
    }
  }
}
export default ReactDOM
```

然后将之前的 `createElement` 、`createTextNode `和 `render`  等函数移至 `/core/React.js` 文件中

之后我们在 `App.js`  文件中编写如下代码 

```javascript
import React from './core/React.js'
const App = React.createElement('div', { id: 'app' }, 'hello', '-world', '-react')
export default App
```

之后在 `main.js` 文件中引入即可，至此重构工作已经完成

```javascript
import ReactDOM from './core/ReactDOM.js'
import App from './App.js'

ReactDOM.createRoot(document.querySelector('#root')).render(App)
```

## 解析 JSX

平时，如果我们写 React 代码都会使用 `JSX` 语法，而不是使用 `React.createElement` API 进行书写，因此我们这里也需要支持解析 `JSX` 语法。

如果平时我们使用 CDN 快速体验时，需要使用 `babel` 将 `JSX` 代码解析成 `React.createElement` 的形式，这里我们只需要使用 `vite` 即可实现。

通过  `pnpm create vite`  命令使用 `vite` 快速创建一个项目，并将之前的代码拷贝一份过来即可，这里我们暂时还没处理  `Functional Component` 因此，只能先使用以下形式

```jsx
// app.jsx
import React from './core/React.js'
const App = <div id="app">hello<span>-react</span></div>
function AppOne() {
  return <div>this is jsx</div>
}
console.log(AppOne)
export default App
```

同时 `main.js` 修改如下

```javascript
import React from './core/React.js';
import ReactDOM from "./core/ReactDom.js";
import App from "./App.jsx";
ReactDOM.createRoot(document.querySelector("#root")).render(App);
```

如果我们想自定义 React 的名字可以使用以下两种方法

- 使用 `js pragma`

  ```jsx
  // js pragma
  /**@jsx CReact.createElement */
  import CReact from "./core/React.js";
  const App = <div>hi-mini-react</div>;
  ```

  ![image-20240114004701612](./images/image-20240114004701612.png)

- 配置 `vite esbuild` 配置语法

```js
import { defineConfig } from "vite";

export default defineConfig({
  // https://esbuild.github.io/api/#jsx-factory
  esbuild: {
    jsxFactory: 'MyReact.createElement',
    jsxFragment: 'Fragment',
    jsxInject: `import MyReact from './core/React'`,
  },
})
```

## 实现任务调度器

上述 `render` 函数执行的时候我们可以发现，当 vdom 层级过深时，会一直递归下去。在浏览器中，在浏览器中 GUI 渲染线程和 JS 引擎线程是互斥的。因此，即使在代码中先创建了 DOM 元素，也不会立即呈现到屏幕上，而是等待主线程上的执行完成。从而层级过深会导致渲染卡顿。

为了解决上述问题，我们就需要将一个大任务分成多个小任务进行执行。这里我们采用 [requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback) 来将任务在浏览器空闲时候进行调用。

模拟过程如下所示：

```javascript
let taskId = 0
function workRun(IdleDeadline) {
  taskId++

  let shouldYield = false
  while (!shouldYield) {
    // run task
    console.log(`taskId: ${taskId} run task`)
    //当前闲置时间没有时，进入到下一个闲置时间执行任务
    shouldYield = IdleDeadline.timeRemaining() < 1
  }
  requestIdleCallback(workRun)
}

requestIdleCallback(workRun)
```

## 实现 fiber 架构

知道上面的原理之后，我们如何做到每次只渲染几个节点，且在下次任务执行的时候依然从之前的位置执行？

这就需要我们将原来的树结构转换为链表，在每个节点中记录 child、sibling、parent 信息，从而在下次执行的任务的时候，通过当前的节点对象找到待执行的节点信息。主要按照以下顺序来判读

- 时候有 child 节点，有则处理 child 节点
- 没有 child 节点，判断是否有 sibling 兄弟节点，如果有则处理 sibling 节点
- 如果都没有，则处理叔叔节点

具体如下面所示：

![node](./images/node.png)

在这里我们实现 `performWorkOfUnit` 函数，在这里我们主要处理以下事件

- 生成 dom，将生成的 dom append 到父元素中
- 处理生成 dom 的 props
- 建立当前节点的链表关系（重难点：`child`、`sibling` 和 `parent`）
- 按照之前所说顺序返回下一个待处理节点，最后可能没有节点，说明已经处理完成，此时需要在 `requestIdleCallback` 函数增加相应的判断，没有节点则结束任务

```js
// core/React.js
let nextWorkOfUnit
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  }
}
function createDom(type) {
  return type === TEXT_ELEMENT
    ? document.createTextNode('')
    : document.createElement(type)
}
function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = props[key]
    }
  })
}
function initChildren(fiber) {
  const children = fiber.props.children
  let prevChild
  children.forEach((child, index) => {
    const nextFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
    }
    // 处理第一个 child
    if (index === 0) {
      fiber.child = nextFiber
    } else {
      // 将当前节点赋值给上一个相邻节点的兄弟
      prevChild.sibling = nextFiber
    }
    prevChild = nextFiber
  })
}
function performWorkOfUnit(fiber) {
  // 生成 dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))
    // append dom 到 父元素
    fiber.parent.dom.append(dom)
    // 处理 props
    updateProps(dom, fiber.props)
  }
  // 处理 children
  initChildren(fiber)
  // 返回下一个要处理的节点
  // 如果有子节点
  if (fiber.child) {
    return fiber.child
  }
  // 如果有兄弟节点
  if (fiber.sibling) {
    return fiber.sibling
  }
  // 返回叔叔节点
  return fiber.parent?.sibling
}
function workLoop(IdleDeadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    //当前闲置时间没有时，进入到下一个闲置时间执行任务
    shouldYield = IdleDeadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
```

