const imageTobase64 = (image) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);// converts to base64

    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default imageTobase64;
