export function generateUID() {
  const timePart = Date.now().toString(36);
  const randomPart = (Math.random() * 1e6 | 0).toString(36);
  return `e${timePart}${randomPart}`;
}
export default generateUID;
