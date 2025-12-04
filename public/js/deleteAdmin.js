// @ts-nocheck

document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-admin-btn");

  const deleteModal = document.getElementById("deleteAdminModal");
  const deleteForm = document.getElementById("deleteAdminForm");
  const deleteText = document.getElementById("deleteAdminText");
  const closeDelete = document.getElementById("cancelDeleteAdmin");

  if (!deleteButtons || !deleteModal || !deleteForm) return;

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      deleteText.innerHTML = `Are you sure you want to delete <strong>${name}</strong>?`;

      deleteForm.setAttribute("action", `/admin/admins/delete/${id}`);

      deleteModal.classList.add("show");
    });
  });

  closeDelete.addEventListener("click", () => {
    deleteModal.classList.remove("show");
  });
});
