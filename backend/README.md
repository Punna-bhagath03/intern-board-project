# Backend Environment Variables

Create a `.env` file in the backend root:

```
PORT=5001
MONGO_URL=mongodb://localhost:27017/canvas-board
JWT_SECRET=your_jwt_secret
GMAIL_USER=your_gmail_user
GMAIL_PASS=your_gmail_password
CLIENT_ORIGIN=http://localhost:5173
```

For production, set these to your real values.

## Security Middleware

- Uses helmet, compression, and express-rate-limit for production security.

## Production Deployment

- Deploy on EC2 (Ubuntu, Node.js, PM2, Nginx recommended).
- Set up your .env file with production values.
- Ensure CORS is set to your frontend domain.
- Use PM2 to run the server in the background.
- Use Nginx as a reverse proxy for SSL and static file serving. 