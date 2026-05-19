# Agile Planning Poker Application

A modern, full-featured Planning Poker application built with Angular 18 and Node.js Express server that replicates and enhances the functionality of planningpokeronline.com for agile estimation sessions.

![Planning Poker](https://img.shields.io/badge/Planning%20Poker-Real%20Time-blue)
![Angular](https://img.shields.io/badge/Angular-18-red)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Real%20Time-yellow)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🚀 Features

### ✅ **Game Management**
- **Create Games**: Easy game setup with configurable settings
- **Multiple Voting Systems**: 
  - Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)
  - T-Shirt Sizes (XS, S, M, L, XL, XXL, ?, ☕)
  - Powers of 2 (0, 1, 2, 4, 8, 16, 32, 64, ?, ☕)
  - Sequential (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ?, ☕)
- **Permission Management**: Configure who can reveal cards and manage issues
- **Auto-reveal Options**: Automatically reveal when all players vote
- **Game Statistics**: Show averages and vote distributions

### ✅ **Real-time Game Sessions**
- **Live Player Sync**: Real-time player join/leave notifications
- **Instant Vote Updates**: See vote status without revealing cards
- **Vote Revealing**: Manual or automatic vote revelation
- **Player Roles**: Support for spectators and active participants
- **Reconnection Handling**: Robust connection management

### ✅ **Player Experience**
- **Easy Join**: Enter game with just a name
- **Spectator Mode**: Watch without participating in voting
- **Vote Status**: Visual feedback on voting progress
- **Responsive Cards**: Beautiful, interactive voting cards
- **User Settings**: Toggle between participant and spectator modes

### ✅ **Invitation & Sharing**
- **Shareable URLs**: Direct links to game sessions
- **QR Code Generation**: Easy mobile access via QR codes
- **Copy Invitation**: One-click link copying
- **Mobile Optimized**: Perfect experience on all devices

### ✅ **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Glassmorphism Effects**: Modern UI with beautiful glass-like effects
- **Smooth Animations**: Engaging transitions and micro-interactions
- **Dark Mode Ready**: Prepared for dark mode implementation
- **Intuitive Interface**: Clean, user-friendly design

### ✅ **Technical Features**
- **Docker Support**: Complete containerization with multi-stage builds
- **Production Ready**: Optimized builds and deployment configurations
- **Health Checks**: Built-in health monitoring endpoints
- **CORS Support**: Proper cross-origin resource sharing
- **TypeScript**: Full type safety across frontend and backend interfaces

## 🛠 Tech Stack

### Frontend (Angular 18)
- **Angular 18**: Latest Angular with standalone components
- **TypeScript 5.5**: Full type safety and modern JavaScript features
- **RxJS**: Reactive programming for real-time updates
- **Angular Forms**: Reactive forms with validation
- **SCSS**: Modern CSS with variables and mixins
- **Socket.io-client 4.8**: Real-time bidirectional communication
- **QRCode 1.5**: QR code generation for easy sharing

### Backend (Node.js Express)
- **Node.js 18**: Modern JavaScript runtime
- **Express.js 4.18**: Fast, unopinionated web framework
- **Socket.io 4.7**: Real-time WebSocket communication
- **UUID 9.0**: Unique identifier generation
- **QRCode 1.5**: Server-side QR code generation
- **CORS 2.8**: Cross-origin request handling
- **Nodemon**: Development auto-reload

### Development & Deployment
- **Docker**: Multi-stage production-ready containerization
- **Concurrently**: Run multiple dev servers simultaneously
- **Angular CLI**: Full Angular tooling support
- **TypeScript**: Strict type checking throughout

## 📁 Project Structure

```
agile-planning-poker-app/
├── client/                          # Angular 18 frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── create-game/     # Game creation interface
│   │   │   │   └── game-session/    # Main game playing interface
│   │   │   ├── services/
│   │   │   │   ├── game.service.ts  # HTTP API communication
│   │   │   │   └── socket.service.ts # Real-time WebSocket handling
│   │   │   ├── app.component.*      # Root application component
│   │   │   ├── app.config.ts        # Application configuration
│   │   │   └── app.routes.ts        # Routing configuration
│   │   ├── environments/            # Environment configurations
│   │   └── styles.scss             # Global styles
│   ├── public/images/              # Static assets
│   ├── angular.json                # Angular CLI configuration
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Frontend documentation
├── server/                         # Node.js Express backend
│   ├── index.js                   # Main server file with Socket.io
│   ├── package.json              # Backend dependencies
│   └── README.md                 # Backend documentation
├── docker-compose.yml            # Docker orchestration
├── docker-compose.registry.yml   # Docker registry configuration
├── Dockerfile                    # Multi-stage Docker build
├── package.json                  # Root project scripts
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd agile-planning-poker-app
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Start development servers**
```bash
npm run dev
```

This will start:
- Frontend server at: `http://localhost:4200`
- Backend server at: `http://localhost:3000`

### Individual Development

**Frontend only:**
```bash
cd client
npm install
ng serve
```

**Backend only:**
```bash
cd server
npm install
npm run dev
```

## 🐳 Docker Deployment

### Quick Docker Start
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Production Docker Build
```bash
# Build production image
docker build -t planning-poker-app .

# Run production container
docker run -p 8089:8089 planning-poker-app
```

The application will be available at `http://localhost:8089`

## 📜 Available Scripts

### Root Project Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install:all` - Install dependencies for all projects
- `npm run build` - Build Angular app for production
- `npm run build:prod` - Build with production configuration
- `npm start` - Start production server
- `npm test` - Run frontend tests

### Frontend Scripts (in `/client`)
- `ng serve` - Development server
- `ng build` - Build for production
- `ng test` - Run unit tests
- `ng generate` - Generate components/services

### Backend Scripts (in `/server`)
- `npm start` - Production server
- `npm run dev` - Development server with auto-reload

## 🏗️ Development Architecture

### Frontend Architecture
- **Standalone Components**: Modern Angular 18 architecture
- **Reactive Forms**: Form validation and user input
- **RxJS Observables**: State management and real-time updates
- **Socket.io Client**: Bidirectional real-time communication
- **TypeScript**: Full type safety throughout

### Backend Architecture
- **Express.js**: RESTful API endpoints
- **Socket.io Server**: Real-time WebSocket communication
- **In-memory Storage**: Game state management (configurable for database)
- **CORS Support**: Cross-origin resource sharing
- **Health Checks**: Monitoring and debugging endpoints

### Communication Flow
1. **Game Creation**: HTTP POST → Server creates game → Returns game ID
2. **Player Join**: WebSocket connection → Socket.io room join
3. **Real-time Updates**: Vote casting, player join/leave via WebSocket
4. **State Sync**: Automatic state synchronization across all clients

## 🎮 How to Use

### Creating a Game
1. Navigate to the homepage
2. Click "Create New Game"
3. Configure game settings:
   - **Game Name**: Session identifier
   - **Voting System**: Choose from Fibonacci, T-Shirt sizes, etc.
   - **Permissions**: Who can reveal cards and manage issues
   - **Options**: Auto-reveal, show averages, countdown animations
4. Click "Create Game" to start

### Joining a Game
1. Receive invitation URL or scan QR code
2. Enter your name
3. Choose role (Participant or Spectator)
4. Click "Join Game"

### Playing Planning Poker
1. **Vote**: Select estimation card
2. **Wait**: See voting progress without revealing votes
3. **Reveal**: Moderator reveals all votes (or auto-reveal if enabled)
4. **Discuss**: Review results and averages
5. **Reset**: Start new round for next issue

## 🔧 Configuration

### Environment Variables

**Frontend** (`client/src/environments/`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  serverUrl: 'http://localhost:3000'
};
```

**Backend** (`server/`)
```javascript
const PORT = process.env.PORT || 3000;
// Socket.io CORS origins configurable
// Production static file serving
```

### Docker Environment
- **Production Port**: 8089
- **Health Check**: `/health` endpoint
- **Static Files**: Served from built Angular app
- **Multi-stage Build**: Optimized production image

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test                    # Unit tests with Karma/Jasmine
npm run test:coverage      # Test coverage report
```

### Backend Testing
```bash
cd server
npm test                   # Run backend tests (when implemented)
```

## 🚢 Production Deployment

### Docker Production
1. **Build**: `docker build -t planning-poker-app .`
2. **Run**: `docker run -p 8089:8089 planning-poker-app`
3. **Health Check**: `http://localhost:8089/health`

## 🐳 Building & Publishing to Docker Hub

### Build the Image
```bash
docker build --no-cache -f Dockerfile -t cutter777/planning-poker-app:master .
```

### Push to Docker Hub
```bash
docker push cutter777/planning-poker-app:master
```

> **Note:** You must be logged in to Docker Hub before pushing (`docker login`).

### Manual Production
1. **Build Frontend**: `cd client && ng build --configuration production`
2. **Install Backend**: `cd server && npm ci --only=production`
3. **Start Server**: `NODE_ENV=production npm start`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Development Guidelines
- Follow Angular style guide for frontend
- Use TypeScript throughout
- Implement proper error handling
- Write unit tests for new features
- Update documentation for API changes

## 📝 API Documentation

### REST Endpoints
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game details
- `GET /api/voting-systems` - Get available voting systems
- `GET /health` - Health check

### Socket.io Events
- `join-game` - Player joins game
- `cast-vote` - Player casts vote
- `reveal-votes` - Reveal all votes
- `reset-votes` - Start new voting round
- `game-updated` - Game state changed
- `player-joined/left` - Player status updates

## 🐛 Troubleshooting

### Common Issues

**Connection Issues:**
- Check if backend server is running on port 3000
- Verify Socket.io connection in browser dev tools
- Ensure CORS origins include your frontend URL

**Docker Issues:**
- Ensure Docker daemon is running
- Check port 8089 is not in use
- Verify Docker Compose version compatibility

**Build Issues:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Angular CLI: `npm install -g @angular/cli@latest`
- Check Node.js version compatibility

## 📊 Performance

- **Real-time Updates**: Sub-100ms latency for vote updates
- **Concurrent Users**: Supports multiple games simultaneously  
- **Mobile Optimized**: Touch-friendly interface
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

## 🔮 Future Enhancements

- [ ] **Database Integration**: Persistent game storage
- [ ] **User Authentication**: Player accounts and game history
- [ ] **Issue Tracking**: Integration with Jira, GitHub Issues
- [ ] **Analytics Dashboard**: Voting patterns and team insights
- [ ] **Team Management**: Recurring team configurations
- [ ] **Custom Card Sets**: User-defined voting scales
- [ ] **Voice Integration**: Voice-controlled voting
- [ ] **Mobile Apps**: Native iOS/Android applications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by planningpokeronline.com
- Built with modern web technologies
- Community-driven development approach

## 📧 Support

For support, feature requests, or bug reports:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

---

**Happy Planning Poker! 🎯🃏**
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── create-game/     # Game creation page
│   │   │   │   └── game-session/    # Game session page
│   │   │   └── services/
│   │   │       ├── game.service.ts  # HTTP API service
│   │   │       └── socket.service.ts # Socket.io service
│   │   └── styles.scss              # Global styles
│   └── package.json
├── server/                          # Node.js backend
│   ├── index.js                     # Express + Socket.io server
│   └── package.json
└── package.json                     # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd agile-planning-poker-app
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend server on `http://localhost:3000`
   - Frontend Angular dev server on `http://localhost:4200`

3. **Open the application:**
   Navigate to `http://localhost:4200` in your browser

### Available Scripts

From the root directory:
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the Angular frontend for production
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server

From the client directory:
- `npm start` - Start Angular dev server
- `npm run build` - Build for production
- `npm test` - Run unit tests

From the server directory:
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## How to Use

### Creating a Game

1. Visit the home page at `http://localhost:4200`
2. Fill in the game configuration:
   - **Game Name**: Enter a descriptive name for your planning session
   - **Voting System**: Choose from Fibonacci, T-Shirt sizes, Powers of 2, or Sequential
   - **Permissions**: Set who can reveal cards and manage issues
   - **Features**: Toggle auto-reveal, fun features, show average, and countdown animation
3. Click **Create game**

### Joining a Game

1. Players can join using the shared game URL
2. Enter your name when prompted
3. You'll see the game lobby with other players

### Voting Process

1. **Select a Card**: Choose your estimation from the available cards
2. **Wait for Others**: See which players have voted (without revealing votes)
3. **Reveal Votes**: When ready, reveal all votes to see results
4. **New Round**: Start a new voting round for the next story

### Game Features

- **Real-time Updates**: All players see live updates as others join and vote
- **Vote Privacy**: Votes are hidden until revealed to prevent anchoring bias
- **Results Summary**: See vote counts, averages (if enabled), and individual votes
- **Mobile Friendly**: Works seamlessly on phones and tablets
- **QR Codes**: Generate QR codes for easy mobile access

## Architecture Highlights

### Real-time Communication
- Uses Socket.io for bidirectional real-time communication
- Automatic reconnection and error handling
- Efficient event-driven architecture

### State Management
- RxJS Observables for reactive state management
- BehaviorSubjects for current state tracking
- Clean separation between UI and business logic

### Modern Angular Patterns
- Standalone components (no NgModules)
- Reactive forms with two-way data binding
- HTTP interceptors and services
- Router-based navigation

### Responsive Design
- CSS Grid and Flexbox layouts
- Mobile-first responsive breakpoints
- Touch-friendly interface elements
- Optimized for various screen sizes

## API Endpoints

### REST API
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get game details
- `GET /api/voting-systems` - Get available voting systems
- `GET /api/health` - Health check endpoint

### Socket.io Events
- `join-game` - Join a game session
- `cast-vote` - Submit a vote
- `reveal-votes` - Reveal all votes
- `reset-votes` - Start a new voting round
- `game-joined` - Player successfully joined
- `player-joined` - New player joined
- `player-left` - Player left the game
- `vote-cast` - Vote was submitted
- `votes-revealed` - Votes were revealed
- `votes-reset` - New round started

## Development Notes

### Code Quality
- TypeScript strict mode enabled
- Consistent code formatting
- Component-based architecture
- Separation of concerns

### Performance
- Lazy loading for route-based code splitting
- Optimized bundle sizes
- Efficient change detection
- Memory leak prevention

### Security Considerations
- CORS configuration
- Input validation
- XSS prevention
- Rate limiting considerations for production

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add new feature"`
5. Push to your fork: `git push origin feature/new-feature`
6. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

### Production Build
```bash
npm run build:prod
```

### Docker Deployment
```dockerfile
# Example Dockerfile for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Repository & Deployment

This application is available in a private Docker repository for production deployment.

**Repository Details:**
- **Registry**: `docker.myxidisk.com`
- **Image Name**: `agilepoker:latest`

#### Building and Deploying to Remote Repository

1. **Build the Docker Image**
   ```bash
   # Build the production-ready Docker image
   docker build -t agilepoker:latest .
   ```

2. **Tag the Image for Remote Repository**
   ```bash
   # Tag the image for the remote registry
   docker tag agilepoker:latest docker.myxidisk.com/agilepoker:latest
   ```

3. **Login to Remote Registry**
   ```bash
   # Login to the remote Docker registry
   docker login docker.myxidisk.com
   ```

4. **Push to Remote Repository**
   ```bash
   # Push the image to the remote registry
   docker push docker.myxidisk.com/agilepoker:latest
   ```

#### Pulling and Running from Remote Repository

1. **Pull from Remote Repository**
   ```bash
   # Pull the latest image from the remote registry
   docker pull docker.myxidisk.com/agilepoker:latest
   ```

2. **Run the Container**
   ```bash
   # Run the container from the remote image
   docker run -p 3000:3000 docker.myxidisk.com/agilepoker:latest
   ```

#### Complete Build and Deploy Script

For convenience, you can use this complete script to build, tag, and deploy:

```bash
#!/bin/bash
# Build, tag, and push to remote repository

echo "Building Docker image..."
docker build -t agilepoker:latest .

echo "Tagging image for remote registry..."
docker tag agilepoker:latest docker.myxidisk.com/agilepoker:latest

echo "Pushing to remote registry..."
docker push docker.myxidisk.com/agilepoker:latest

echo "Deployment complete! Image available at docker.myxidisk.com/agilepoker:latest"
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

---

Built with ❤️ using Angular 18 and Node.js