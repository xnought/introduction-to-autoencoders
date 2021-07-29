<script lang="ts">
	import * as tf from "@tensorflow/tfjs";
	import { arrayToTensor, logMemory, tensorToArray } from "./tool";
	import { onMount } from "svelte";
	import Plot3D from "../projections/Plot3D.svelte";
	import Plot2D from "../projections/Plot2D.svelte";

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

	// model config
	export let dataset: dataType;
	let model: Autoencoder;
	let tensorDataset: tf.Tensor;
	let loss: any;
	let optim: any;
	let lr: number;
	let epoch: number = 0;

	// output items
	let preds: Point3D[] = [];
	let latent: Point2D[] = [];
	let min: Point2D = [Infinity, Infinity];
	let max: Point2D = [0, 0];
	let pos: Point3D = [0.45, 0.9, 1.6];
	let tensors = 0;

	const timer = (ms?: number) => new Promise((_) => setTimeout(_, ms));
	let playing = false;
	async function play() {
		playing = true;
		while (playing) {
			// compute forward, backward, update
			tf.tidy(() => {
				const outputLoss = oneEpoch();
				getOuputs();
			});
			epoch++;
			await timer(0);
		}
	}
	function pause() {
		playing = false;
	}
	function reset() {
		model.dispose();
		model = new Autoencoder("tanh");
		preds = [];
		latent = [];
		epoch = 0;
	}
	function oneEpoch() {
		return optim.minimize(
			// @ts-ignore
			() => loss(model.predict(tensorDataset), dataset),
			true
		);
	}
	function getOuputs() {
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
	}

	onMount(async () => {
		// define data
		tensorDataset = arrayToTensor(dataset).variable();
		// define model
		model = new Autoencoder("tanh");
		// define loss
		loss = tf.losses.meanSquaredError;
		// define optimizer
		lr = 0.01;
		optim = tf.train.adam(lr);
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

<div class="container">
	<Plot3D
		data3D={dataset}
		on:hover={(e) => {}}
		on:drag={(e) => {
			const { x, y, z } = e.detail.position;
			pos = [x, y, z];
		}}
		width="200px"
		height="200px"
		hoveredPointIndex={-1}
		title={"Inputs"}
		axesVisible={false}
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
		width="200px"
		height="200px"
		hoveredPointIndex={-1}
		title={"Reconstructed Inputs"}
		axesVisible={false}
		style="border: 3px coral solid; border-radius: 5px;"
		colors={[]}
		{pos}
	/>
	<Plot3D
		data3D={[...dataset, ...preds]}
		lenData={dataset.length}
		on:hover={(e) => {}}
		on:drag={(e) => {
			const { x, y, z } = e.detail.position;
			pos = [x, y, z];
		}}
		width="400px"
		height="400px"
		hoveredPointIndex={-1}
		title={"Reconstructed Inputs"}
		axesVisible
		style="border: 3px coral solid; border-radius: 5px;"
		colors={["#000000"]}
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
<div>{epoch}</div>
<button on:click={async () => await play()}>Play</button>
<button on:click={() => pause()}>Pause</button>
<button on:click={() => reset()}>Reset</button>
<button on:click={() => (tensors = tf.memory().numTensors)}
	>Num Tensors={tensors}</button
>

<style lang="scss">
	.container {
	}
</style>
