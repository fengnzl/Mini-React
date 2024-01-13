// js pragma
// /**@jsx MReact.createElement */
import MReact from './core/React.js'
const App = (
  <div id="app">
    hello<span>-react</span>
  </div>
)
function AppOne() {
  return <div>this is jsx</div>
}
console.log(AppOne)
export default App
