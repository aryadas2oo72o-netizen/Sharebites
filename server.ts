import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Food {
  id: string;
  name: string;
  description: string;
  quantity: number;
  expiryDate: string;
  location: string;
  communityCode: string;
  contactNumber: string;
  status: "Available" | "Completed" | "Expired";
  createdAt: number;
}

let foods: Food[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to update statuses based on time and quantity
  const updateFoodStatuses = () => {
    const now = Date.now();
    foods = foods.map((food) => {
      if (food.status === "Completed") return food;
      
      const expiryTime = new Date(food.expiryDate).getTime();
      if (now > expiryTime) {
        return { ...food, status: "Expired" };
      }
      if (food.quantity <= 0) {
        return { ...food, status: "Completed" };
      }
      return food;
    });
  };

  // API Routes
  app.get("/api/foods", (req, res) => {
    updateFoodStatuses();
    res.json(foods);
  });

  app.get("/api/foods/community/:code", (req, res) => {
    updateFoodStatuses();
    const filtered = foods.filter(
      (f) => f.communityCode.toLowerCase() === req.params.code.toLowerCase()
    );
    res.json(filtered);
  });

  app.post("/api/foods", (req, res) => {
    console.log("Received food donation request:", req.body);
    const {
      name,
      description,
      quantity,
      expiryDate,
      location,
      communityCode,
      contactNumber,
    } = req.body;

    const newFood: Food = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      quantity: Number(quantity),
      expiryDate,
      location,
      communityCode,
      contactNumber,
      status: "Available",
      createdAt: Date.now(),
    };

    foods.push(newFood);
    res.status(201).json(newFood);
  });

  app.put("/api/foods/:id", (req, res) => {
    const { id } = req.params;
    const { status, quantity } = req.body;

    foods = foods.map((food) => {
      if (food.id === id) {
        return {
          ...food,
          status: status || food.status,
          quantity: quantity !== undefined ? Number(quantity) : food.quantity,
        };
      }
      return food;
    });

    const updatedFood = foods.find((f) => f.id === id);
    res.json(updatedFood);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
