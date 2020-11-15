# opration-task-queue

> 介绍一种更加高效的更新队列

### 动机

像 vue，preact 等框架，他们的调度器是利用 microtask 一次性执行完整个队列的

https://github.com/vuejs/vue-next/blob/master/packages/runtime-core/src/scheduler.ts#L192

这样虽然可以保证操作 dom 之前组件绝对准备就绪，但……jank 阻塞问题在所难免

这个仓库则将队列进行拆分，使用 raf 对 microtask 进行切割，从而有效缓解 jank

### 实现

我们将更新划分为读任务和写任务，其中组件队列更新是一个写任务

写任务可以被 raf 切割，切割的粒度是根据排队算法计算得来的

### 本质

> 说白了就是使用 requestAnimationFrame 对 microtask 进行切割

```js
Promise.resolve().then(() => {
  queueJobs()
  requestAnimationFrame(queueJobs)
})
```

请注意 raf 也是在重绘之前清空一个队列，它和 microtask 行为差异只是按帧做了切片

从整体上来看，侵入性非常小，几乎不会产生不可预期的行为

有一点就是，我们不能只使用 raf，有很多小组件不需要一帧时间，所以我使用位运算写了一个简单的排队算法

https://www.zhihu.com/topic/21187638/hot

未来可以从排队论中寻找灵感，比如增加忙时和闲时，将 ric 用起来

### 优点

仍旧是同步渲染，侵入性非常小

有效缓解 jank，提高响应性能

### 缺点

仅适用于浏览器，而且不能使用 setTimeout 模拟

好消息是，我们可以退回到 microtask，等于没切
