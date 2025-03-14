import {chunkify} from '@axanc/ts-utils'

export const queuify = <T, P extends any[], M>({
  run,
  getQueueIndex,
  extractDataFromParams,
  reconcileParams,
  batchSize = 20,
  concurrency = 12,
}: {
  getQueueIndex?: (...p: P) => string
  extractDataFromParams: (...p: P) => M[]
  reconcileParams: (t: M[], p: P) => P
  run: (...p: P) => Promise<T>
  batchSize?: number
  concurrency?: number
}) => {
  const queues: Map<string, P[]> = new Map()
  const locks: Map<string, Promise<void>> = new Map()

  const processQueue = async (queue: string): Promise<void> => {
    if (locks.get(queue)) {
      return locks.get(queue)
    }
    const processing = (async () => {
      while (queues.get(queue)!.length > 0) {
        const params = queues.get(queue)!.shift()!
        const data = extractDataFromParams(...params)
        try {
          await chunkify({
            concurrency,
            size: batchSize,
            data: data,
            fn: (data) => {
              return run(...reconcileParams(data, params))
            },
          })
        } catch (e) {
          locks.delete(queue)
        }
      }
    })()
    locks.set(queue, processing)
    await processing
    locks.delete(queue)
  }

  return async (...p: P) => {
    const queueName = getQueueIndex ? getQueueIndex(...p) : '1'
    if (!queues.has(queueName)) {
      queues.set(queueName, [])
    }
    queues.get(queueName)!.push(p)
    await processQueue(queueName)
  }
}
