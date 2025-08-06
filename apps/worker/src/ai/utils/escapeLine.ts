export function escapeLine(str: string) {
  return str.replace(/\r?\n/g, ' ');
}
