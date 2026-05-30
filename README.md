# 🚦 Wonokromo Intelligent Traffic System

Wonokromo Intelligent Traffic System is an **Agent-Based Modeling (ABM)** traffic simulation application built on a modern **Client-Server architecture**. This project models the complex dynamics of the Wonokromo intersection in Surabaya, Indonesia, including interactions between private cars, public minibuses (*Angkot*) that frequently park illegally to load passengers, synchronized traffic lights, and express train level crossings.

The system is split into two major components: a **Python Mesa 3.x** backend server managing the agent intelligence and environment states, and a **p5.js** frontend client acting as a high-performance (60 FPS) visual renderer using **WebSockets (Socket.IO)** for real-time synchronization.

---

## 🏗️ System Architecture

The simulation minimizes network latency and stuttering by leveraging a **Hybrid Client-Side Prediction** approach:
1. **Backend Server (Mesa + Flask-SocketIO)**: Calculates micro-movement logic for agents, carries out Euclidean-distance-based proximity checks (*collision avoidance*), handles traffic light phases, and triggers train schedules per *tick*.
2. **Frontend Client (p5.js)**: Receives minimal coordinate data from the server over a single persistent WebSocket pipe. The client applies **Linear Interpolation (lerp)** and micro-movement predictions to ensure vehicles slide seamlessly across the canvas without stuttering.

## 🚀 Installation & Setup Guide

### 1. Prerequisites
Make sure you have **Python 3.10** or a higher version installed on your machine.

### 2. Dependency Installation
Open your terminal, navigate to your project root directory, and run the following command to install the required dependencies:

```bash
pip install flask flask-socketio mesa
```

### 3. Running the Server
Execute the main script using the standard Python interpreter (avoid calling production WSGI servers like uvicorn directly since Flask-SocketIO handles its own event loop orchestration):

```bash
python app.py
```

### 4. Viewing the Application
Open your preferred web browser and navigate to:
```bash
[http://127.0.0.1:5000](http://127.0.0.1:5000)
```

Plaintext
[http://127.0.0.1:5000](http://127.0.0.1:5000)
