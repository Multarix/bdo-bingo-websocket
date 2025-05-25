interface UpdateMessage {
	uuid: string
	bingoBoard: string[]
	hasHappened: string[]
}
type BingoToggleOptions = string[];


/* ****************** */
/*                    */
/*     AUTH TOKEN     */
/*                    */
/* ****************** */
// Set the auth token before running the admin page
const authToken = "";
const buttonContainer = document.getElementById("bingoButtons") as HTMLDivElement;
let isFirstConnect = true;


function toggleItem(socket: WebSocket, content: string){
	const toggleObject = {
		auth: authToken,
		toggle: content
	};

	socket.send(JSON.stringify(toggleObject));
}


function adminConnectToWebsocket(){
	const socket = new WebSocket("wss:bingo.multarix.com");
	socket.addEventListener("open", () => {
		console.log("[Join] Connected to websocket");

		const connectObj = {
			auth: authToken
		};

		console.log("Sending: ", connectObj);
		socket.send(JSON.stringify(connectObj)); // This will send back a message with all available toggles
	});


	socket.addEventListener("message", (event) => {
		const message = event.data;
		const obj: UpdateMessage | BingoToggleOptions = JSON.parse(message);
		console.log("Recieved: ", obj);

		if(Array.isArray(obj)){ // It's a list of valid toggles
			if(!isFirstConnect) return;

			for(const item of obj){
				const button = document.createElement("button");
				button.textContent = item;
				button.onclick = toggleItem.bind(null, socket, item);

				buttonContainer.appendChild(button);
			}

			isFirstConnect = false;
			const initialLoad = document.getElementById("initialLoad") as HTMLDivElement;
			initialLoad.style.display = "none";
			return socket.send("{}");
		}


		if(obj.bingoBoard){
			if(buttonContainer.childElementCount === 0) return; // Initial message, page isn't setup yet.

			for(const child of buttonContainer.children){
				const textContent = child.textContent as string;
				child.className = (obj.hasHappened.includes(textContent)) ? "happened" : "";
			}
		}
	});


	socket.addEventListener("error", (event) => {
		console.log("error: ", event);
	});


	socket.addEventListener("close", () => {
		console.log("[Left] Disonnected from websocket, attempting to reconnect...");
		setTimeout(adminConnectToWebsocket, 1000);
	});
}


function adminInit(){
	adminConnectToWebsocket();
}


adminInit();