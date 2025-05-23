import Cloudflare from "cloudflare";
import axios from "axios";
import { log } from "./functions.js";

const CLOUDFLARE_API_TOKEN = process.env["CLOUDFLARE_API_TOKEN"];
const ZONE_ID = process.env["ZONE_ID"];
const RECORD_ID = process.env["RECORD_ID"];
let LAST_IP = "";

const client = new Cloudflare({
	apiToken: CLOUDFLARE_API_TOKEN as string
});

type RecordResponse = Cloudflare.DNS.RecordResponse;


async function getExternalIP(): Promise<string | null>{
	try {
		const response = await axios.get('https://api.ipify.org');
		return response.data.trim();
	} catch (error){
		log("error", `Error fetching external IP: ${error}`);
		return null;
	}
}


async function updateDNSRecord(record: RecordResponse, newIP: string): Promise<void>{
	try {
		client.dns.records.edit(record.id, {
			zone_id: ZONE_ID as string,
			content: newIP,
			proxied: record.proxied || false,
			ttl: record.ttl || 300
		});
		log("info", `✅ DNS record updated to point to ${newIP}`);
	} catch (error){
		log("error", `Error updating DNS record: ${error}`);
	}
}


export default async function checkAndUpdateIP(): Promise<void>{
	if(!ZONE_ID) throw new Error("Environment variable `ZONE_ID` is not set");
	if(!RECORD_ID) throw new Error("Environment variable `Record_ID` is undefined");
	if(!CLOUDFLARE_API_TOKEN) throw new Error("Environment variable `CLOUDFLARE_API_TOKEN` is undefined");

	log("debug", "Checking for IP Change...");
	const currentIP = await getExternalIP();
	if(!currentIP) return;

	if(LAST_IP === currentIP) return; // Our locally stored ip is the same as the current IP

	const record = await client.dns.records.get(RECORD_ID as string, { zone_id: ZONE_ID as string });
	if(!record || record.content === currentIP) return; // Our record is actually fine.

	log("debug", `🔄 IP changed from ${LAST_IP || 'none'} to ${currentIP}`);
	await updateDNSRecord(record, currentIP);
	LAST_IP = currentIP;
}

