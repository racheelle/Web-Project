document.addEventListener("DOMContentLoaded", () => {
  const dayButtons = document.querySelectorAll(".day-btn");
  const hiddenInput = document.getElementById("days_available");

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");

      const selectedDays = [...document.querySelectorAll(".day-btn.active")]
        .map((b) => b.dataset.day)
        .join(",");

      hiddenInput.value = selectedDays;
    });
  });
});
