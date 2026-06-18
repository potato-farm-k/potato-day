console.log("Potato’s Day v0.6");

const workflowOpenButton = document.querySelector("[data-workflow-open]");
const workflowModal = document.querySelector("#workflow-modal");
const workflowCloseButton = document.querySelector("[data-workflow-close]");
const gamjaCallButton = document.querySelector("[data-call-gamja]");
const gamjaStatus = document.querySelector("[data-gamja-status]");
const gamjaMessage = document.querySelector("[data-gamja-message]");
const gamjaCharacter = document.querySelector(".gamja-character");
const gamjaResponses = [
  "멍! 불렀어?",
  "감자가 기분 좋아졌어요!",
  "오늘도 같이 쉬어요.",
  "감자가 반갑게 바라봅니다.",
];

let gamjaResponseIndex = 0;
let gamjaReactionTimer;

if (workflowOpenButton && workflowModal && workflowCloseButton) {
  const openWorkflowModal = () => {
    workflowModal.hidden = false;
    workflowOpenButton.setAttribute("aria-expanded", "true");
    workflowCloseButton.focus();
  };

  const closeWorkflowModal = () => {
    workflowModal.hidden = true;
    workflowOpenButton.setAttribute("aria-expanded", "false");
    workflowOpenButton.focus();
  };

  workflowOpenButton.addEventListener("click", openWorkflowModal);
  workflowCloseButton.addEventListener("click", closeWorkflowModal);

  workflowModal.addEventListener("click", (event) => {
    if (event.target === workflowModal) {
      closeWorkflowModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !workflowModal.hidden) {
      closeWorkflowModal();
    }
  });
}

if (gamjaCallButton && gamjaStatus && gamjaMessage && gamjaCharacter) {
  gamjaCallButton.addEventListener("click", () => {
    const response = gamjaResponses[gamjaResponseIndex % gamjaResponses.length];
    gamjaResponseIndex += 1;

    gamjaStatus.textContent = response;
    gamjaMessage.textContent = response;
    gamjaMessage.hidden = false;

    gamjaCharacter.classList.remove("is-happy");
    gamjaMessage.classList.remove("is-happy");
    window.clearTimeout(gamjaReactionTimer);
    void gamjaCharacter.offsetWidth;

    requestAnimationFrame(() => {
      gamjaCharacter.classList.add("is-happy");
      gamjaMessage.classList.add("is-happy");
    });

    gamjaReactionTimer = window.setTimeout(() => {
      gamjaCharacter.classList.remove("is-happy");
      gamjaMessage.classList.remove("is-happy");
    }, 760);
  });
}
