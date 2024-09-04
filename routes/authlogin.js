// middleware/authenticate.js
const authenticateMiddleware = (req, res, next) => {
    if (req.session.user) {
              next();
    } else {
      req.session.message = {
        type: 'danger',
        message: 'You need to log in first.',
      };
      res.redirect('/login');
    }
  };
  
  module.exports = authenticateMiddleware;
  