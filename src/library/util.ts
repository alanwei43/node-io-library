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
    emitter.on(eventNames?.onEnd || "end", function () {
      resolve(items);
    })
  });
}
export function repeat<T>(count: number, char: T): Array<T> {
  return [...Array(count)].map(() => char);
}
export function range(start: number, end: number): Array<number> {
  return [...Array(end - start)].map((val, index) => start + index);
}
export function humanSize(size: number): [number, string] {
  let result = { size: size, unit: "B" };

  if (size > 1024) {
    result.size = parseFloat((size / 1024).toFixed(2));
    result.unit = "KB";
  }

  if (size > 1024 * 1024) {
    result.size = parseFloat((size / (1024 * 1024)).toFixed(2));
    result.unit = "MB";
  }
  if (size > 1024 * 1024 * 1024) {
    result.size = parseFloat((size / (1024 * 1024 * 1024)).toFixed(2));
    result.unit = "GB";
  }

  return [result.size, result.unit];
}