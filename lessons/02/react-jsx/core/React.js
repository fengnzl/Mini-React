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
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue,
      children: [],
    },
  }
}
function render(el, container) {
  const dom =
    el.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(el.type)
  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key]
    }
  })
  const children = el.props.children
  children.forEach((child) => {
    render(child, dom)
  })
  container.append(dom)
}

const React = {
  createElement,
  render,
}
export default React
