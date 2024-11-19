const jwt = require('jsonwebtoken');

// isAuthenticated Middleware with conditional check for specific routes
const isAuthenticated = (req, res, next) => {
    // List of routes that don't require authentication
    const publicRoutes = ['/admin/login', '/admin/create'];

    // If the route is public, skip authentication and proceed
    if (publicRoutes.includes(req.path)) {
        return next(); // Skip authentication and continue to the next middleware/handler
    }

    // If not a public route, proceed with token verification
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        // Attach decoded user info to request object
        req.user = decoded;
        next(); // Token is valid, proceed to the next middleware/handler
    });
};

module.exports = isAuthenticated;
