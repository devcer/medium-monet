/**
 *
 * @param mediumToken The medium token to set
 * @returns Promise
 */
export const getMediumAccountDetails = async (mediumToken: string) => {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${mediumToken}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    const response = await fetch(process.env.MEDIUM_API_URL, requestOptions);
    const responseJson = await response.json();
    //{
    //   "data": {
    //     "id": "1c3b18d7ca15ed491c69815841fb686485fbf1383382c98c89d3f179fb48bd459",
    //     "username": "isantoshv",
    //     "name": "Santosh Viswanatham",
    //     "url": "https://medium.com/@isantoshv",
    //     "imageUrl": "https://cdn-images-1.medium.com/fit/c/400/400/1*0BIgfC-AxZeDeGSo9G3A3Q.jpeg"
    //   }
    // }
    return responseJson && responseJson.data;
  } catch (error) {
    console.log(error);
    console.log('Error');
  }
};
