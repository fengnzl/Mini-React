function Counter({ num, isFirst }) {
  return <div>count: {num}, isFirst: {isFirst}</div>
}
function CounterContainer() {
  return <Counter></Counter>
}
function App() {
  return (
    <div id="app">
      <div>hello-mini-react</div>
      {/* <CounterContainer /> */}
      <Counter num={1} isFirst={true}></Counter>
      <Counter num={2}></Counter>
    </div>
  )
}
export default App
