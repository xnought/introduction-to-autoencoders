import * as tf from "@tensorflow/tfjs";

export function arrayToTensor(dataset: dataType): tf.Tensor {
	return tf.tensor(dataset);
}
export function tensorToArray(tensor: tf.Tensor) {
	return tensor.arraySync();
}
export function logMemory() {
	console.log(tf.memory().numTensors);
}
