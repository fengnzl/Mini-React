function Foo() {
  console.log('re foo')
  const [count, setCount] = React.useState(0)
  React.useEffect(() => {
    console.log('init')
  }, [])
  React.useEffect(() => {
    console.log('count', count)
  }, [count])
  function handleClick() {
    setCount((c) => c + 1)
  }
  return (
    <div>
      {count}
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
