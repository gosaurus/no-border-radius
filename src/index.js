import { validateInput } from './userInput';
import { fetchImage } from './fetchImage';
import { saveImage, processImage } from './processImage';

console.log("Hello world");
//Get user specified image-url
//store
//manipulate
//store a new copy

const imageUrl = await validateInput();

const fetchedImage = await fetchImage(imageUrl);

const inputImagePath = await saveImage(fetchedImage);

if (inputImagePath) {
    await processImage(inputImagePath);
}
else {
    console.log("No image data saved.");
}





