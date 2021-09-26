function encode(text: string) {
	return text
		.split('')
		.map((e) => {
			const n = e.charCodeAt(0).toString(2) + ' ';
			return '000000000'.substr(n.length) + n;
		})
		.join('')
		.trim();
}

function decode(text: string) {
	let binString = '';

	text.split(' ').map(function (bin: any) {
		binString += String.fromCharCode(parseInt(bin, 2));
	});
	return binString;
}

export default {
	encode,
	decode,
};
