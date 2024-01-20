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
let wipFiber = null
let stateHooks
let stateHookIndex
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
  // 渲染时，将当前组件信息存入 currentFiber
  const currentFiber = wipFiber
  return () => {
    // 点击事件，获取正在更新的组件，从而保证只更新当前组件
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }
    nextWorkOfUnit = wipRoot
  }
}
function useState(initial) {
  // 调用 setState 之后，页面应该重新渲染，所以需要将 update 函数功能移植过来
  // 渲染时，将当前组件信息存入 currentFiber
  const currentFiber = wipFiber
  // 取得之前的state 信息
  const oldHook = currentFiber?.alternate?.stateHooks[stateHookIndex]
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : []
  }
  // 批量执行 action
  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state)
  })
  // 执行完后，清空队列
  stateHook.queue = []

  stateHookIndex++
  // 将更新后的 state 信息保存在 节点上
  stateHooks.push(stateHook)
  currentFiber.stateHooks = stateHooks

  function setState(action) {
    // 判断变量是否发生改变，如果没有发生改变，则不执行更新
    const eagerState = typeof action === 'function' ? action(stateHook.state) : action
    if (eagerState === stateHook.state) return
    // 将 action 存入队列中，在下次执行 useState 时批量执行
    stateHook.queue.push(typeof action === 'function' ? action : () => action)
    // 对需要渲染的 wipRoot 进行赋值
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }
    nextWorkOfUnit = wipRoot
  }
  return [stateHook.state, setState]
}
function workLoop(IdleDeadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    // 当前组件更新完成时，则 nextWorkOfUnit 设置为 undefined，从而中断任务
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined
    }
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
  commitEffectHooks()
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
      // child 为真时，才生成 newFiber
      if (child) {
        nextFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          effectTag: 'placement',
        }
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
    // 只有当前 child 生成节点时，才赋值给 prevChild
    if (nextFiber) {
      prevChild = nextFiber
    }
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
  // 在处理函数式组件时，初始化对应的 stateHooks 和 index 的临时变量
  stateHooks = []
  stateHookIndex = 0
  // 在处理函数式组件时，初始化对应的 effectHooks 临时变量
  effectHooks = []
  wipFiber = fiber
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
function commitEffectHooks() {
  function run(fiber) {
    if (!fiber) return
    // 没有关联的老节点说明是初始化
    if (!fiber.alternate) {
      // init
      fiber.effectHooks?.forEach(hook => {
        // 回调函数返回 cleanup 函数则需要保存起来
        hook.cleanup = hook.callback()
      })
    } else {
      // update
      // 需要判断当前值和之前值是否发生变化
      fiber.effectHooks?.forEach(
        (newHook, index) => {
          // 只有存在依赖时，才去做相应的判断调用
          if (newHook.deps.length > 0) {
            const oldHook = fiber.alternate?.effectHooks[index]
            const needUpdate = oldHook?.deps.some((oldDep, i) => {
              return oldDep !== newHook.deps[i]
            })
            // 回调函数返回 cleanup 函数则需要保存起来
            needUpdate && (newHook.cleanup = newHook?.callback())
          }
        }
      )
      
    }
    run(fiber.child)
    run(fiber.sibling)
  }
  function runCleanup(fiber) {
    if (!fiber) {
      return
    }
    fiber?.alternate?.effectHooks?.forEach(hook => {
      if (hook.deps.length) {
        hook.cleanup?.()
      }
    })
    runCleanup(fiber.child)
    runCleanup(fiber.sibling)
  }
  // 在处理所有的 effect 之前，调用 cleanup 函数
  runCleanup(wipRoot)
  run(wipRoot)
}
let effectHooks
function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined
  }
  effectHooks.push(effectHook)
  wipFiber.effectHooks = effectHooks
}


const React = {
  useEffect,
  update,
  createElement,
  render,
  useState
}
export default React
