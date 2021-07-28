<script lang="ts">
	import * as tf from "@tensorflow/tfjs";
	import { arrayToTensor, logMemory, tensorToArray } from "./tool";
	import { onMount } from "svelte";

	export let dataset: dataType;
	let tensorDataset: tf.Tensor;

	class Autoencoder {
		encoder: tf.Sequential;
		decoder: tf.Sequential;
		constructor(activation: ActivationIdentifier) {
			this.encoder = tf.sequential({
				layers: [
					tf.layers.dense({ units: 2, inputShape: [3], activation }),
					tf.layers.dense({ units: 2 }),
				],
			});
			this.decoder = tf.sequential({
				layers: [
					tf.layers.dense({ units: 2, inputShape: [2], activation }),
					tf.layers.dense({ units: 3 }),
				],
			});
		}
		predict(X: tf.Tensor) {
			return this.decoder.predict(this.encoder.predict(X));
		}
		summary() {
			console.log("Encoder");
			this.encoder.summary();
			console.log("");
			console.log("Decoder");
			this.decoder.summary();
		}
		dispose() {
			this.encoder.dispose();
			this.decoder.dispose();
		}
	}

	const timer = (ms?: number) => new Promise((_) => setTimeout(_, ms));
	let outputLoss: number = 0;
	let epoch: number = 0;
	onMount(async () => {
		// define data
		tensorDataset = arrayToTensor(dataset).variable();
		// define model
		const model = new Autoencoder("tanh");
		// define loss
		const loss = tf.losses.meanSquaredError;
		// define optimizer
		const lr = 0.1;
		const optim = tf.train.adam(lr);

		function forwardBackward() {
			return optim.minimize(
				// @ts-ignore
				() => loss(model.predict(tensorDataset), dataset),
				true
			);
		}
		let avg = 0;
		const epochs = 500;
		for (let i = 0; i < epochs; i++) {
			const start = performance.now();
			const out = forwardBackward();
			if (i % 25 == 0) {
				outputLoss = out.dataSync()[0];
			}
			epoch = i;
			await timer(0);
			out.dispose();
			const stop = performance.now();
			avg += stop - start;
		}

		console.log(avg / epochs);
		logMemory();
		// create the tensorflow model
	});

	function clearGlobalMemory() {
		clearTensorMemory(tensorDataset);
	}
	function clearTensorMemory(tensor: tf.Tensor) {
		if (!tensor.isDisposed) {
			tensor.dispose();
		}
	}
</script>

<div>Loss: {outputLoss}</div>
<div>Epoch: {epoch}</div>

<style lang="scss">
</style>
