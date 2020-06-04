import { EventEmitter } from "events";

export function eventToPromise<T>(emitter: EventEmitter, eventNames?: { onData: string, onEnd: string, onError: string }): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const items: T[] = [];
    emitter.on(eventNames?.onData || "data", function (item: T) {
      items.push(item);
    });
    emitter.on(eventNames?.onError || "error", function (err) {
      reject(err);
    });
    emitter.on(eventNames?.onEnd || "end", function(){
      resolve(items);
    })
  });
}