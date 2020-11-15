let frame = 0
let readQueue = []
let writeQueue = []
let deferQueue = []

const consume = function (queue, timeout) {
  let i = 0
  let ts = 0
  while (i < queue.length && (ts = performance.now()) < timeout) {
    queue[i++](ts)
  }
  if (i === queue.length) {
    queue.length = 0
  } else if (i !== 0) {
    queue.splice(0, i)
  }
}
const flush = function () {
  frame++
  consume(readQueue, Infinity)
  const timeout = performance.now() + 14 * Math.ceil(frame * (1.0 / 10.0))
  consume(writeQueue, timeout)
  consume(deferQueue, timeout)
  if (writeQueue.length > 0) {
    deferQueue.push(writeQueue)
    writeQueue.length = 0
  }
  if (readQueue.length + writeQueue.length + deferQueue.length > 0) {
    readTask()
  } else {
    frame = 0
  }
}

export const readTask = (cb) => readQueue.push(cb) === 1 && requestAnimationFrame(flush)
export const writeTask = (cb) => writeQueue.push(cb) === 1 && Promise.resolve().then(flush)
