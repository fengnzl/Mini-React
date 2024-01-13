// v01 vdom,dom 渲染写死
const dom = document.createElement('div')
dom.id = 'app'
document.querySelector('#root').append(dom)

const textNode = document.createTextNode("")
textNode.nodeValue = 'app'
dom.appendChild(textNode)
