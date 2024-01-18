let isFoo = false
function Counter({ num }) {
  const foo = (
    <div>
      Foo
      <div>foo-child</div>
    </div>
  )
  const bar = <div>Bar</div>
  function handleClick() {
    isFoo = !isFoo
    console.log('click')
    React.update()
  }
  return (
    <div>
      component:
      <div>{isFoo ? foo : bar}</div>
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
