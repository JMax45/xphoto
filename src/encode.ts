import jimp from 'jimp';
import fs from 'fs';
import binary from './helpers/binary';

function change(val1: string, val2: number) {
	if (val1 === '0') {
		if (val2 > 254) {
			return 254;
		} else if (val2 === 0) {
			return 0;
		}
		if (val2 % 2 == 0) {
			return val2;
		} else {
			return val2 - 1;
		}
	}
	if (val1 === '1') {
		if (val2 > 254) {
			return 255;
		} else if (val2 === 0) {
			return 1;
		}
		if (val2 % 2 == 0) {
			return val2 - 1;
		} else {
			return val2;
		}
	}
}

async function arrayToImage(image: any, arr: any) {
	await image.quality(100);
	for (const update of arr) {
		await image.setPixelColor(
			jimp.rgbaToInt(update[0], update[1], update[2], update[5]),
			update[3],
			update[4]
		);
	}
	return image;
}

async function imageToArray(image: any, message: any, output: string) {
	const { width, height } = image.bitmap;
	let isScanning = true;
	const pixels = [];
	let x = 0;
	let y = 0;
	while (isScanning) {
		const { r, g, b, a } = jimp.intToRGBA(image.getPixelColor(x, y));
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
	let i = 0;
	let index = 0;
	const changes = [];
	for (let byte of message) {
		byte = byte.split('');
		const threepix: any = [pixels[i], pixels[i + 1], pixels[i + 2]];
		let newvals;
		try {
			newvals = [
				[
					change(byte[0], threepix[0][0]),
					change(byte[1], threepix[0][1]),
					change(byte[2], threepix[0][2]),
					threepix[0][3],
					threepix[0][4],
					threepix[0][5],
				],
				[
					change(byte[3], threepix[1][0]),
					change(byte[4], threepix[1][1]),
					change(byte[5], threepix[1][2]),
					threepix[1][3],
					threepix[1][4],
					threepix[1][5],
				],
				[
					change(byte[6], threepix[2][0]),
					change(byte[7], threepix[2][1]),
					index === message.length - 1
						? change('1', threepix[2][2])
						: change('0', threepix[2][2]),
					threepix[2][3],
					threepix[2][4],
					threepix[2][5],
				],
			];
		} catch (error) {
			console.log(error, threepix);
			return;
		}

		pixels[i] = newvals[0];
		pixels[i + 1] = newvals[1];
		pixels[i + 2] = newvals[2];
		changes.push(newvals[0], newvals[1], newvals[2]);
		i += 3;
		index++;
	}
	const encoded = await arrayToImage(image, changes);
	encoded.write(output);
	return encoded;
}

export default async (
	input: string,
	messageData: string,
	output: string,
	isFile: boolean
) => {
	let data: any;
	if (isFile) {
		data = { data: fs.readFileSync(messageData, 'base64') };
		data.file = {
			filename: messageData.split('/')[messageData.split('/').length - 1],
		};
	} else {
		data = { data: messageData };
	}
	const message = binary.encode(JSON.stringify(data)).split(' ');

	const image = await jimp.read(input);
	console.info(
		message.length * 3,
		'bytes required,',
		image.bitmap.width * image.bitmap.height,
		'available'
	);

	if (message.length * 3 > image.bitmap.width * image.bitmap.height) {
		console.error('data size is bigger than available space, encoding stopped');
		process.exit(1);
	}

	console.info('encoding...');

	imageToArray(image, message, output);
};
