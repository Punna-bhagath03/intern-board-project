# Canvas Board

A collaborative, customizable whiteboard web application for creating, decorating, and managing visual boards. Users can upload images, add decorative elements, frames, and backgrounds, and save or download their boards. Built with a React + TypeScript frontend and a Node.js + Express + MongoDB backend.


## Features

- **User Authentication**: Secure login and signup with JWT.
- **Board Management**: Create, rename, delete, and switch between multiple boards.
- **Customizable Canvas**:
  - Resize board dimensions.
  - Upload and set custom backgrounds.
  - Add, move, resize, and delete images and decorative elements.
  - Drag-and-drop frames and upload images into frames.
  - Shape selection for images (rectangle/circle).
- **Decors**:
  - Use built-in decorative assets or upload your own (PNG, JPEG, WebP).
  - Manage (add/delete) your personal decor library.
- **Download**: Export your board as a PNG or JPEG image.
- **Persistence**: All board content is saved to your account and can be restored anytime.
- **Responsive UI**: Works well on desktop and tablets.

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, RND (react-rnd), html2canvas, Vite
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Other**: Axios, REST API

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm 
- MongoDB (local or cloud)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/canvas-board.git
cd canvas-board
```

#### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

#### 3. Configure Environment

1. Run the environment setup script:
   ```bash
   # Configure environment variables
   cd backend/scripts
   ./configure-local.sh
   ```

   This will:
   - Generate secure credentials
   - Set up AWS S3 configuration
   - Configure MongoDB connection
   - Set up email settings
   - Store credentials securely

2. Configure AWS S3 buckets (first time setup):
   ```bash
   cd backend/scripts
   # Create and configure buckets
   ./configure-s3-buckets.sh
   # Set up CORS policies
   ./configure-s3-cors.sh
   ```

For production deployment, see our [Deployment Guide](./DEPLOYMENT_GUIDE.md).

#### 4. Start the Application

**Start MongoDB** (if not running already):

```bash
mongod
```

**Start Backend:**
```bash
cd backend
npm start
```

**Start Frontend:**
```bash
cd ../frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5001](http://localhost:5001)

---

## Usage

1. **Sign up** for a new account or log in.
2. **Create a new board** and give it a name.
3. **Customize your board**:
   - Upload a background image.
   - Add images or decorative elements.
   - Drag, resize, and arrange items as you like.
   - Add frames and upload images into them.
   - Change image shapes (rectangle/circle).
4. **Save** your board to persist changes.
5. **Download** your board as an image.
6. **Manage boards**: Rename, delete, or switch between boards.

---

## Project Structure

```
intern-board-project/
  backend/         # Express API, models, routes
  frontend/        # React app (src/components/whiteboard.tsx is main)
  uploads/         # Uploaded decor images
```

---

## API Endpoints

- `POST /api/auth/signup` – Register
- `POST /api/auth/login` – Login
- `GET /api/boards` – List boards
- `POST /api/boards` – Create board
- `GET /api/boards/:id` – Get board
- `PUT /api/boards/:id` – Update board
- `DELETE /api/boards/:id` – Delete board
- `POST /api/decors` – Upload decor
- `GET /api/decors` – List user decors
- `DELETE /api/decors/:id` – Delete decor

---

## Customization

- Add more default decors by placing images in `frontend/src/assets/` and updating the `DEFAULT_DECORS` array in `whiteboard.tsx`.
- To add new frame styles, update the `FramesSection` component and assets.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- [react-rnd](https://github.com/bokuweb/react-rnd)
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [Tailwind CSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
