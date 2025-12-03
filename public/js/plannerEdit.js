document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.ZU_PLANNER || {};
  const wrapper = document.querySelector(".planner-grid-wrapper");
  if (!wrapper) return;

  const plannerId = wrapper.dataset.plannerId;
  const mode = wrapper.dataset.mode;

  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const metaInputs = document.querySelectorAll(".planner-meta input");

  const modal = document.getElementById("activityModal");
  const modalBackdrop = modal.querySelector(".planner-modal-backdrop");
  const modalPlaceSelect = document.getElementById("modalPlaceSelect");
  const modalActivityText = document.getElementById("modalActivityText");
  const modalSave = document.getElementById("modalSave");
  const modalDelete = document.getElementById("modalDelete");
  const modalCancel = document.getElementById("modalCancel");

  let isEditMode = false;
  let currentDay = null;
  let currentSlot = null;
  let currentCell = null;

  if (mode === "view") {
    isEditMode = false;
    if (saveBtn) saveBtn.disabled = true;
  } else {
    isEditMode = false; // new planner → create first, then edit grid
  }

  if (!plannerId) {
    wrapper.classList.add("planner-disabled");
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      if (plannerId === "") return;

      isEditMode = true;
      editBtn.disabled = true;
      if (saveBtn) saveBtn.disabled = false;

      metaInputs.forEach((i) => i.removeAttribute("readonly"));
      wrapper.classList.remove("planner-disabled");
      wrapper.classList.add("edit-mode");
    });
  }

  if (!editBtn && mode === "new") {
    wrapper.classList.add("planner-disabled");
  }

  const openModal = (cellEl, day, slot) => {
    if (!isEditMode || !plannerId) return;

    currentCell = cellEl;
    currentDay = day;
    currentSlot = slot;

    let existingText = "";
    if (cellEl.classList.contains("planner-cell")) {
      const textSpan = cellEl.querySelector(".cell-text");
      existingText = textSpan ? textSpan.textContent.trim() : "";
    } else if (cellEl.classList.contains("daily-row")) {
      const actEl = cellEl.querySelector(".daily-activity");
      existingText = actEl ? actEl.textContent.trim() : "";
      if (existingText === "—") existingText = "";
    }

    modalPlaceSelect.value = "";
    modalActivityText.value = existingText;

    modal.classList.remove("hidden");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    currentCell = null;
    currentDay = null;
    currentSlot = null;
  };

  modalBackdrop.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);

  const updateCellDom = (cell, text) => {
    if (!cell) return;
    if (cell.classList.contains("planner-cell")) {
      const span = cell.querySelector(".cell-text");
      if (text && text.trim() !== "") {
        span.textContent = text;
        cell.classList.add("has-activity");
        cell.setAttribute("draggable", "true");
      } else {
        span.textContent = "";
        cell.classList.remove("has-activity");
        cell.removeAttribute("draggable");
      }
    } else if (cell.classList.contains("daily-row")) {
      const actEl = cell.querySelector(".daily-activity");
      if (text && text.trim() !== "") {
        actEl.textContent = text;
        cell.classList.add("has-activity");
      } else {
        actEl.textContent = "—";
        cell.classList.remove("has-activity");
      }
    }
  };

  const saveActivity = async (day, slot, text) => {
    if (!plannerId) return;

    const res = await fetch(`/planner/${plannerId}/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, time_range: slot, activity: text }),
    });

    const data = await res.json().catch(() => ({}));
    if (!data.success) {
      alert("Could not save activity.");
    }
  };

  const moveActivity = async (fromDay, fromSlot, toDay, toSlot) => {
    if (!plannerId) return;

    const res = await fetch(`/planner/${plannerId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDay, fromSlot, toDay, toSlot }),
    });

    const data = await res.json().catch(() => ({}));
    if (!data.success) {
      alert("Could not move activity.");
    }
  };

  modalSave.addEventListener("click", async () => {
    if (!currentCell || !currentDay || !currentSlot) return;

    const placeName = modalPlaceSelect.value;
    const detail = modalActivityText.value.trim();
    let finalText = detail;

    if (placeName && detail) finalText = `${placeName} – ${detail}`;
    else if (placeName && !detail) finalText = placeName;

    updateCellDom(currentCell, finalText);
    await saveActivity(currentDay, currentSlot, finalText);
    closeModal();
  });

  modalDelete.addEventListener("click", async () => {
    if (!currentCell || !currentDay || !currentSlot) return;
    updateCellDom(currentCell, "");
    await saveActivity(currentDay, currentSlot, "");
    closeModal();
  });

  const cells = document.querySelectorAll(".planner-cell");
  cells.forEach((cell) => {
    const day = cell.dataset.day;
    const slot = cell.dataset.slot;

    cell.addEventListener("click", () => {
      if (!isEditMode || !plannerId) return;
      openModal(cell, day, slot);
    });

    cell.addEventListener("dragstart", (e) => {
      if (!isEditMode || !plannerId) {
        e.preventDefault();
        return;
      }
      if (!cell.classList.contains("has-activity")) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          day,
          slot,
          text: cell.querySelector(".cell-text").textContent.trim(),
        })
      );
    });

    cell.addEventListener("dragover", (e) => {
      if (!isEditMode || !plannerId) return;
      e.preventDefault();
    });

    cell.addEventListener("drop", async (e) => {
      if (!isEditMode || !plannerId) return;
      e.preventDefault();
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const payload = JSON.parse(raw);
      const fromDay = payload.day;
      const fromSlot = payload.slot;
      const toDay = cell.dataset.day;
      const toSlot = cell.dataset.slot;

      if (fromDay === toDay && fromSlot === toSlot) return;

      const fromCell = document.querySelector(
        `.planner-cell[data-day="${fromDay}"][data-slot="${fromSlot}"]`
      );
      updateCellDom(cell, payload.text);
      updateCellDom(fromCell, "");
      await moveActivity(fromDay, fromSlot, toDay, toSlot);
    });
  });

  const dailyRows = document.querySelectorAll(".daily-row");
  dailyRows.forEach((row) => {
    const day = row.dataset.day;
    const slot = row.dataset.slot;

    row.addEventListener("click", () => {
      if (!isEditMode || !plannerId) return;
      openModal(row, day, slot);
    });
  });
});
