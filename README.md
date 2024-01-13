# Mini-React

通过实现简易的一个 React，达到理解 React 的相关理念，懂得为何要如此处理，从而在工作中能更加得心应手。

## 在页面中呈现 app

- [x] 通过 DOM API 呈现要展示的 app 字段
- [ ] 将 vdom 对象抽离，dom 渲染写死
- [ ] 通过 vdom 动态生成 dom
- [ ] 将代码重构成 React API

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

