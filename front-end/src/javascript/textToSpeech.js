// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
const fs = require('fs');
const util = require('util');

// Creates a client
const client = new textToSpeech.TextToSpeechClient();
export async function textToSpeech(data) {
  // Construct the request
  let text = "";
  if (data.length == 0){
    text = "Sorry, i cannot find any object. Please try again.";
  }else{
    const temp = data.join(", ");
    text = `I found ${temp} in your image. Choose one to find its color.`;
  }
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  console.log(response);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFileSync);
  await writeFile('output.mp3', response.audioContent, 'binary');
  console.log('Audio content written to file: output.mp3');
}
//textToSpeech(data);