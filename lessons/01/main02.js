// v02 vdom => js object
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
