exports.requireAdmin = async (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
    return;
  }

  res.status(403).json({
    message: "Ban khong co quyen thuc hien thao tac quan tri nay.",
  });
};
