export async function fetchImage(imageUrl) {
    const response = await fetch(imageUrl);
    if (response.status != 200) {
        throw new Error(`Problem fetching image: ${error}`);
    }
    console.log("reponse", response);
    return response;
}