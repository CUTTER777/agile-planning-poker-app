# Planning Poker - Angular Frontend

The frontend client for the Agile Planning Poker application, built with Angular 18 using modern standalone components architecture.

## 🏗️ Architecture

This Angular 18 application follows modern best practices:
- **Standalone Components**: No NgModules, using standalone components throughout
- **Reactive Programming**: RxJS for state management and real-time updates
- **TypeScript**: Strict type checking and modern JavaScript features
- **SCSS**: Modern CSS with variables, mixins, and responsive design
- **Socket.io Integration**: Real-time bidirectional communication

## 📂 Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── create-game/           # Game creation interface
│   │   │   └── game-session/          # Main game playing interface
│   │   ├── services/
│   │   │   ├── game.service.ts        # HTTP API communication
│   │   │   └── socket.service.ts      # Real-time WebSocket handling
│   │   ├── app.component.*            # Root application component
│   │   ├── app.config.ts              # Application configuration
│   │   └── app.routes.ts              # Routing configuration
│   ├── environments/                  # Environment configurations
│   ├── styles.scss                    # Global styles
│   └── main.ts                        # Application bootstrap
├── public/
│   └── images/                        # Static assets
├── angular.json                       # Angular CLI configuration
├── package.json                       # Dependencies and scripts
└── tsconfig.json                      # TypeScript configuration
```

## 🔧 Key Components

### CreateGameComponent
- **Purpose**: Game creation and configuration interface
- **Features**: 
  - Form validation for game settings
  - Voting system selection
  - Permission management configuration
  - Advanced settings toggle
- **Navigation**: Routes to game session after creation

### GameSessionComponent
- **Purpose**: Main game playing interface
- **Features**:
  - Real-time player management
  - Card voting interface
  - Vote results display
  - Invitation system with QR codes
  - Player role management (spectator/participant)
  - Game settings modification

## 🔌 Services

### GameService
- **HTTP API Communication**: RESTful API calls to backend
- **Game Management**: Create games, fetch game data
- **Voting Systems**: Retrieve available voting configurations

### SocketService
- **Real-time Communication**: WebSocket connection management
- **State Management**: Game state, players, and vote results
- **Event Handling**: Join/leave, voting, revealing cards
- **Reconnection Logic**: Robust connection handling

## 🎨 Styling

- **Modern CSS**: SCSS with variables and mixins
- **Responsive Design**: Mobile-first approach
- **Glassmorphism**: Modern glass-like UI effects
- **Smooth Animations**: CSS transitions and keyframe animations
- **Component Scoping**: Scoped styles for each component

## 📱 Responsive Features

- **Mobile Optimized**: Touch-friendly interface
- **Tablet Support**: Optimized for medium screens
- **Desktop Experience**: Full-featured interface
- **QR Code Integration**: Easy mobile access

## 🚀 Development Commands

### Development Server
```bash
ng serve
# Navigate to http://localhost:4200/
# Auto-reload on file changes
```

### Build Commands
```bash
# Development build
ng build

# Production build
ng build --configuration production

# Build with watch mode
ng build --watch --configuration development
```

### Testing
```bash
# Unit tests
ng test

# Test coverage
ng test --code-coverage
```

### Code Generation
```bash
# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Generate standalone component
ng generate component component-name --standalone
```

## 🔧 Configuration

### Environment Files
- `environment.ts`: Development configuration
- `environment.prod.ts`: Production configuration
- API URLs and feature flags

### Angular Configuration
- `angular.json`: Build and development server settings
- `tsconfig.json`: TypeScript compiler options
- Standalone components configuration

## 📦 Dependencies

### Core Dependencies
- `@angular/core ^18.2.0`: Angular framework
- `@angular/router ^18.2.0`: Routing and navigation
- `@angular/forms ^18.2.0`: Reactive forms
- `socket.io-client ^4.8.3`: Real-time communication
- `qrcode ^1.5.4`: QR code generation
- `rxjs ~7.8.0`: Reactive programming

### Development Dependencies
- `@angular/cli ^18.2.21`: Angular CLI tools
- `typescript ~5.5.2`: TypeScript compiler
- `karma`: Test runner
- `jasmine`: Testing framework

## 🔍 Code Quality

- **TypeScript Strict Mode**: Full type safety
- **Angular Best Practices**: Following Angular style guide
- **Component Architecture**: Reusable, testable components
- **Service Injection**: Dependency injection pattern
- **Error Handling**: Proper error boundaries and user feedback

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **ES2022**: Modern JavaScript features
- **WebSocket Support**: Real-time communication

## 📚 Further Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular Standalone Components](https://angular.dev/guide/components/importing)
- [RxJS Documentation](https://rxjs.dev/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.
