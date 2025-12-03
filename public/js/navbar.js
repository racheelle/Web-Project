document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".account-btn");
  const wrapper = document.querySelector(".account-wrapper");

  if (btn) {
    btn.addEventListener("click", () => {
      wrapper.classList.toggle("show");
    });

    // CLOSE MENU if clicking outside
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove("show");
      }
    });
  }
});
