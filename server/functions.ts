import chalk from "chalk";
import { v4 as createUUID } from "uuid";


import { RawData, WebSocketServer } from "ws";
import { BingoMessage, BingoSocket, ReturnMessage, Client } from "../types/interfaces";


const debugEnabled = (process.env.SHOW_DEBUG === "true");


const bingoCellText = [
	"Wukong", "New Class\n(Not Wukong)", "New Outfit(s)", "J Hammer(s)", "PvE Balance Changes", "Demon Realm Teaser", "Mountain of Dawnbreak Teaser", "Free PEN Debo", "Elviah Mediah", "PA Apology",
	"Sovereign Offhand", "'Sovereign' Armor", "Console Mentioned", "Players 'Enjoy' Fishing", "C8-10 Shrine Boss", "New Party Shrine Boss", "New Mount/ Dragon", "Lifeskill Changes", "Alchemy Stone Rework",
	"Who Asked For This?", "Nodewar Rework", "Quality-of-Life Changes", "Altar Of Blood Returns", "New Dehkia Spot", "New World Boss", "Mainhand 'Heart' Item", "Trade Reimplimented As Land Bartering",
	"New Hardcore Season", "Open-World PvP Changes", "New Treasure Item", "PvE Servers", "KR Gets Something First", "China Number One", "'Listening To Your Feedback'", "Guild/ Alliance Changes",
	"'Time Travel' Map", "Crimson Desert Mentioned", "More Party Grind Spots", "Auto-Grinding Added", "Crossplay with Console", "Shai Rework"
];


const hasHappened: string[] = [];
const disconnectedClients: Client[] = [];

function removeOldClient(uuid: string){
	const index = disconnectedClients.findIndex((client) => client.uuid === uuid);
	log("debug", `Removing ${chalk.magenta(disconnectedClients[index].uuid)} from disconnected clients`);
	disconnectedClients.splice(index, 1);
}


function updateClients(wss: WebSocketServer){
	wss.clients.forEach((ws: BingoSocket) => {
		// These are not valid clients "yet"
		if(!ws.announced) return;
		if(!ws.uuid) return;

		const obj = {
			bingoBoard: ws.bingoBoard,
			hasHappened: hasHappened
		};

		ws.send(JSON.stringify(obj));
	});
}


const numberGenerator = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};


function bingoBoardSelector(bingoCells: string[]){
	const clientBoard: string[] = [];

	for(let i = 0; i < 24; i++){
		const randomInt = numberGenerator(0, bingoCells.length - 1);
		const cellItem = bingoCells[randomInt];
		clientBoard.push(cellItem);
		bingoCells.splice(randomInt, 1);
	}

	return clientBoard;
}


type LogType = "info" | "warn" | "error" | "join" | "leave" | "debug" | "unknown";
export function log(type: LogType, message: string){

	const date = new Date();
	const hours = date.getHours();
	const minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes();
	const seconds = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : date.getSeconds();
	const time = `${hours}:${minutes}:${seconds}`;

	switch(type){
		case 'info':
			console.log(`[${time}][${chalk.cyan(type.toUpperCase())}] ${chalk.white(message)}`);
			break;

		case 'warn':
			console.log(`[${time}][${chalk.yellow(type.toUpperCase())}] ${chalk.white(message)}`);
			break;

		case 'error':
			console.log(`[${time}][${chalk.red(type.toUpperCase())}] ${chalk.white(message)}`);
			break;

		case 'debug':
			if(debugEnabled) console.log(`[${time}][${chalk.magenta(type.toUpperCase())}] ${chalk.white(message)}`);
			break;

		case 'join':
			console.log(`[${time}][${chalk.green(type.toUpperCase())}] ${chalk.white(message)}`);
			break;

		case 'leave':
			console.log(`[${time}][${chalk.yellow(type.toUpperCase())}] ${chalk.white(message)}`);
			break;

		default:
			console.log(`[${time}][${chalk.blue(type.toUpperCase())}] ${chalk.white(message)}`);
			break;
	}
}


export function newConnection(ws: BingoSocket){
	ws.isAlive = true;
	ws.announced = false;
	ws.isAdmin = false;
	ws.uuid = createUUID();
	ws.bingoBoard = bingoBoardSelector([...bingoCellText]);

	const obj = {
		uuid: ws.uuid,
		bingoBoard: ws.bingoBoard,
		hasHappened: hasHappened
	};

	ws.send(JSON.stringify(obj));

	if(!ws.announced){
		ws.announced = true;
		log("join", `Client Connected: ${chalk.magenta(ws.uuid)}`);
	}
}


export function clientLeave(ws: BingoSocket){
	log("leave", `Client Disconnected: ${chalk.magenta(ws.uuid)}`);

	const timeout = setTimeout(removeOldClient, 3600000, ws.uuid); // 1 hour timeout
	// const timeout = setTimeout(removeOldClient, 60000, ws.uuid); // 1 min timeout

	const obj = {
		bingoBoard: ws.bingoBoard as string[],
		uuid: ws.uuid as string,
		timeout: timeout
	};

	disconnectedClients.push(obj);
}


// eslint-disable-next-line no-unused-vars
export function heartBeat(this: BingoSocket){
	this.isAlive = true;
	log("debug", `Client ponged: ${chalk.magenta(this.uuid)}`);
}


export function ping(wss: WebSocketServer){
	wss.clients.forEach((ws: BingoSocket) => {
		if(ws.isAlive === false){
			log("debug", `Client timed out: ${chalk.magenta(ws.uuid)}`);
			return ws.terminate();
		}

		ws.isAlive = false;
		ws.ping();
	});
}


export function handleMessage(wss: WebSocketServer, ws: BingoSocket, message: RawData){
	const obj: ReturnMessage = {
		uuid: ws.uuid as string,
		bingoBoard: ws.bingoBoard as string[],
		hasHappened: hasHappened as string[]
	};

	try {
		const str = message.toString();
		const msg: BingoMessage = JSON.parse(str);

		if(msg.recon && msg.uuid){	// Check if it's a client attempting to reconnect
			const index = disconnectedClients.findIndex((client) => client.uuid === msg.uuid);
			if(index === -1){	// Humor them, but don't change their uuid
				obj.recon = true;
				return ws.send(JSON.stringify(obj));
			}

			log("info", `${chalk.magenta(ws.uuid)} -> ${chalk.magenta(msg.uuid)}`);

			ws.uuid = disconnectedClients[index].uuid;
			ws.bingoBoard = disconnectedClients[index].bingoBoard;

			obj.uuid = disconnectedClients[index].uuid;
			obj.bingoBoard = disconnectedClients[index].bingoBoard;
			obj.recon = true;

			// console.log(obj);
			clearTimeout(disconnectedClients[index].timeout);
			disconnectedClients.splice(index, 1); // Remove from disconnected clients list
			return ws.send(JSON.stringify(obj));
		}

		ws.isAdmin = (msg.auth === process.env.AUTH_TOKEN); // Define if the ws is an admin

		if(!ws.isAdmin) return ws.send(JSON.stringify(obj)); // If not an admin, send our object back
		if(!msg.toggle && ws.isAdmin) return ws.send(JSON.stringify(bingoCellText)); // If an admin, but msg.toggle isn't present, send back acceptable toggles
		if(!bingoCellText.includes(msg.toggle)) return ws.send(JSON.stringify(bingoCellText));	// If the toggle isn't valid, send back acceptable toggles
		log("debug", `Toggling ${msg.toggle}`);

		const item: string = msg.toggle;

		// Update whats been toggled, send to all participants
		if(hasHappened.includes(item)){
			const index = hasHappened.findIndex(x => x === item);
			hasHappened.splice(index, 1);
			return updateClients(wss);
		}

		hasHappened.push(item);
		return updateClients(wss);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e){ // eslint-disable-line no-unused-vars
		return ws.send(JSON.stringify(obj));
	}
}