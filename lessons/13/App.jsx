function Foo() {
  const [count, setCount] = React.useState(0)
  const [bar, setBar] = React.useState('bar')
  function handleClick() {
    setCount((c) => c + 1)
    setBar((c) => c + 'bar')
  }
  return (
    <div>
      {count}
      <div>{bar}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}
function App() {
  return (
    <div id="app">
      hello-mini-react
      <Foo />
    </div>
  )
}
export default App
