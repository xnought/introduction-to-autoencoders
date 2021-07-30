<script lang="ts">
	import * as tf from "@tensorflow/tfjs";
	import { arrayToTensor, logMemory, tensorToArray } from "./tool";
	import { onMount } from "svelte";
	import Plot3D from "../projections/Plot3D.svelte";
	import Model from "./Model.svelte";

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
	let printLoss: number;

	const timer = (ms?: number) => new Promise((_) => setTimeout(_, ms));
	let playing = false;
	async function play() {
		playing = true;
		while (playing) {
			// compute forward, backward, update
			tf.tidy(() => {
				const outputLoss = oneEpoch();
				printLoss = getScalar(outputLoss);
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
	function getScalar(item: tf.Scalar) {
		return item.dataSync()[0];
	}
	function clearTensorMemory(tensor: tf.Tensor) {
		if (!tensor.isDisposed) {
			tensor.dispose();
		}
	}

	let inputColor = "hsla(0, 0%, 0%, 0.5)";
	let latentColor = "hsla(194, 74%, 73%, 1)";
	let outputColor = "hsla(249, 48%, 84%, 0.5)";
	let isRunning = false;
</script>

<!-- <div>Epoch={epoch}, Loss={printLoss}</div>
<button on:click={async () => await play()}>Play</button>
<button on:click={() => pause()}>Pause</button>
<button on:click={() => reset()}>Reset</button>
<button on:click={() => (tensors = tf.memory().numTensors)}
	>Num Tensors={tensors}</button
> -->
<div class="container">
	<div id="model-view">
		<div class="data-controls">
			<div class="play-controls">
				<button
					class="play-pause"
					on:click={async () => {
						isRunning = !isRunning;
						if (isRunning) {
							await play();
						} else if (!isRunning) {
							pause();
						}
					}}
				>
					{#if isRunning}
						<i class="material-icons">pause</i>
					{:else}
						<i class="material-icons">play_arrow</i>
					{/if}
				</button>
				<button
					class="restart"
					on:click={() => {
						isRunning = false;
						reset();
					}}
					disabled={isRunning || epoch == 0}
				>
					<i class="material-icons">refresh</i>
				</button>
				<span style="font-size: 20px;">Epoch: {epoch}</span>
			</div>
		</div>
		<Model
			inputs={dataset}
			minLatent={min}
			{latent}
			maxLatent={max}
			outputs={preds}
			axesVisible
			animating={playing}
			globalPosition={pos}
			on:drag={(e) => {
				const { x, y, z } = e.detail.position;
				pos = [x, y, z];
			}}
		/>
	</div>
	<div class="divider" />
	<div id="layered-view">
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
			style="border: 3px black solid; border-radius: 5px;"
			colors={[inputColor, outputColor]}
			{pos}
		/>
	</div>
</div>

<style lang="scss">
	.container {
		display: flex;
		justify-content: center;
		align-items: center;

		#model-view {
		}
		.divider {
			margin-right: 20px;
			margin-left: 20px;
			width: 1px;
			height: 600px;
			background-color: lightgray;
		}
		#layered-view {
		}
		button {
			cursor: pointer;
			outline: none;
			border-radius: 50%;
			background: black;
			color: white;
			width: 50px;
			margin-right: 5px;
			padding-top: 50px;
			padding-bottom: 0;
			border: none;
			position: relative;
		}
		button:disabled {
			background: lightgray;
			cursor: default;
		}
		i {
			display: block;
			position: absolute;
			top: 50%;
			left: 0;
			width: 100%;
			height: 36px;
			font-size: 24px;
			line-height: 0;
		}
	}
</style>
