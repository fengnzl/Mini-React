const TEXT_ELEMENT = 'TEXT_ELEMENT'
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
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
let wipRoot = null
let currentRoot = null
let deletions = []
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  }
  nextWorkOfUnit = wipRoot
}
function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  }
  nextWorkOfUnit = wipRoot
}
function workLoop(IdleDeadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    //当前闲置时间没有时，进入到下一个闲置时间执行任务
    shouldYield = IdleDeadline.timeRemaining() < 1
  }
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

function createDom(type) {
  return type === TEXT_ELEMENT
    ? document.createTextNode('')
    : document.createElement(type)
}

function performWorkOfUnit(fiber) {
  // 新增 FC 判断
  const isFunctionComponent = typeof fiber.type === 'function'
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 返回下一个要处理的节点
  // 如果有子节点
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    // 如果有兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function commitRoot() {
  deletions.forEach(commitDeletions)
  commitWork(wipRoot.child)
  // 清空 deletions 数组
  deletions = []
  // 保存渲染后的 dom 树
  currentRoot = wipRoot
  wipRoot = null
}
function commitDeletions(fiber) {
  // 有 dom 元素 直接删除
  if (fiber.dom) {
    //方法1 因为可能是函数式组件内部的 dom，其 parent 不存在，因此需要递归向上寻找
    // let fiberParent = fiber.parent
    // // 如果父级没有 dom 函数值组件
    // while (!fiberParent.dom) {
    //   fiberParent = fiberParent.parent
    // }
    // fiberParent.dom.removeChild(fiber.dom)
    // 方法2 调用 dom.remove 方法 将节点从其所属 DOM 树中删除
    fiber.dom.remove()
  } else {
    // 没有 dom 元素即函数式组件，则处理其 child
    commitDeletions(fiber.child)
  }
}
function commitWork(fiber) {
  if (!fiber) return
  let fiberParent = fiber.parent
  // 如果父级没有 dom 函数值组件
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  // 更新 props
  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate.props)
  } else if (fiber.effectTag === 'placement') {
    // 新增
    if (fiber.dom) fiberParent.dom.append(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
requestIdleCallback(workLoop)

function updateProps(dom, nextProps, prevProps) {
  // 1 老得 Props 有 新的 Props 没有 删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== 'children') {
      if (!nextProps.hasOwnProperty(key)) {
        dom.removeAttribute(key)
      }
    }
  })
  // 2 老得 props 没有，新的 props 有 新增
  // 3 老得 props 有，新的 props 有 修改
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        // 是否是事件
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase()
          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])
        } else {
          dom[key] = nextProps[key]
        }
      }
    }
  })
}
function reconcile(fiber, children) {
  let oldFiber = fiber.alternate?.child
  let prevChild
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type
    let nextFiber
    // 如果是同一种类型 说明是 update,此时不用在重新创建 dom
    // 增加 effectTag 从而在 commitWork 中判断是更新还是新增，这里更新我们暂时处理props
    if (isSameType) {
      nextFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'update',
      }
    } else {
      nextFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: null,
        effectTag: 'placement',
      }
      // 类型不同，将老节点添加到删除数组，后续统一删除
      if (oldFiber) {
        deletions.push(oldFiber)
      }
    }
    // 更新 oldFiber 从而与最新的节点保持对应关系
    if (oldFiber) {
      oldFiber = oldFiber.sibling
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
  // 如果 oldFiber 仍然有值，说明是老旧节点，需要删除
  while (oldFiber) {
    deletions.push(oldFiber)
    // 可能存在多个老旧节点
    oldFiber = oldFiber.sibling
  }
}
// 处理函数式组件
function updateFunctionComponent(fiber) {
  // 函数式组件不用生成 dom
  const children = [fiber.type(fiber.props)]
  reconcile(fiber, children)
}
// 处理普通组件
function updateHostComponent(fiber) {
  // 生成 dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))
    // 处理 props
    updateProps(dom, fiber.props, {})
  }
  // 处理 children 函数式组件需要单独处理
  const children = fiber.props.children
  reconcile(fiber, children)
}


const React = {
  update,
  createElement,
  render,
}
export default React
