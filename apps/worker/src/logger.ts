export function log(message: string, ...meta: any[]) {
  console.log(new Date().toISOString(), message, ...meta);
}

export function error(message: string, ...meta: any[]) {
  console.error(new Date().toISOString(), message, ...meta);
}
