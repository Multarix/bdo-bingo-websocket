const startTime = 1751092200000;
const countdown = document.getElementById("countdown") as HTMLElement;

/**
 * @name humanTime
 * @param {Number} ms The number of milliseconds to convert
 * @param {String} [format] The format to convert the time to, defaults to "\\h hours \\m minutes \\s seconds"
 * @returns {String} The converted time
 * @description Convert milliseconds to human readable formats
 * - `\\S` = Miliseconds
 * - `\\s` = Seconds
 * - `\\m` = Minutes
 * - `\\h` or `\\H` = Hours
 * - `\\d` or `\\D` = Days
 * - `\\M` = Months
 * - `\\y` or `\\Y` = Years
 * @example const format = humanTime(951000, "\\m minutes \\s seconds");
 * console.log(format); // 15 minutes 51 seconds
**/
function humanTime(ms: number, format = "\\h hours \\m minutes \\s seconds"){
	if(!format) return `${ms}ms`;

	const baseMilliseconds = ms;
	const baseSeconds = Math.floor(baseMilliseconds / 1000);
	const baseMinutes = Math.floor(baseSeconds / 60);
	const baseHours = Math.floor(baseMinutes / 60);
	const baseDays = Math.floor(baseHours / 24);
	const baseMonths = Math.floor(baseDays / 30);
	const baseYears = Math.floor(baseDays / 365);

	let milliseconds: number = baseMilliseconds;
	let seconds = baseSeconds;
	let minutes = baseMinutes;
	let hours = baseHours;
	let days = baseDays;
	let months = baseMonths;
	const years = baseYears;

	if(format.includes("\\s")) milliseconds = baseMilliseconds % 1000; // Seconds
	if(format.includes("\\m")) seconds = baseSeconds % 60; // Minutes
	if(format.includes("\\h") || format.includes("\\H")) minutes = baseMinutes % 60;	// Hours
	if(format.includes("\\d") || format.includes("\\D")) hours = baseHours % 24; // Days
	if(format.includes("\\M")) days = baseDays % 30; // Months
	if(format.includes("\\y") || format.includes("\\Y")) months = months % 12; // Years

	const duration = format.replace(/\\S/, milliseconds.toString())
		.replace(/\\s/g, seconds.toString())
		.replace(/\\m/g, minutes.toString())
		.replace(/\\h/g, hours.toString())
		.replace(/\\H/g, hours.toString())
		.replace(/\\d/g, days.toString())
		.replace(/\\D/g, days.toString())
		.replace(/\\M/g, months.toString())
		.replace(/\\y/g, years.toString())
		.replace(/\\Y/g, years.toString());

	return duration;
}

function updateCountdown(){
	try {
		let human = startTime - Date.now();
		if(human < 0) human = 0;
		const time = humanTime(human, "\\d days \\h hours \\m minutes \\s seconds");

		countdown.innerText = time;
	} catch (e){
		return e;
	}
}



function getCookie(cookieName: string){
	const name = `${cookieName}=`;
	const decodedCookie = decodeURIComponent(document.cookie);
	const cookieArray = decodedCookie.split(";");

	for(let cookie of cookieArray){
		while(cookie.charAt(0) === " "){
			cookie = cookie.substring(1);
		}

		if(cookie.indexOf(name) === 0) return cookie.substring(name.length, cookie.length);
	}

	return "";
}


function setCookie(cookieName: string, value: string){
	const d = new Date();
	d.setTime(d.getTime() + 3600000); // 60 minutes from now
	const expireTime = `expires=${d.toUTCString()}`;
	document.cookie = `${cookieName}=${value};${expireTime};path=/`;
}


let uuid = getCookie("uuid");
let needsReconnect = (uuid !== "");

async function connectToWebsocket(){
	let socketConnected = false;

	const socket = new WebSocket("wss:bingo.multarix.com");
	socket.addEventListener("open", () => {
		console.log("[Join] Connected to websocket");

		if(uuid !== ""){
			const reconnectObj = {
				uuid: uuid,
				recon: true
			};

			socket.send(JSON.stringify(reconnectObj));
		}
	});


	socket.addEventListener("message", (event) => {
		const message = event.data;
		const obj = JSON.parse(message);

		if((uuid && !obj.recon && needsReconnect)) return; // If our cookie has a uuid set and the obj.recon is not true, we can ignore this
		needsReconnect = false;

		const centerBox = document.getElementById(`center`) as HTMLButtonElement;
		centerBox.innerText = "Free Parking\n(Bugatti)";

		const initialLoad = document.getElementById("initialLoad") as HTMLDivElement;
		initialLoad.style.display = "none";

		for(let i = 0; i < obj.bingoBoard.length; i++){
			const text = obj.bingoBoard[i];

			const box = document.getElementById(`box${i}`) as HTMLButtonElement;
			box.innerText = text;

			if(box.className !== "confirmed"){
				box.className = "";
				if(obj.hasHappened.includes(text)) box.className = "happened";
			}
		}

		if(!socketConnected){
			for(let i = 0; i < 24; i++){
				const box = document.getElementById(`box${i}`) as HTMLButtonElement;
				if(box.className === "happened") box.className = "confirmed";
			}

			socketConnected = true;
		}


		uuid = obj.uuid;
		setCookie("uuid", obj.uuid);
	});


	socket.addEventListener("error", (event) => {
		console.log("error: ", event);
	});


	socket.addEventListener("close", () => {
		console.log("[Left] Disonnected from websocket, attempting to reconnect...");
		setCookie("uuid", uuid);
		setTimeout(connectToWebsocket, 1000);
	});
}


async function init(){
	for(let i = 0; i < 24; i++){
		const box = document.getElementById(`box${i}`) as HTMLButtonElement;
		box.addEventListener("click", () => {
			if(box.className === "happened") box.className = "confirmed";
		});
	}

	await connectToWebsocket();
	setInterval(updateCountdown, 1000);
}


init();