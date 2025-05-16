# Collaborative Whiteboard Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A real-time collaborative whiteboard application that allows multiple users to draw, design, and communicate simultaneously. Built with React, Fabric.js, Socket.io, Node.js, Express, and MongoDB.

![Collaborative Whiteboard Demo](https://via.placeholder.com/800x400?text=Collaborative+Whiteboard+Demo)

## 🌟 Features

### Core Functionality
- **Real-time Collaboration**: Multiple users can draw on the same canvas simultaneously
- **User Authentication**: Secure login/registration with JWT authentication
- **Whiteboard Management**: Create, edit, delete, and share whiteboards
- **Drawing Tools**: Selection, pen, shapes (rectangle, circle), and text tools
- **Canvas Operations**: Clear canvas, save state, export as image, delete objects
- **Collaboration Features**: Live chat, cursor tracking, and user presence indicators

### Advanced Features
- **Undo/Redo**: Full history management with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- **Live Chat**: Real-time messaging between collaborators
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: HTTP-only cookies and proper token handling

### Coming Soon
- AI-powered shape recognition
- Version control for whiteboards
- Voice/video integration
- Third-party integrations (Google Drive, Slack)
- Enhanced mobile experience

## 🚀 Technology Stack

### Frontend
- **React**: UI library with TypeScript
- **Fabric.js**: Canvas manipulation
- **Socket.io-client**: Real-time communication
- **Material UI**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Socket.io**: Real-time communication server
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (v4+)
- npm or yarn
- Docker (optional)

## 🛠️ Installation

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/collaborative-whiteboard.git
   cd collaborative-whiteboard
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

3. Access the application at http://localhost:3000

### Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/collaborative-whiteboard.git
   cd collaborative-whiteboard
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/whiteboard-app
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

6. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

7. Start the frontend development server:
   ```bash
   npm run dev
   ```

8. Access the application at http://localhost:3000

## 🎮 Usage

1. **Register/Login**: Create an account or log in to access the dashboard
2. **Create a Whiteboard**: Click "New Whiteboard" on the dashboard
3. **Invite Collaborators**: Share the whiteboard link with others
4. **Start Collaborating**: Use the toolbar to select drawing tools and colors
5. **Chat with Collaborators**: Use the chat sidebar to communicate in real-time
6. **Save Your Work**: Click the save button to store your whiteboard

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📚 API Documentation

The API documentation is available at `/api-docs` when running the backend server.

## 🔧 Configuration

### Environment Variables

#### Backend
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: JWT expiration time

#### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: WebSocket server URL

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Fabric.js](http://fabricjs.com/)
- [Socket.io](https://socket.io/)
- [Material UI](https://mui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
