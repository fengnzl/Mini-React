import { render } from "./React.js"
const ReactDOM = {
  createRoot(container) {
    return {
      render(app) {
        render(app, container)
      },
    }
  },
}

export default ReactDOM