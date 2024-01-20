function Foo() {
  console.log('re foo')
  const [count, setCount] = React.useState(0)
  const [bar, setBar] = React.useState('bar')
  React.useEffect(() => {
    console.log('init')
    return () => {
      console.log('cleanup 0')
    }
  }, [])
  React.useEffect(() => {
    console.log('count', count)
    return () => {
      console.log('cleanup 1')
    }
  }, [count])
  React.useEffect(() => {
    console.log('bar', bar)
    return () => {
      console.log('cleanup 2')
    }
  }, [bar])
  function handleClick() {
    setCount((c) => c + 1)
    setBar(c => c + 'bar')
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
