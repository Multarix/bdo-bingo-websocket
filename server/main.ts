import { BingoSocket } from "../types/interfaces";

import chalk from "chalk";
import { WebSocketServer } from 'ws';
import dotenv from "dotenv";
dotenv.config();

import * as f from "./functions.js";
import updateDNSRecord from "./update_dns.js";

const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Initial run and schedule every 10 minutes
f.log("info", "Starting websocket server.");
updateDNSRecord();
const ipCheckInterval = setInterval(updateDNSRecord, CHECK_INTERVAL);

const port = 5683;
const wss = new WebSocketServer({ port });
const pingInterval = setInterval(f.ping.bind(null, wss), 30000); // Every 30 seconds, check if any of the connections were dropped.

wss.on('connection', (ws: BingoSocket) => {
	f.newConnection(ws);
	ws.on("message", (message) => f.handleMessage(wss, ws, message));
	ws.on("pong", f.heartBeat.bind(ws));
	ws.on("close", () => f.clientLeave(ws));
	ws.on("error", (error) => f.log("error", error.message));
});

wss.on("error", (error) => f.log("error", error.message));
wss.on("listening", () => f.log("info", `Listening on port: ${chalk.greenBright(port)}`));
wss.on("close", () => {
	clearInterval(pingInterval);
	clearInterval(ipCheckInterval);
});