document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("deletePlannerModal");
  const deleteText = document.getElementById("plannerDeleteText");
  const deleteForm = document.getElementById("deletePlannerForm");
  const cancelBtn = document.getElementById("cancelPlannerDelete");

  document.querySelectorAll(".delete-planner-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      deleteText.textContent = `Delete planner "${name}"?`;
      deleteForm.action = `/planner/${id}/delete`;

      modal.classList.add("show");
    });
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });
});
