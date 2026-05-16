export const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
export const PROFILE_PHOTO_SIZE = 512;

const loadImage = (dataUrl) => new Promise((resolve, reject) => {
  const image = new Image();

  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Could not read this image.'));
  image.src = dataUrl;
});

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Could not read this image.'));
  reader.readAsDataURL(file);
});

export const resizeProfileImage = async (file) => {
  if (!file) {
    return '';
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    throw new Error('Profile picture must be 2 MB or smaller.');
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const canvas = document.createElement('canvas');
  const size = Math.min(PROFILE_PHOTO_SIZE, Math.max(image.width, image.height));
  const sourceSize = Math.min(image.width, image.height);
  const sourceX = (image.width - sourceSize) / 2;
  const sourceY = (image.height - sourceSize) / 2;
  const targetSize = Math.min(size, PROFILE_PHOTO_SIZE);
  const context = canvas.getContext('2d');

  canvas.width = targetSize;
  canvas.height = targetSize;
  if (!context) {
    throw new Error('Profile picture could not be prepared.');
  }

  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);

  return canvas.toDataURL('image/jpeg', 0.86);
};
