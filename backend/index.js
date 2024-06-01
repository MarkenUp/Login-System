import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import adminRouter from "./routes/admin.js";
import generalRouter from "./routes/general.js";

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

app.listen(8800, () => {
  console.log(`Server is running on port 8800`);
});
