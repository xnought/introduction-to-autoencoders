<script lang="ts">
	import * as tf from "@tensorflow/tfjs";
	import { arrayToTensor, logMemory, tensorToArray } from "./tool";
	import { onMount } from "svelte";
	import { tweened } from "svelte/motion";
	import * as easings from "svelte/easing";
	import Plot3D from "../projections/Plot3D.svelte";
	import Latent from "../projections/Latent.svelte";
	import Model from "./Model.svelte";
	function zeros2D(length: number) {
		let result = [];
		for (let i = 0; i < length; i++) {
			result.push([0, 0]);
		}
		return result;
	}

	class Autoencoder {
		encoder: tf.Sequential;
		decoder: tf.Sequential;
		encoderLayers: tf.layers.Layer[];
		decoderLayers: tf.layers.Layer[];
		constructor(activation: ActivationIdentifier) {
			this.encoderLayers = [
				tf.layers.dense({ units: 2, inputShape: [3], activation }),
				tf.layers.dense({ units: 2 }),
			];
			this.encoder = tf.sequential({
				layers: this.encoderLayers,
			});
			this.decoderLayers = [
				tf.layers.dense({ units: 2, inputShape: [2], activation }),
				tf.layers.dense({ units: 3 }),
			];
			this.decoder = tf.sequential({
				layers: this.decoderLayers,
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
	let optim: tf.Optimizer;
	let lr: number;
	let epoch: number = 0;

	// output items
	let preds: Point3D[] = [];
	let latent: Point2D[] = [];
	let latentDelayed: Point2D[] = zeros2D(dataset.length);
	let minDelayed: Point2D = [Infinity, Infinity];
	let maxDelayed: Point2D = [0, 0];
	let min: Point2D = [Infinity, Infinity];
	let max: Point2D = [0, 0];
	let pos: Point3D = [0.45, 0.9, 1.6];
	let tensors = 0;
	let printLoss: number;
	let grads = zeros2D(dataset.length);

	let configTweened = {
		delay: 0,
		duration: 1200,
		easing: easings.cubicInOut,
	};
	const gradsTweened = tweened(grads, configTweened);
	const latentTweened = tweened(latentDelayed, configTweened);
	const minTweened = tweened(minDelayed, configTweened);
	const maxTweened = tweened(maxDelayed, configTweened);

	const timer = (ms?: number) => new Promise((_) => setTimeout(_, ms));
	let playing = false;
	async function play() {
		playing = true;
		while (playing) {
			// compute forward, backward, update
			tf.tidy(() => {
				// run every 100 because computationally expensive
				const outputLoss = oneEpoch();
				printLoss = getScalar(outputLoss);
				getOuputs();
				if (epoch % 50 == 0) {
					grads = computeLatentGrads();
					latentDelayed = [...latent];
					minDelayed = min;
					maxDelayed = max;

					gradsTweened.set(grads);
					latentTweened.set(latent);
					minTweened.set(minDelayed);
					maxTweened.set(maxDelayed);
				}
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
			() => loss(model.predict(tensorDataset), dataset),
			true
		);
	}
	function latentGrad(
		inputs: number[],
		weights: number[][],
		dweights: number[][]
	) {
		const dinput1 =
			(dweights[0][0] * weights[0][0]) / inputs[0] +
			(dweights[1][0] * weights[1][0]) / inputs[0];
		const dinput2 =
			(dweights[0][1] * weights[0][1]) / inputs[1] +
			(dweights[1][1] * weights[1][1]) / inputs[1];
		return [dinput1, dinput2];
	}
	function tensorLatentGrad(
		inputs: tf.Tensor,
		weights: tf.Tensor,
		dweights: tf.Tensor
	) {
		return weights.mul(dweights).sum(0).div(inputs);
	}
	function computeLatentGrads() {
		const optimCpy = tf.train.adam(lr);
		const latentGrads = [];
		const weightsTensor = model.decoder.getWeights()[0];
		for (const point of dataset) {
			const wrappedPoint = [point];
			const input = tf.tensor(wrappedPoint);

			const latentOutputTensor = model.encoder.predict(input);
			const grads = optimCpy.computeGradients(() =>
				loss(model.decoder.predict(latentOutputTensor), wrappedPoint)
			);
			const weightGradsTensor = grads.grads[Object.keys(grads.grads)[0]];
			latentGrads.push(
				tensorToArray(
					tensorLatentGrad(
						//@ts-expect-error
						latentOutputTensor,
						weightsTensor,
						weightGradsTensor
					)
				)[0]
			);
		}
		return latentGrads;
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
		// const A = tf.tensor2d([1, 2, 3, 4], [2, 2]);
		// const B = tf.tensor2d([2, 2, 2, 2], [2, 2]);
		// const INPUTS = tf.tensor([[2, 3]]);
		// const mult = A.mul(B);
		// mult.print();
		// const sum = mult.sum(0);
		// sum.print();
		// const div = sum.div(INPUTS);
		// div.print();
		// tensorLatentGrad(INPUTS, A, B).print();
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
	let latentColor = "hsla(194, 91%, 45%, 1)";
	let outputColor = "hsla(248, 49%, 68%, 0.5)";
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
		<div id="latent-grads">
			<Latent
				grads={$gradsTweened}
				points={$latentTweened}
				min={$minTweened}
				max={$maxTweened}
			/>
		</div>
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
			height: 800px;
			background-color: lightgray;
		}
		#layered-view {
			#latent-grads {
				margin-top: 25px;
				// width: 300px;
				// height: 300px;
				// background: lightgrey;
			}
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
