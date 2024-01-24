import { DidKeyMethod } from '@web5/dids';
import { writeFile } from 'fs/promises';

function transformAndSaveDIDData(inputData) {
  const transformedData = {
    did: inputData.did,
    keyId: inputData.keySet.verificationMethodKeys[0].id, // Concatenate ID and key ID
    keyPair: {
      publicJwk: inputData.keySet.verificationMethodKeys[0].publicKeyJwk,
      privateJwk: inputData.keySet.verificationMethodKeys[0].privateKeyJwk,
    },
  };
}
async function createAndSaveDid(didName) {
  const newDid = await DidKeyMethod.create();

  await writeFile(`./dids/${didName}.json`, JSON.stringify(newDid));

}

await Promise.all(['firstdid', 'seconddid', 'thirddid'].map(createAndSaveDid));
