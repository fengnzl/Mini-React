let isFoo = false
function Counter({ num }) {
  const Foo = <span>foo</span>
  function Bar() {
    return <p>Bar</p>
  }
  // const Bar2 = <p>Bar</p>
  function handleClick() {
    isFoo = !isFoo
    console.log('click')
    React.update()
  }
  return (
    <div>
      component:
      <div>{isFoo ? Foo : <Bar/>}</div>
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
