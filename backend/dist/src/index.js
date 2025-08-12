"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const connectDB = require("./config/bd");
connectDB();
const app = express();
app.get("/", (_req, _res) => {
    _res.send("Hola mundo");
});
app.listen(3000, () => console.log("Servidor escuchando http://localhost:3000"));
//# sourceMappingURL=index.js.map