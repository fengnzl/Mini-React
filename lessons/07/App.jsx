function Counter({ num }) {
  function handleClick() {
    console.log('click')
  }
  return (
    <div>
      count: {num} <button onClick={handleClick}>click</button>
    </div>
  )
}
function CounterContainer() {
  return <Counter></Counter>
}
function App() {
  return (
    <div id="app">
      <div>hello-mini-react</div>
      {/* <CounterContainer /> */}
      <Counter num={1}></Counter>
      <Counter num={2}></Counter>
    </div>
  )
}
export default App
