const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
      const token = req?.header("x-auth-token") || undefined;
      if (!token) return res.status(403).send("denied");
      const decoded = jwt.verify(token, "patty");
      req.user = decoded;
      console.log(decoded);
      next();
    } catch (error) {
      console.log(error);
      res.status(400).send("Token invalido");
    }
};