// controllers/mainController.js

export const getHome = (req, res) => {
  // For now we pass dummy arrays; later we'll load real data from MySQL
  const popularPlaces = []; // or some mock data if you want
  const reviews = [];

  res.render("index", {
    pageTitle: "Home",
    popularPlaces,
    reviews,
  });
};
