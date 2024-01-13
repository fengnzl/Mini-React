import React from './React.js'
const ReactDOM = {
  createRoot(container) {
    return {
      render(app) {
        React.render(app, container)
      },
    }
  },
}

export default ReactDOM