document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("deleteModal");
  const closeModal = document.getElementById("closeModal");
  const deleteForm = document.getElementById("deleteForm");
  const deleteButtons = document.querySelectorAll(".btn-delete");

  // Open modal
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const name = btn.getAttribute("data-name");

      // Set modal text
      document.getElementById("modalText").innerText =
        `Are you sure you want to delete "${name}"?`;

      // Set form action
      deleteForm.action = `/admin/places/delete/${id}`;

      // Show modal
      modal.classList.add("show");
    });
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  // Close when clicking outside box
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });
});
