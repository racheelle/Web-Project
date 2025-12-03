// middleware/isAuth.js
export default function isAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}
