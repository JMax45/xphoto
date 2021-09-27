import jimp from 'jimp';
import binary from './helpers/binary';
import Cryptr from 'cryptr';
import imageToArrayv2 from './helpers/imageToArray';
import Jimp from 'jimp';

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

async function imageToArray(image: Jimp, message: any) {
	let i = 0;
	let index = 0;
	const pixels = imageToArrayv2(image);
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
	return encoded;
}

interface optionalParams {
	password?: string;
	payload?: Object;
}

export default async (image: Buffer, data: string, params?: optionalParams) => {
	if (params && params.password) {
		const cryptr = new Cryptr(params.password);
		data = cryptr.encrypt(data);
	}
	let obj: any = {
		data,
	};
	if (params && params.payload) {
		const { payload } = params;
		obj = { ...obj, ...payload };
	}
	const message = binary.encode(JSON.stringify(obj)).split(' ');

	console.log(message);

	const coverImage = await jimp.read(image);
	console.info(
		message.length * 3,
		'bytes required,',
		coverImage.bitmap.width * coverImage.bitmap.height,
		'available'
	);

	if (message.length * 3 > coverImage.bitmap.width * coverImage.bitmap.height) {
		console.error('data size is bigger than available space, encoding stopped');
		process.exit(1);
	}

	console.info('encoding...');

	const encoded: Jimp = await imageToArray(coverImage, message);
	return encoded;
};

export { optionalParams };
