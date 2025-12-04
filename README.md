# Train Route Schedule Checker

A real-time train tracking and route management system tailored for Sri Lankan Railways. This system enables administrators to manage train routes and allows public users to track train locations and get estimated arrival times.

## 🚀 Key Features

### 🚆 Public Portal
- **Live Train Tracking:** View real-time locations of trains on an interactive map.
- **ETA Calculations:** Get estimated arrival times for upcoming stations.
- **Station Information:** View details about train stations.

### 🛠 Admin Portal
- **Route Management:** Create, update, and delete train routes.
- **Station Management:** Add and configure stations and distances.
- **Dashboard:** Monitor system status and active trains.

### 📡 IoT Integration
- **Real-time Tracking:** Receives GPS data from IoT devices installed on trains.
- **Live Updates:** Uses Supabase Realtime to stream location updates instantly.

## 🏗 System Architecture

The project consists of three main components:

1.  **Frontend (`/frontend`)**: A Next.js 14+ application using Tailwind CSS and TanStack Query. It serves both the public tracking interface and the secure admin dashboard.
2.  **Backend (`/backend`)**: A NestJS application handling complex business logic, data processing, and API endpoints.
3.  **IoT Simulator (`/iot-simulator`)**: A TypeScript-based simulator that generates realistic train movement data for testing and development.
4.  **Database**: Supabase (PostgreSQL) is used for data storage, authentication, and real-time subscriptions.

## 🛠 Tech Stack

-   **Frontend:** Next.js, Tailwind CSS, Leaflet/Google Maps, Supabase Client
-   **Backend:** NestJS, TypeScript, Prisma, Apache Kafka
-   **Database:** Supabase (PostgreSQL), Supabase Auth, Supabase Realtime
-   **DevOps:** Docker (optional)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Clone the repository
```bash
git clone <repository-url>
cd Train-Route-Check
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local # Configure your Supabase credentials
npm run dev
```

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env # Configure database connection
npm run start:dev
```

### 4. Start Kafka Infrastructure
```bash
docker-compose -f docker-compose.kafka.yml up -d
```

### 5. Run IoT Simulator (for testing)
```bash
cd iot-simulator
npm install
npm start
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.