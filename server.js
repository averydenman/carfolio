import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create the vehicles table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vin TEXT,
    make TEXT,
    model TEXT,
    year TEXT,
    startingCost NUMERIC,
    transportationCost NUMERIC,
    partsCost NUMERIC,
    repairsCost NUMERIC,
    listPrice NUMERIC,
    mileage TEXT
  )
`);

// Get all vehicles
app.get('/vehicles', async (req, res) => {
  const result = await db.query('SELECT * FROM vehicles');
  res.json(result.rows);
});

// Add a new vehicle
app.post('/vehicles', async (req, res) => {
  const { vin, make, model, year, startingCost, transportationCost, partsCost, repairsCost, listPrice, mileage } = req.body;
  await db.query(
    `INSERT INTO vehicles (vin, make, model, year, startingCost, transportationCost, partsCost, repairsCost, listPrice, mileage)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      vin,
      make,
      model,
      year,
      parseFloat(startingCost),
      parseFloat(transportationCost),
      parseFloat(partsCost),
      parseFloat(repairsCost),
      parseFloat(listPrice),
      mileage
    ]
  );
  res.sendStatus(201);
});

// Update a vehicle
app.put('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { vin, make, model, year, startingCost, transportationCost, partsCost, repairsCost, listPrice, mileage } = req.body;
  await db.query(
    `UPDATE vehicles SET vin=$1, make=$2, model=$3, year=$4, startingCost=$5,
     transportationCost=$6, partsCost=$7, repairsCost=$8, listPrice=$9, mileage=$10 WHERE id=$11`,
    [
      vin,
      make,
      model,
      year,
      parseFloat(startingCost),
      parseFloat(transportationCost),
      parseFloat(partsCost),
      parseFloat(repairsCost),
      parseFloat(listPrice),
      mileage,
      id
    ]
  );
  res.sendStatus(200);
});

// Delete a vehicle
app.delete('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM vehicles WHERE id=$1', [id]);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
