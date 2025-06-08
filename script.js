// Split name into spans
const nameEl = document.getElementById("name");
const nameText = "Li Zhen";
nameEl.innerHTML = nameText
  .split("")
  .map(ch => `<span class="letter">${ch}</span>`)
  .join("") +
  `<span class="cursor">|</span>`;

// Animate letters in
gsap.from(".letter", {
  textContent: "",
  duration: 1.2,
  ease: "none",
  stagger: 0.1
});

// Cursor blink is pure CSS (@keyframes blink-caret)
