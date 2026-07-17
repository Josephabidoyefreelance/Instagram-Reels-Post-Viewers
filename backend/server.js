require("dotenv").config();

const express = require("express");
const cors = require("cors");

const instagramRoutes = require("./routes/instagram");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", instagramRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});