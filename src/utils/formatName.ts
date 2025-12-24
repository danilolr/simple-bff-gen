export function toDotCase(str: string): string {
  return str
   .split(/(?=[A-Z])/) 
   .join('.')
   .toLowerCase();
}