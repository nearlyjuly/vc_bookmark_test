import { VerifiableCredential, PresentationExchange} from '@web5/credentials';
import { readFile } from 'fs/promises';

const pd = {
    "id": "bookmark001",
    "name": "Bookmark VC",
    "input_descriptors": [
      {
        "id": "given_bookmark",
        "purpose": "Confirms issuer has bookmarked this content and/or account",
        "constraints": {
          "fields": [
            {
              "path": [
                "$.credentialSubject.bookmarkText"
              ]
            },
          ],
        },
      }
    ]
  };
let subjectDid = JSON.parse(await readFile('./dids/firstdid.json', 'utf-8'));

 export async function createVc(signingDid, bookmarkText) {
    let signingDidChoice = JSON.parse(await readFile(`./dids/${signingDid}.json`, 'utf-8'));
    const vc = await VerifiableCredential.create({
    type: 'Bookmark',
    issuer: signingDidChoice.did,
    subject: subjectDid.did,
    data: {bookmarkText}
})
const signedVcJwt = await vc.sign({did: signingDidChoice})
const presResult = PresentationExchange.createPresentationFromCredentials({vcJwts:[signedVcJwt], presentationDefinition: pd});
return presResult;
}



export async function checkVc(retrievedData) {
  const resultArray = [];
  try {
      await Promise.all(
          retrievedData.map(async element => {
              try {
                  await PresentationExchange.satisfiesPresentationDefinition({ vcJwts: [element], presentationDefinition: pd });
                  const verifyingfinalcred = await VerifiableCredential.verify({ vcJwt: element });
                  const bookmarkText = verifyingfinalcred.vc.credentialSubject.bookmarkText;
                  const targetString = "I am following firstdid";
                  if (bookmarkText === targetString) {
                      resultArray.push(verifyingfinalcred.vc.issuer);
                  } else {
                      console.log("Entry bookmark text does not match:");
                  }
              } catch (err) {
                  console.log(err);
              }
          })
      );
      return resultArray;
  } catch (err) {
      console.error("Error during checkVc:", err);
      throw err; // Re-throw the error for proper handling
  }
}


