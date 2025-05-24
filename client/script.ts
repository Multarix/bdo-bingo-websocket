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


function connectToWebSocket(){
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

		const centerBox = document.getElementById(`center`) as HTMLButtonElement;
		centerBox.innerText = "Free Parking\n(Bugatti)";

		const initialLoad = document.getElementById("initialLoad") as HTMLDivElement;
		initialLoad.style.display = "none";

		for(let i = 0; i < obj.bingoBoard.length; i++){
			const text = obj.bingoBoard[i];

			const box = document.getElementById(`box${i}`) as HTMLButtonElement;
			box.innerText = text;

			box.className = "";
			if(obj.hasHappened.includes(text)) box.className = "happened";
		}

		needsReconnect = false;

		uuid = obj.uuid;
		setCookie("uuid", obj.uuid);
	});


	socket.addEventListener("error", (event) => {
		console.log("error: ", event);
	});


	socket.addEventListener("close", () => {
		console.log("[Left] Disonnected from websocket, attempting to reconnect...");
		setCookie("uuid", uuid);
		setTimeout(connectToWebSocket, 1000);
	});
}


function init(){

	for(let i = 0; i < 24; i++){
		const box = document.getElementById(`box${i}`) as HTMLButtonElement;
		box.addEventListener("click", () => {
			if(box.className === "happened") box.className = "confirmed";
		});
	}

	connectToWebSocket();
}


init();