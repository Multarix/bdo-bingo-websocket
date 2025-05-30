import { BingoSocket } from "../types/interfaces";

import chalk from "chalk";
import { WebSocketServer } from 'ws';
import dotenv from "dotenv";
dotenv.config();

import * as f from "./functions.js";

// Initial run
f.log("info", "Starting websocket server.");

const HOST_PORT = 8080;
const wss = new WebSocketServer({ port: HOST_PORT });
const pingInterval = setInterval(f.ping.bind(null, wss), 30000); // Every 30 seconds, check if any of the connections were dropped.

wss.on('connection', (ws: BingoSocket) => {
	f.newConnection(ws);
	ws.on("message", (message) => f.handleMessage(wss, ws, message));
	ws.on("pong", f.heartBeat.bind(ws));
	ws.on("close", () => f.clientLeave(ws));
	ws.on("error", (error) => f.log("error", error.message));
});

wss.on("error", (error) => f.log("error", error.message));
wss.on("listening", () => f.log("info", `Listening on port: ${chalk.greenBright(HOST_PORT)}`));
wss.on("close", () => {
	clearInterval(pingInterval);
});