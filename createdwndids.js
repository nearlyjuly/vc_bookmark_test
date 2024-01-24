
import { readFile, writeFile } from 'fs/promises';

const didFiles = ['firstdid.json', 'seconddid.json', 'thirddid.json'];

async function processDidFiles() {
  for (const filename of didFiles) {
    try {
      const didData = JSON.parse(await readFile(`./dids/${filename}`, 'utf-8'));
      const dwnversion = {
        did: didData.did,
        keyId: didData.document.verificationMethod[0].id,
        keyPair: {
          publicJwk: didData.keySet.verificationMethodKeys[0].publicKeyJwk,
          privateJwk: didData.keySet.verificationMethodKeys[0].privateKeyJwk
        }
      };

      const outputFilename = filename.replace('.json', '-dwnversion.json');
      await writeFile(`./dids/${outputFilename}`, JSON.stringify(dwnversion));
      console.log(`File ${outputFilename} created successfully.`);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }
}

processDidFiles();
