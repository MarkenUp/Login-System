import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import adminRouter from "./routes/admin.js";
import generalRouter from "./routes/general.js";

dotenv.config();

const app = express();

const corsOption = {
  origin: true,
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(bodyParser.json());
app.use(cors(corsOption));

app.use("/api/auth", loginRouter);
app.use("/api/auth", registerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/general", generalRouter);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
