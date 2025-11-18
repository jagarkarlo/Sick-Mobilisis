# 🖥️ PC Status Monitor

A real-time system monitoring application built with **Angular** and **Python FastAPI**. Monitor CPU usage, memory consumption, and network latency through a modern web interface with live updates via REST APIs and WebSockets.

![Python](https://img.shields.io/badge/Python-3.14-blue?logo=python&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-20.3.10-red?logo=angular)
![FastAPI](https://img.shields.io/badge/FastAPI-WebSockets-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Testing Error Scenarios](#testing-error-scenarios)
- [Development Notes](#development-notes)

---

## ✨ Features

### 🔄 Ping Monitoring
- **Automated polling** with configurable intervals (1-60 seconds)
- Real-time latency tracking with visual indicators
- Status filtering (OK, WARN, ERROR)
- Pause/resume functionality
- Historical data with sortable table (last 10 pings)

### 💻 CPU Monitoring
- **Delayed REST endpoint** to demonstrate async/promise handling
- Visual loading states during data fetch
- Historical tracking (last 10 samples)
- Color-coded usage levels (Normal, High, Critical)
- Client-side debouncing to prevent spam

### 💾 Memory Monitoring
- **Real-time WebSocket streaming** (updates every 1-2 seconds)
- Live connection status indicator
- Automatic reconnection with exponential backoff
- Pause/resume stream without closing connection
- Rolling average smoothing (optional)
- Historical feed (last 20 records)

### 🎨 UI/UX
- Reactive forms with validation
- Toast notifications for all errors
- Loading states and empty state placeholders
- Responsive table design with sorting
- Clean, modern interface

---

## 🛠️ Tech Stack

### Frontend
- **Angular 20.3.10** - Component-based SPA framework
- **RxJS** - Reactive programming with Observables
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Reactive Forms** - Form handling and validation
- **ngx-toastr** - Toast notifications

### Backend
- **Python 3.14** - Core language
- **FastAPI** - Modern async web framework
- **WebSockets** - Real-time bidirectional communication
- **psutil** - System metrics collection
- **uvicorn** - ASGI server

---

## 📦 Prerequisites

Ensure you have the following installed:

| Tool | Version | Check Command |
|------|---------|---------------|
| **Python** | 3.14 | `python --version` |
| **Node.js** | 24.11.1 | `node -v` |
| **npm** | 11.6.2 | `npm -v` |
| **Angular CLI** | 20.3.10 | `ng version` |

### Install Angular CLI (if not installed)
```bash
npm install -g @angular/cli@20.3.10
```

---

## 🚀 Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/jagarkarlo/Sick-Mobilisis.git
```

### 2️⃣ Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Frontend Setup
```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Application

### Start Backend Server
```bash
# From backend folder with activated venv
uvicorn main:app --reload --port 8000
```

**Backend will start on:** `http://localhost:8000`

**API Documentation available at:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Start Frontend Server
```bash
# From frontend folder (in a new terminal)
ng serve
```

**Frontend will start on:** `http://localhost:4200`

### Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

---

## 📡 API Endpoints

### REST Endpoints

#### `GET /api/ping`
**Purpose:** Immediate response for periodic polling  
**Response Time:** < 100ms  
**Error Simulation:** 20% chance of 500 error

**Response (200 OK):**
```json
{
  "status": "OK",
  "serverTime": "2025-01-15T10:30:00.123Z",
  "latencyMs": 45
}
```

**Error Response (500):**
```json
{
  "detail": {
    "message": "Simulated error",
    "code": 500
  }
}
```

---

#### `GET /api/cpu`
**Purpose:** Delayed response (2-3s wait) to demonstrate loading states  
**Response Time:** 2000-3000ms  
**Error Simulation:** 20% chance of 503 error

**Response (200 OK):**
```json
{
  "usagePercent": 45.2,
  "capturedAt": "2025-01-15T10:30:00.123Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "detail": {
    "message": "Simulated CPU endpoint failure",
    "code": 503
  }
}
```

---

### WebSocket Endpoint

#### `WS /ws/memory`
**Purpose:** Real-time memory usage streaming  
**Update Frequency:** Every 1.5 seconds  
**Auto-disconnect:** After 30 seconds (to test reconnection)

**Welcome Message:**
```json
{
  "type": "welcome",
  "serverTime": "2025-01-15T10:30:00.123Z"
}
```

**Data Message:**
```json
{
  "type": "data",
  "usagePercent": 68.5,
  "usedMB": 10240,
  "totalMB": 16384,
  "capturedAt": "2025-01-15T10:30:00.123Z"
}
```

**Error Message:**
```json
{
  "type": "error",
  "message": "Simulated WebSocket send error"
}
```

**Close Codes:**
- `1000` - Normal closure (user disconnected)
- `4000` - Forced disconnect (reconnection test)
- `1011` - Server error

### Design Patterns Used

1. **Lazy Loading** - Feature modules loaded on-demand
2. **HTTP Interceptors** - Centralized base URL injection
3. **Service Layer** - Separation of business logic from components
4. **Reactive Forms** - Type-safe form handling
5. **Observable Pattern** - Async data streams with RxJS
6. **Promise Pattern** - CPU service demonstrates both approaches
7. **Exponential Backoff** - WebSocket reconnection strategy
8. **Debouncing** - Prevent rapid-fire requests

---

## 🔧 Configuration

### Changing Base URLs

The application uses configurable base URLs stored in `localStorage`:

**Default values:**
- REST API: `http://localhost:8000/api`
- WebSocket: `ws://localhost:8000/ws`

**To change at runtime:**
```typescript
// In browser console or via settings UI
localStorage.setItem('restBaseUrl', 'http://your-server:8000/api');
localStorage.setItem('wsBaseUrl', 'ws://your-server:8000/ws');

// Reload the page
location.reload();
```

### Adjusting Polling Interval

Use the UI form on the Ping page to set interval between **1-60 seconds**.

---

## 🐛 Troubleshooting

### Backend Issues

#### `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Ensure venv is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Reinstall dependencies
pip install -r requirements.txt
```

#### `Address already in use` (Port 8000 occupied)
```bash
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID  /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn main:app --reload --port 8001
```

#### CORS Errors
Ensure backend `main.py` includes your frontend origin:
```python
origins = [
    "http://localhost:4200",
    # Add more origins if needed
]
```

---

### Frontend Issues

#### `Cannot find module '@angular/core'`
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port 4200 Already in Use
```bash
# Use a different port
ng serve --port 4201
```

#### WebSocket Connection Refused
- Verify backend is running on port 8000
- Check browser console for exact error
- Ensure WebSocket URL is correct: `ws://localhost:8000/ws/memory`

#### Toast Notifications Not Appearing
```bash
# Ensure ngx-toastr styles are imported
# Check angular.json includes toastr CSS:
"styles": [
  "node_modules/ngx-toastr/toastr.css",
  "src/styles.css"
]
```

---

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Backend not running | Start backend with `uvicorn main:app --reload --port 8000` |
| `404 Not Found` | Wrong API path | Check interceptor adds `/api` prefix correctly |
| `WebSocket closed (4000)` | Forced disconnect after 30s | **This is intentional** - tests reconnection logic |
| `503 Service Unavailable` | Simulated CPU error | **This is intentional** - 20% error rate for testing |
| Memory leak warnings | Forgot `ngOnDestroy()` | Add cleanup: `this.subscription?.unsubscribe()` |

---

## 🎯 Testing Error Scenarios

The backend **intentionally simulates failures** for testing:

### Ping Endpoint
- **20% failure rate** (500 error)
- Tests toast notifications and polling resilience

### CPU Endpoint  
- **20% failure rate** (503 error)
- 2-3 second delay to test loading states

### Memory WebSocket
- **5% random send error** during streaming
- **Forced disconnect after 30 seconds**
- Tests reconnection with exponential backoff (1s → 2s → 4s → 8s → 16s)

---

## 📝 Development Notes

### Key Implementation Details

1. **Ping Service** uses `Observable` pattern
2. **CPU Service** uses `Promise` pattern (via `firstValueFrom()`)
3. **Memory Service** uses native `WebSocket` with `Subject` broadcasting
4. **All subscriptions** cleaned up in `ngOnDestroy()`
5. **Interceptor** automatically prepends base URL to relative paths
6. **Reactive Forms** for all user inputs (no template-driven forms)

### Memory Leak Prevention

Always implemented:
```typescript
ngOnDestroy(): void {
  this.subscription?.unsubscribe();
  clearInterval(this.intervalId);
  this.memoryService.cleanup();
}
```
