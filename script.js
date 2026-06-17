console.log("Potato’s Day v0.4.3-preview.1");

const workflowOpenButton = document.querySelector("[data-workflow-open]");
const workflowModal = document.querySelector("#workflow-modal");
const workflowCloseButton = document.querySelector("[data-workflow-close]");

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
