import WebSocket from 'ws';

export interface BingoSocket extends WebSocket {
	isAlive?: boolean;
	uuid?: string;
	announced?: boolean;
	bingoBoard?: string[];
	isAdmin?: boolean;
}

export interface BingoMessage {
	auth: string;
	toggle: string;
	uuid?: string;
	recon?: string;
}

export interface ReturnMessage {
	uuid: string;
	startTime: number
	bingoBoard: string[];
	hasHappened: string[];
	recon?: boolean;
}

export interface Client {
	uuid: string;
	bingoBoard: string[];
	timeout: number;
}