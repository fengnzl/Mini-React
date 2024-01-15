const TEXT_ELEMENT = 'TEXT_ELEMENT'
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'string' ? createTextNode(child) : child
      }),
    },
  }
}
function createTextNode(nodeValue) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue,
      children: [],
    },
  }
}
let nextWorkOfUnit
let root = null
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  }
  root = nextWorkOfUnit
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
    // fiber.parent.dom.append(dom)
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
  // 对 root 节点只执行一次渲染
  if (!nextWorkOfUnit && root) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}
function commitRoot() {
  commitWork(root.child)
  root = null
}
function commitWork(fiber) {
  if (!fiber) return
  fiber.parent.dom.append(fiber.dom)
  if (fiber.child) commitWork(fiber.child)
  if (fiber.sibling) commitWork(fiber.sibling)
}

requestIdleCallback(workLoop)

const React = {
  createElement,
  render,
}
export default React
