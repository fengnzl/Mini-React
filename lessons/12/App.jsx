let barCount = 1
function Bar() {
  console.log('Bar return')
  // 第一次渲染时候就调用，通过闭包将当前的 fiber 存入变量
  const update = React.update()
  function handleClick() {
    barCount++
    update()
  }
  return (
    <div>
      BarCounter: {barCount}
      <button onClick={handleClick}>click</button>
    </div>
  )
}
let fooCount = 1
function Foo() {
  console.log('Foo return')
  const update = React.update()
  function handleClick() {
    fooCount++
    update()
  }
  return (
    <div>
      FooCounter: {fooCount}
      <button onClick={handleClick}>click</button>
    </div>
  )
}
let rootCount = 1
function App() {
  console.log('app return')
  const update = React.update()
  function handleClick() {
    rootCount++
    update()
  }
  return (
    <div id="app">
      hello-mini-react
      <div>
        {rootCount} <button onClick={handleClick}>click</button>
      </div>
      <Bar />
      <Foo />
    </div>
  )
}
export default App
