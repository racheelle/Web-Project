document.addEventListener("DOMContentLoaded", () => {
  if (typeof Swiper === "undefined") return;

  const swipers = document.querySelectorAll(".explore-swiper");

  swipers.forEach((swiperEl) => {
    const categoryId = swiperEl.dataset.categoryId;
    const nextSelector = `.swiper-button-next-${categoryId}`;
    const prevSelector = `.swiper-button-prev-${categoryId}`;

    new Swiper(swiperEl, {
      slidesPerView: 1.1,
      spaceBetween: 18,
      loop: false,
      navigation: {
        nextEl: nextSelector,
        prevEl: prevSelector,
      },
      pagination: {
        el: swiperEl.querySelector(".swiper-pagination"),
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 1.4,
        },
        768: {
          slidesPerView: 2.1,
        },
        1024: {
          slidesPerView: 3,
        },
      },
    });
  });
});

document.querySelectorAll(".swiper-button-prev, .swiper-button-next").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
});
