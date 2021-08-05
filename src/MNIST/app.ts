import { LayersModel, Tensor, tensor, tidy, max } from "@tensorflow/tfjs";
/**
 * A Getter method to get the json file
 *
 * @param path where the file is located in public
 * @returns the json object
 */
export const get = async <T>(path: string): Promise<T[]> => {
	const data = await fetch(path, {
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	});
	const json = await data.json();
	return json;
};

/**
 * Defines the datafile path
 *
 * @param fileName the filename in datafiles
 * @returns the string with the datafiles path
 */
export const dataFilePath = (fileName: string) => `datafiles/${fileName}`;

/**
 * Turns the 2d tensor into a 2d js array
 *
 * @param tensor2D a tensor2d in tfjs
 * @returns a native javascript array version
 */
export const to2D = (tensor2D) => tensor2D.arraySync();

/**
 * Encodes the output into 2d latent space
 *
 * @param encoder the tensorflow encoder model
 * @param inputTensor the data to input into the encoder model
 * @returns \{`tensor`: the tensorflow array version, `regular`: the js array version\}
 */
export const encode = (encoder: LayersModel, inputTensor: Tensor) => {
	const encoded = encoder.predict(inputTensor);
	return { tensor: encoded, regular: to2D(encoded) };
};

/**
 * This decodes the encoded output
 *
 * @param decoder the tensorflow decoder model
 * @param encodedTensor the 2d vector created from the encoder
 * @returns the native js array of the recreated input
 */
export const decode = (decoder: LayersModel, encodedTensor: Tensor) => {
	const decoded = decoder.predict(encodedTensor);
	//@ts-ignore
	const maxNum = max(decoded).dataSync()[0];
	return { decoded: to2D(decoded), max: maxNum };
};

/**
 * This decodes given one coordinate into the reconstructed image
 *
 * @param decoder tensorflow decoder model
 * @param coord the array version of the cordinate: [x, y]
 * @returns the decoded output as a native js array
 */
export const decodeGivenCoord = (
	decoder: LayersModel,
	coord: [number, number]
) => {
	const input = tensor([coord]);
	const { decoded, max } = decode(decoder, input);
	return { decoded: decoded[0], max };
};

/**
 * Makes two parallel array instead of array of json
 *
 * @param digits the json data taken from MNIST
 * @returns \{ data2D: `the array of flattened mnist digits`, `labels`: the array of labels \}
 */
export const unWrapData = (digits: IData[]) => {
	let data = [],
		labels = [];
	for (let i = 0; i < digits.length; i++) {
		const curr = digits[i];
		data.push(curr.data);
		labels.push(curr.label);
	}
	return { data2D: data, labels };
};

/**
 * Reformats coordinates to usable format in the scatter component
 *
 * @param labels the labels array
 * @param coords2D the array of coordinates in array of array form
 * @returns the reformatted points
 */
export const reformatForScatter = (
	labels: number[],
	coords2D: [number, number][]
): IScatterFormat[] => {
	let formatted: IScatterFormat[] = [];
	for (let i = 0; i < labels.length; i++) {
		const [x, y] = coords2D[i],
			label = labels[i]; // extract needed
		const combine: IScatterFormat = { x, y, label }; // combine to correct format
		formatted.push(combine);
	}
	return formatted;
};

/**
 * Takes a 2d input and outputs the decoded while tidying up memory
 *
 * @param decoder the tensorflow decoder model
 * @param coord the xy coordinate corresponding to the 2d latent space
 * @returns the output reconstructed image given
 */
export const computeSingleDecode = (
	decoder: LayersModel,
	coord: [number, number]
) => tidy(() => decodeGivenCoord(decoder, coord));
