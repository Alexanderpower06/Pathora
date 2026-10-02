export const $ = (selector) => document.querySelector(selector);
export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function action(text, onClick, className = 'button secondary') {
  const button = el('button', text, className);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}
export function link(text, url, className = 'resource-link') {
  const node = el('a', text, className);
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  return node;
}
export function heading(title, description, label) {
  const block = el('div', undefined, 'page-heading');
  if (label) block.append(el('p', label, 'eyebrow'));
  block.append(el('h1', title));
  if (description) block.append(el('p', description, 'lead'));
  return block;
}
export function panel(title, description) {
  const section = el('section', undefined, 'panel');
  if (title) section.append(el('h2', title));
  if (description) section.append(el('p', description, 'muted'));
  return section;
}
export function notice(message, error = false) {
  const node = $('#notice');
  node.textContent = message;
  node.hidden = !message;
  node.classList.toggle('error', error);
}
export async function submit(form, errorSelector, operation) {
  const button = form.querySelector('[type="submit"]');
  const error = $(errorSelector);
  button.disabled = true;
  error.hidden = true;
  try {
    await operation();
  } catch (failure) {
    error.textContent = failure.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
  }
}
export function empty(title, description) {
  const node = panel(title, description);
  node.classList.add('empty');
  return node;
}
