let showBar = false
function Counter() {
  const bar = <div>this is bar</div>
  function handleClick() {
    showBar = !showBar
    React.update()
  }
  return (
    <div>
      Counter:
      {showBar && bar}
      <button onClick={handleClick}>click</button>
    </div>
  )
}
function App(){
  return (
    <div id="app">
      <div>hello-mini-react</div>
      {/* <CounterContainer /> */}
      <Counter ></Counter>
    </div>
  )
}
export default App
