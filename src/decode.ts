import Jimp from 'jimp';
import binary from './helpers/binary';
import imageToArray from './helpers/imageToArray';

function isOdd(num: number) {
	return num % 2;
}

function arrToBinary(arr: any) {
	return arr
		.map((e: any) => {
			return e % 2 ? '1' : '0';
		})
		.join('');
}

function flatten(arr: any[]): any[] {
	return arr.reduce(function (flat, toFlatten) {
		return flat.concat(
			Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
		);
	}, []);
}

export default async (image: Jimp) => {
	const pixels = imageToArray(image);

	let i = 0;
	let isRunning = true;
	const rgbs = [];
	while (isRunning) {
		const threepix = [pixels[i], pixels[i + 1], pixels[i + 2]];
		if (isOdd(threepix[2][2])) {
			isRunning = false;
		}
		rgbs.push(
			arrToBinary([
				threepix[0][0],
				threepix[0][1],
				threepix[0][2],
				threepix[1][0],
				threepix[1][1],
				threepix[1][2],
				threepix[2][0],
				threepix[2][1],
			])
		);
		i += 3;
	}
	return binary.decode(rgbs.join(' '));
};
