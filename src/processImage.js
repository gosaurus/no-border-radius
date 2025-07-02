import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";
import fsPromises from "fs/promises";
import fs from "fs";
import { fileTypeFromBuffer} from "file-type"; 
import { extractFileName, buildOutputPath } from "./processImageHelpers";

dotenv.config();

export async function saveImage(fetchResponse) {
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

export async function processImage(inputPath) {
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: no input file at ${inputPath}`);
        return;
    }
    const resolvedPath = inputPath.replaceAll("\\","/");

    const outputPath = buildOutputPath(inputPath, process.env.IMAGE_OUTPUT_PATH);
    console.log(`New output path: ${outputPath}`);

    const image = sharp(inputPath);
    const {width, height} = await image.metadata();
    image
        .resize(
            Math.round(width / 2),
            Math.round(height / 2), {
            fit: sharp.fit.contain
        })
        .toFile(outputPath, (error, info) => {
            if (error) {
                console.log(`An error has occurred: ${error}`);
            }
            else {
                console.log(`Output image saved with format ${info.format}, 
                    width ${info.width}, height ${info.height}`);
            }
        })
}
