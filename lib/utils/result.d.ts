export default function result<T>(valueOrFn: ((...args: any[]) => T) | T, ...args: any[]): T;
