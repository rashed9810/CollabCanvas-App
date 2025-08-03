# CollabCanvas - Real-Time Collaborative Whiteboard Application

A modern, real-time collaborative whiteboard application built with React, Node.js, Socket.io, and Fabric.js. Create, share, and collaborate on whiteboards with multiple users in real-time.

## 🚀 Features

### Core Functionality
- **Real-time Collaboration**: Multiple users can draw and edit simultaneously
- **Live Cursor Tracking**: See other users' cursors in real-time
- **Drawing Tools**: Pen, shapes (rectangle, circle), text, and selection tools
- **Canvas Management**: Undo/redo, clear canvas, save/load functionality
- **Export Options**: Export whiteboards as PNG images

### User Management
- **Authentication**: Secure user registration and login
- **User Profiles**: Personalized user accounts
- **Session Management**: JWT-based authentication with HTTP-only cookies

### Whiteboard Features
- **Create & Manage**: Create new whiteboards and manage existing ones
- **Privacy Controls**: Public and private whiteboard options
- **Collaboration**: Add collaborators to whiteboards
- **Persistent Storage**: Whiteboards are saved to MongoDB
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Real-time Features
- **Socket.io Integration**: Real-time drawing synchronization
- **Live Chat**: Built-in chat functionality for each whiteboard
- **Cursor Presence**: See where other users are working
- **Instant Updates**: Changes appear immediately for all users

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Fabric.js** for canvas manipulation
- **Socket.io Client** for real-time communication
- **React Router** for navigation
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CollabCanvas-App
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard-app
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas cloud service
```

### 5. Run the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

## 🎯 Usage

### Getting Started
1. **Visit the Application**: Open `http://localhost:5173` in your browser
2. **Create Account**: Register a new user account
3. **Login**: Sign in with your credentials
4. **Create Whiteboard**: Click "Create New Whiteboard" on the dashboard
5. **Start Drawing**: Use the toolbar to select tools and start creating

### Drawing Tools
- **Select Tool**: Move and resize objects
- **Pen Tool**: Free-hand drawing
- **Rectangle Tool**: Draw rectangles
- **Circle Tool**: Draw circles
- **Text Tool**: Add text elements

### Collaboration
- **Share Whiteboard**: Use the share button to copy the whiteboard link
- **Real-time Updates**: Changes appear instantly for all users
- **Live Cursors**: See where other users are working
- **Chat**: Use the chat sidebar to communicate

### Keyboard Shortcuts
- **Ctrl+Z**: Undo last action
- **Ctrl+Y** or **Ctrl+Shift+Z**: Redo action
- **Delete**: Remove selected objects

## 🏗️ Project Structure

```
CollabCanvas-App/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Socket.io services
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and socket services
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main App component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/profile` - Get user profile

### Whiteboards
- `GET /api/whiteboards` - Get user's whiteboards
- `POST /api/whiteboards` - Create new whiteboard
- `GET /api/whiteboards/:id` - Get specific whiteboard
- `PUT /api/whiteboards/:id` - Update whiteboard
- `DELETE /api/whiteboards/:id` - Delete whiteboard
- `POST /api/whiteboards/:id/collaborators` - Add collaborator
- `DELETE /api/whiteboards/:id/collaborators/:userId` - Remove collaborator

## 🔌 Socket.io Events

### Client to Server
- `join-room` - Join a whiteboard room
- `draw-event` - Send drawing data
- `cursor-position` - Send cursor position

### Server to Client
- `draw-event` - Receive drawing data
- `cursor-move` - Receive cursor positions
- `canvas-data` - Receive full canvas data

## 🎨 Customization

### Adding New Drawing Tools
1. Add the tool type to the `useCanvas` hook
2. Implement the tool logic in the mouse event handlers
3. Add the tool button to the `WhiteboardToolbar` component

### Styling
- The application uses Tailwind CSS for utility-first styling
- Material-UI components can be customized using the theme system
- Custom styles are in component-specific CSS files

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code:
```bash
cd backend
npm run build
```

2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the React application:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to a static hosting service (Netlify, Vercel, etc.)

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=your-production-frontend-url
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`

2. **Socket.io Connection Issues**
   - Verify CORS settings
   - Check firewall settings

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript configuration

### Performance Optimization
- Use MongoDB indexes for better query performance
- Implement canvas object pooling for large drawings
- Add compression for socket.io messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Fabric.js** for the powerful canvas library
- **Socket.io** for real-time communication
- **Material-UI** for the beautiful UI components
- **MongoDB** for the flexible database solution

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Happy Collaborating! 🎨✨**
