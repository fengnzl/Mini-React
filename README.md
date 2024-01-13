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

![image-20240113231758697](/Users/fengliu/Desktop/learn_react/mini-react/images/image-20240113231758697.png)

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

