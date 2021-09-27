#!/usr/bin/env node

import minimist from 'minimist';
import encode from './encode';
import path from 'path';
import decode from './decode';
import Jimp from 'jimp';
import fs from 'fs';
import Cryptr from 'cryptr';

function isPathAbsolute(path: string) {
	return /^(?:\/|[a-z]+:\/\/)/.test(path);
}

(async () => {
	const args = minimist(process.argv.slice(2));

	if (args.encode) {
		const filePath = isPathAbsolute(args.i)
			? args.i
			: path.join(process.cwd(), args.i);
		const payload: any = {};
		if (args.f) {
			payload.file = {
				filename: args.i.split('/')[args.i.split('/').length - 1],
			};
		}
		const encoded = await encode(
			fs.readFileSync(filePath),
			args.f ? fs.readFileSync(args.f, 'base64') : args.m,
			{
				payload,
				password: args.password,
			}
		);
		encoded.write(args.o);
	} else if (args.decode) {
		try {
			const decoded = JSON.parse(await decode(await Jimp.read(args.i)));
			if (args.password) {
				const cryptr = new Cryptr(args.password);
				decoded.data = cryptr.decrypt(decoded.data);
			}
			if (decoded.file) {
				fs.writeFileSync(
					args.o || decoded.file.filename,
					decoded.data,
					'base64'
				);
				console.log('File saved to', args.o || decoded.file.filename);
			} else {
				console.log(decoded);
			}
		} catch (error) {
			console.error('Error while decoding file', error);
		}
	}
})();
