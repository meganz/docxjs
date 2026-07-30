import typescript from '@rollup/plugin-typescript';

const output = {
	banner: `/*
 * @license
 * docx-preview <https://github.com/VolodymyrBaydalka/docxjs>
 * Released under Apache License 2.0  <https://github.com/VolodymyrBaydalka/docxjs/blob/master/LICENSE>
 * Copyright Volodymyr Baydalka
 */`,
	sourcemap: false,
}

const umdOutput = {
	...output,
	name: "docx",
	file: 'dist/docx-preview.js',
	format: 'umd',
	globals: {
		jszip: 'JSZip'
	},
};

export default args => {
	const config = {
		input: 'src/docx-preview.ts',
		output: [umdOutput],
		external: ['jszip'],
		plugins: [typescript({noEmitOnError: false})]
	}
	return config
};
