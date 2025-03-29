export function capitalize(input: string): string {
  if (!input) {
    return '';
  }

  return input[0].toUpperCase() + input.substring(1);
}
