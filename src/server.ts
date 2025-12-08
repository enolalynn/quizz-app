import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import { authenticate, authorize, generateToken } from "./middleware/auth";
import { AppDataSource } from "./config/database";
import { userRepository } from "./repositories/user.repository";
import "./types/global-type";
import { UserService } from "./service/user.service";

// Initialize Express app
const app = express();
const PORT = 5001;

// Middleware
app.use(json());

app.get("/api/users", async (req, res) => {
  const users = await userRepository.findOneBy({ id: 12 });
  return res.json(users);
});

app.post("/api/register", async (req, res) => {
  const userService = new UserService(userRepository);

  const userExist = await userService.userFindByEmail(req.body.email);
  if (userExist) return res.status(400).json({ message: `user already exist` });
  const { username, email, password, role, cars, profile } = req.body;

  const newUser = await userService.createUser(req.body);
  return res
    .json({ message: `user create success`, user: newUser })
    .status(400);
});

app.post("/api/login", async (req, res) => {
  const userService = new UserService(userRepository);
  const user = await userService.userFindByEmail(req.body.email);
  if (!user) return res.json({ message: `user not found` }).status(404);
  if (user.password !== req.body.password) {
    return res.json({ message: `incorrect password` }).status(401);
  }
  const token = generateToken({
    email: user.email,
    id: user.id,
    role: user.role,
  });
  return res.json({ message: `login success`, token }).status(200);
});

app.get(
  "/api/profile",
  authenticate,
  authorize(["user"]),
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userService = new UserService(userRepository);
    const user = await userService.userFindById(userId!);
    if (!user) return res.json({ message: `user not found` }).status(404);
    return res.json({ message: `fetch success`, user }).status(200);
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ message: "Something went wrong!" });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error("DB init error", err);
    process.exit(1);
  });
