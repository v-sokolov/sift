export function autofocus(node: HTMLElement): void {
  node.focus();
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    node.select();
  }
}
