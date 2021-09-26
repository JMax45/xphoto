import Jimp from 'jimp';

export default (image: Jimp) => {
	const { width, height } = image.bitmap;
	let isScanning = true;
	const pixels = [];
	let x = 0;
	let y = 0;
	while (isScanning) {
		const { r, g, b, a } = Jimp.intToRGBA(image.getPixelColor(x, y));
		pixels.push([r, g, b, x, y, a]);
		if (x === width - 1) {
			x = 0;
			y += 1;
		}
		if (y >= height - 1 && x >= width - 2) {
			isScanning = false;
		}
		x += 1;
	}

	return pixels;
};
