import readline from 'readline';
import sharp from 'sharp';
import dotenv from 'dotenv';
import * as path from 'path';
import fsPromises from 'fs/promises';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>'
});
function resolveInput(urlPrompter) {
  return new Promise(resolve => {
    rl.question(urlPrompter, resolve);
  });
}
async function getUserInput() {
  const answer = await resolveInput("Input the url of your image: ");
  return answer;
}
async function validateInput() {
  const answer = await getUserInput();
  const regex = /^https?:\/\/[^\s?#]+\.(jpe?g|gif|png|avif|tiff|svg|webp)(\?[^\s]*)?$/i;
  const isMatch = regex.test(answer);
  return isMatch ? answer : validateInput();
}

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (response.status != 200) {
    throw new Error(`Problem fetching image: ${error}`);
  }
  console.log("reponse", response);
  return response;
}

function extractFileName(response) {
  const imageUrl = response.url;
  const regex = /([\w\d\-\_]+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
  const matches = imageUrl.match(regex);
  console.log(`Matches = ${matches[0]}`);
  return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}
function buildOutputPath(inputPath, outputDirectoryPath) {
  const {
    name,
    ext
  } = path.parse(inputPath);
  console.log(path.parse(inputPath));
  return path.join(outputDirectoryPath, `${name}_resized${ext}`);
}

dotenv.config();
async function saveImage(fetchResponse) {
  const arrayBuffer = await fetchResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = await fileTypeFromBuffer(buffer);
  try {
    if (fileType.ext) {
      const imageName = extractFileName(fetchResponse);
      const outputFileName = `${imageName}.${fileType.ext}`;
      const destinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, outputFileName);

      // fs.createWriteStream(destinationFilePath).write(buffer); <-- this didn't work!
      await fsPromises.writeFile(destinationFilePath, buffer); //wait for img to write to file

      console.log(`Success! Your ${fileType.ext} image is now copied to ${destinationFilePath}`);
      return destinationFilePath;
    }
  } catch (error) {
    console.error("Error writing occurred", error.message);
  }
}
async function processImage(inputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: no input file at ${inputPath}`);
    return;
  }
  inputPath.replaceAll("\\", "/");
  const outputPath = buildOutputPath(inputPath, process.env.IMAGE_OUTPUT_PATH);
  console.log(`New output path: ${outputPath}`);
  const image = sharp(inputPath);
  const {
    width,
    height
  } = await image.metadata();
  image.resize(Math.round(width / 2), Math.round(height / 2), {
    fit: sharp.fit.contain
  }).toFile(outputPath, (error, info) => {
    if (error) {
      console.log(`An error has occurred: ${error}`);
    } else {
      console.log(`Output image saved with format ${info.format}, 
                    width ${info.width}, height ${info.height}`);
    }
  });
}

console.log("Hello world");
const imageUrl = await validateInput();
const fetchedImage = await fetchImage(imageUrl);
const inputImagePath = await saveImage(fetchedImage);
if (inputImagePath) {
  await processImage(inputImagePath);
} else {
  console.log("No image data saved.");
}
