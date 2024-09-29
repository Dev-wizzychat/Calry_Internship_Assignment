const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = 3000;

app.use(express.json());

const dataFile = path.join(__dirname, "requests.json"); // name of json file will br requests.json
let fileLock = false; // Locking mechanism to prevent concurrent writes

async function readData() {
  try {
    const data = await fs.readFile(dataFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(data) {
  while (fileLock) {
    await new Promise((resolve) => setTimeout(resolve, 50)); // Wait 50ms each timme until file is unlocked
  }
  fileLock = true;
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
  fileLock = false;
}

// POST /requests
app.post("/requests", async (req, res) => {
  try {
    const { guestName, roomNumber, requestDetails, priority } = req.body;
    const newRequest = {
      id: uuidv4(),
      guestName,
      roomNumber,
      requestDetails,
      priority,
      status: "received",
    };
    const data = await readData();
    data.push(newRequest);
    await writeData(data);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: "Error !" });
  }
});

// GET /requests - Retrieve all requests, sorted by priority (lower number = higher priority)
app.get("/requests", async (req, res) => {
  try {
    const data = await readData();
    const sortedData = data.sort((a, b) => a.priority - b.priority);
    res.json(sortedData);
  } catch (error) {
    res.status(500).json({ error: "Error !" });
  }
});

// GET /requests/{id}
app.get("/requests/:id", async (req, res) => {
  try {
    const data = await readData();
    const request = data.find((r) => r.id === req.params.id);
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error !" });
  }
});

// PUT /requests/{id}
app.put("/requests/:id", async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex((r) => r.id === req.params.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...req.body };
      await writeData(data);
      res.json(data[index]);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error !" });
  }
});

// DELETE /requests/{id}
app.delete("/requests/:id", async (req, res) => {
  try {
    const data = await readData();
    const filteredData = data.filter((r) => r.id !== req.params.id);
    if (data.length !== filteredData.length) {
      await writeData(filteredData);
      res.status(200).send("Deleted successfully !");
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete request" });
  }
});

// POST /requests/{id}/complete
app.post("/requests/:id/complete", async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex((r) => r.id === req.params.id);
    if (index !== -1) {
      data[index].status = "completed";
      await writeData(data);
      res.json(data[index]);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error !" });
  }
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
