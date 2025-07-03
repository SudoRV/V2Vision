# 🚗 2Vision – Real-Time Vehicle Visibility & Awareness System

2Vision is an advanced vehicle-to-vehicle (V2V) and grid-aware real-time location sharing system that enables vehicles to become aware of nearby moving vehicles, even in blind spots, curved roads, or foggy conditions. Built with **React**, **Google Maps**, **Socket.IO**, and **Node.js**, this project brings futuristic smart mobility closer to reality.

![2Vision Demo](./preview.gif)

---

## 🚀 Features

✅ **Real-Time Location Sharing**  
✅ **Google Maps Integration (Hybrid View)**  
✅ **Multiple Instance Grid-Aware Architecture**  
✅ **Nearby Vehicle Detection with Perimeter Radius**  
✅ **Heading & Speed Awareness with Compass Rotation**  
✅ **Dynamic Instance Switching Based on Grid (1000km² zones)**  
✅ **Vehicle Type Registration (e.g., Two-Wheeler, Four-Wheeler)**  
✅ **Map-Orientation Mode & Compass Mode Switching** 

---

## 🗺️ How It Works

1. 📍 **User opens the app**, location permission is taken.
2. 📡 Vehicle registers and emits location to the appropriate **grid-based server instance**.
3. 🔄 System updates position to the database and emits nearby vehicles (within 300m).
4. 🌐 If the vehicle **moves across a grid (1000x1000 km)**, it **dynamically switches socket instances**.
5. 🛰️ Nearby vehicles are **fetched and displayed on map**, even if they are from another instance.

---
![file_0000000004f061f78075dadc4795e2af](https://github.com/user-attachments/assets/1455d72c-bdee-418d-b15a-80732a4146e6)
---

## 🏗️ Tech Stack

| Layer          | Technology         |
|----------------|--------------------|
| 🧠 Frontend     | React.js, SCSS     |
| 🗺️ Maps         | Google Maps JS API |
| 🔌 Sockets      | Socket.IO (Client) |
| 🧩 Backend      | Node.js + Express  |
| 📡 Realtime     | Socket.IO (Server) |
| 🛢️ Database     | MySQL (Per Instance) |
| 📐 Spatial Ops  | rbush, geolib      |


## ⚙️ Setup Instructions

### 🧑‍💻 1. Clone Repo

```bash
git clone https://github.com/yourusername/2vision.git
cd v2vision
```

## ⚙️ 2. Set Up MySQL Databases

### 3. ✅ Update Database Configuration

> 🛠 You must update your database configuration in both of the following files:

server/server.js

server/socket.js


### Create 4 databases:

```bash
CREATE DATABASE v2vision_instance1;
CREATE DATABASE v2vision_instance2;
CREATE DATABASE v2vision_instance3;
CREATE DATABASE v2vision_instance4;
```

### Then create vehicles table in each:
```bash
CREATE TABLE vehicles (
  id VARCHAR(64) PRIMARY KEY,
  vehicle_no VARCHAR(15),
  vehicle_type VARCHAR(20),
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  heading DOUBLE DEFAULT 0,
  speed DOUBLE DEFAULT 0,
  grid_level2 VARCHAR(20),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (vehicle_no),
  INDEX (grid_level2)
);
```

## 🖥️ 3. Run Server Instances
### Run 4 instances (each using different ports):
```bash
cd server/v2vision_instance1 && node index.js  # port 8000
cd server/v2vision_instance2 && node index.js  # port 8001
cd server/v2vision_instance3 && node index.js  # port 8002
cd server/v2vision_instance4 && node index.js  # port 8003
```

## 🌐 4. Start React Client
```bash
cd client
npm install
npm run dev  # or npm start
```

