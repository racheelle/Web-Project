// @ts-nocheck

console.log("ADMIN JS LOADED!");

document.addEventListener("DOMContentLoaded", () => {
  const viewButtons = document.querySelectorAll(".view-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");

  const messageModal = document.getElementById("messageModal");
  const deleteModal = document.getElementById("deleteModal");

  const closeMessage = document.getElementById("closeMessage");
  const closeDelete = document.getElementById("closeDelete");

  const modalName = document.getElementById("modalName");
  const modalEmail = document.getElementById("modalEmail");
  const modalMessage = document.getElementById("modalMessage");

  const deleteForm = document.getElementById("deleteForm");


  if (messageModal && closeMessage && modalName && modalEmail && modalMessage) {
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name") || "";
        const email = btn.getAttribute("data-email") || "";
        const msg = btn.getAttribute("data-message") || "";

        modalName.textContent = name;
        modalEmail.textContent = email;
        modalMessage.textContent = msg;

        messageModal.classList.add("show");
      });
    });

    closeMessage.addEventListener("click", () => {
      messageModal.classList.remove("show");
    });
  }

  if (deleteModal && closeDelete && deleteForm) {
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;

        deleteForm.setAttribute("action", `/admin/messages/delete/${id}`);
        deleteModal.classList.add("show");
      });
    });

    closeDelete.addEventListener("click", () => {
      deleteModal.classList.remove("show");
    });
  }
});
