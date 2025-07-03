const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const socketHandler = require('./socket');
const mysql = require("mysql2/promise");

// Create MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rahul@1992#",
  database: "v2vision_instance3",
  connectionLimit: 10
});

const app = express();
const PORT = 8002;

// Serve static files from media folder
app.use(express.static(path.join(__dirname, '../media')));
app.use(express.json());

// Enable CORS for all routes
const cors = require('cors');
app.use(cors({ origin: '*' }));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

// Optional landing route
app.get('/', (req, res) => {
  res.send(`<h2>V2Vision Server Running</h2>`);
});


//send grid vehicles asked from another instance ( achieving distributed database );
app.post('/get-vehicles-bygrid10', async (req, res) => {  
  const grids = req.body.grids; 
  const vehicles = await getGridVehicles(grids)
   
  res.send(JSON.stringify({"vehicles": vehicles}));
});


// Start handling socket connections
socketHandler(io);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});








//get grid vehicles 
async function getGridVehicles(gridLevel2List) {
  if (!Array.isArray(gridLevel2List) || gridLevel2List.length === 0) {
    return [];
  }

  const placeholders = gridLevel2List.map(() => '?').join(',');
  const query = `
    SELECT id, vehicle_type, lat, lng, heading, speed 
    FROM vehicles 
    WHERE grid_level2 IN (${placeholders})`;

  const values = [...gridLevel2List];

  const [vehicles] = await db.query(query, values);
  return vehicles;
}
