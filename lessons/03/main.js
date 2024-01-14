let taskId = 0
function workRun(IdleDeadline) {
  taskId++

  let shouldYield = false
  while (!shouldYield) {
    // run task
    console.log(`taskId: ${taskId} run task`)
    //当前闲置时间没有时，进入到下一个闲置时间执行任务
    shouldYield = IdleDeadline.timeRemaining() < 1
  }
  requestIdleCallback(workRun)
}

requestIdleCallback(workRun)