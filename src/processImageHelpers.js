import * as path from "path";

export function extractFileName(response) {
    const imageUrl = response.url;
    const regex = /([\w\d\-\_]+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
    const matches = imageUrl.match(regex)
    console.log(`Matches = ${matches[0]}`);
    return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}

export function buildOutputPath(inputPath, outputDirectoryPath) {
    const {name, ext} = path.parse(inputPath);
    console.log(path.parse(inputPath));
    return path.join(outputDirectoryPath, `${name}_resized${ext}`);
}