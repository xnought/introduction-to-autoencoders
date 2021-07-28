<script lang="ts">
	import * as tf from "@tensorflow/tfjs";
	import { arrayToTensor, logMemory, tensorToArray } from "./tool";
	import { onMount } from "svelte";
	import Plot3D from "../projections/Plot3D.svelte";
	import Plot2D from "../projections/Plot2D.svelte";
	import { xlink_attr } from "svelte/internal";

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
	let preds: number[] = [];
	let latent: number[][] = [];
	let min: number[] = [];
	let max: number[] = [];

	onMount(async () => {
		// define data
		tensorDataset = arrayToTensor(dataset).variable();
		// define model
		const model = new Autoencoder("tanh");
		model.summary();
		// define loss
		const loss = tf.losses.meanSquaredError;
		// define optimizer
		const lr = 0.01;
		const optim = tf.train.adam(lr);
		function forwardBackward() {
			return optim.minimize(
				// @ts-ignore
				() => loss(model.predict(tensorDataset), dataset),
				true
			);
		}
		let avg = 0;
		const epochs = 1000;
		for (let i = 0; i < epochs; i++) {
			const start = performance.now();
			const out = forwardBackward();
			if (i % 25 == 0) {
				outputLoss = out.dataSync()[0];
			}
			epoch = i;
			tf.tidy(() => {
				// @ts-ignore
				const encoded: tf.Tensor = model.encoder.predict(tensorDataset);
				// @ts-ignore
				const decoded: tf.Tensor = model.decoder.predict(encoded);

				// @ts-ignore
				latent = tensorToArray(encoded);
				// @ts-ignore
				preds = tensorToArray(decoded);
				// @ts-ignore

				const maxTensor = tf.max(encoded, 0);
				const minTensor = tf.min(encoded, 0);
				// @ts-ignore
				max = tensorToArray(maxTensor);
				// @ts-ignore
				min = tensorToArray(minTensor);
			});
			// @ts-ignore
			await timer(0);
			out.dispose();
			const stop = performance.now();
			avg += stop - start;
		}
		console.log(avg / epochs);
		logMemory();
	});

	function clearGlobalMemory() {
		clearTensorMemory(tensorDataset);
	}
	function clearTensorMemory(tensor: tf.Tensor) {
		if (!tensor.isDisposed) {
			tensor.dispose();
		}
	}
	let pos: [number, number, number] = [0.45, 0.9, 1.6];
</script>

<!-- <div>Loss: {outputLoss}</div>
<div>Epoch: {epoch}</div> -->
<div class="container">
	<Plot3D
		data3D={dataset}
		on:hover={(e) => {}}
		on:drag={(e) => {
			const { x, y, z } = e.detail.position;
			pos = [x, y, z];
		}}
		hoveredPointIndex={-1}
		title={"Inputs"}
		axesVisible
		style="border: 3px violet solid; border-radius: 5px;"
		colors={["#000000"]}
		{pos}
	/>
	<Plot3D
		data3D={preds}
		on:hover={(e) => {}}
		on:drag={(e) => {
			const { x, y, z } = e.detail.position;
			pos = [x, y, z];
		}}
		hoveredPointIndex={-1}
		title={"Reconstructed Inputs"}
		axesVisible
		style="border: 3px coral solid; border-radius: 5px;"
		colors={[]}
		{pos}
	/>
	<Plot2D
		data2D={latent}
		width={100}
		height={100}
		color="#9F9DE4"
		radius={1}
		{min}
		{max}
	/>
</div>

<style lang="scss">
	.container {
		// width: 300px;
		// height: 100px;
		// color: rgba(0, 0, 0, 0.81);
	}
</style>
