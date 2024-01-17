let count = 10
function Counter({ num }) {
  function handleClick() {
    count++
    console.log('click')
    React.update()
  }
  return (
    <div>
      count: {count}
      <button onClick={handleClick}>click</button>
    </div>
  )
}
function App(){
  return (
    <div id="app">
      <div>hello-mini-react</div>
      {/* <CounterContainer /> */}
      <Counter num={1}></Counter>
    </div>
  )
}
export default App
