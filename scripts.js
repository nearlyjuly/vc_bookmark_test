import { ProtocolsConfigure, Jws, RecordsWrite, RecordsQuery } from '@tbd54566975/dwn-sdk-js';
import { readFile } from 'fs/promises';

const encoder = new TextEncoder();
let signingDid = JSON.parse(await readFile('./dids/firstdid-dwnversion.json', 'utf-8'));


let protocolDefinition = {
    "protocol": "https://bookmark",
    "published": true,
    "types": {
        "bookmark": {
            "dataFormats": [
                "application/json"
            ]
        }
    },
    "structure": {
        "bookmark": {
            "$actions": [
                {
                    "who": "anyone",
                    "can": "write"
                },
                {
                    "who": "anyone",
                    "can": "read"
                }
            ]
        }
    }
}

export async function protocolConfig(){
    const confi = await ProtocolsConfigure.create({
    definition: protocolDefinition,
    signer: Jws.createSigner(signingDid)
})
return confi._message
}

export async function writeDwn(data2, whichDidDwn) {
    let data = encoder.encode(JSON.stringify(data2));
    const writeDwnMess = await RecordsWrite.create({
        data,
        dataFormat: 'application/json',
        published: true,
        protocol: "https://bookmark",
        protocolPath: "bookmark",
        signer: Jws.createSigner(whichDidDwn)
    })
    return writeDwnMess.message
}

export async function checkBookmarks() {
    const queryVcs = await RecordsQuery.create({
        
        filter: {
            protocol: "https://bookmark",
            protocolPath: 'bookmark'
        }
    })
    return queryVcs._message
}


