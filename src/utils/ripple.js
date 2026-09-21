export function createRipple(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const diameter = Math.max(button.clientWidth, button.clientHeight);

  const circle = document.createElement("span");
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
  circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
  circle.classList.add("ripple");

  const existingRipple = button.querySelector(".ripple");
  if (existingRipple) existingRipple.remove();

  button.appendChild(circle);
  circle.addEventListener("animationend", () => circle.remove());
}