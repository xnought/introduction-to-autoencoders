<script lang="ts">
	import * as tf from "@tensorflow/tfjs";
	import { arrayToTensor, tensorToArray } from "./tool";
	import { onMount } from "svelte";
	import { tweened } from "svelte/motion";
	import * as d3 from "d3";
	import * as easings from "svelte/easing";
	import Plot3D from "../projections/Plot3D.svelte";
	import Latent from "../projections/Latent.svelte";
	import Model from "./Model.svelte";
	import Data from "../datapicker/Data.svelte";

	function genColorArray(
		datasetLength: number,
		callback: (index?: number) => string
	) {
		let colorArray = new Array(datasetLength);
		for (let i = 0; i < datasetLength; i++) {
			colorArray[i] = callback(i);
		}
		return colorArray;
	}

	function zeros3D(length: number) {
		let result = [];
		for (let i = 0; i < length; i++) {
			result.push([0, 0, 0]);
		}
		return result;
	}
	function zeros2D(length: number) {
		let result = [];
		for (let i = 0; i < length; i++) {
			result.push([0, 0]);
		}
		return result;
	}

	//directly from ganlab by minuk kahng
	function zeroPad(n: number): string {
		const pad = "000000";
		return (pad + n)
			.slice(-pad.length)
			.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	interface IComposition {
		encoderNeurons: number[];
		decoderNeurons: number[];
		activation: ActivationIdentifier;
	}
	function compose({
		encoderNeurons,
		decoderNeurons,
		activation,
	}: IComposition) {
		let encoderLayers = [],
			decoderLayers = [];

		// encoder composition
		// input layer
		encoderLayers.push(
			tf.layers.dense({
				units: encoderNeurons[0],
				inputShape: [3],
				activation,
			})
		);
		for (let layer = 1; layer < encoderNeurons.length; layer++) {
			encoderLayers.push(
				tf.layers.dense({
					units: encoderNeurons[layer],
					activation,
				})
			);
		}
		// latent output
		encoderLayers.push(tf.layers.dense({ units: 2 }));

		// decoder composition
		decoderLayers.push(
			tf.layers.dense({
				units: decoderNeurons[0],
				inputShape: [2],
				activation,
			})
		);

		for (let layer = 1; layer < decoderNeurons.length; layer++) {
			decoderLayers.push(
				tf.layers.dense({
					units: decoderNeurons[layer],
					activation,
				})
			);
		}
		//output layer
		decoderLayers.push(
			tf.layers.dense({
				units: 3,
			})
		);
		return { encoderLayers, decoderLayers };
	}

	class Autoencoder {
		encoder: tf.Sequential;
		decoder: tf.Sequential;
		encoderLayers: tf.layers.Layer[];
		decoderLayers: tf.layers.Layer[];
		constructor(
			activation: ActivationIdentifier,
			encoderNeurons: number[],
			decoderNeurons: number[]
		) {
			const { decoderLayers, encoderLayers } = tf.tidy(() =>
				compose({
					encoderNeurons,
					decoderNeurons,
					activation,
				})
			);

			this.encoderLayers = encoderLayers;
			this.decoderLayers = decoderLayers;
			this.encoder = tf.sequential({
				layers: this.encoderLayers,
			});
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
	export let datasets: dataType[];
	export let dataset: dataType = datasets[0];
	export let datasetNames: string[];
	let model: Autoencoder;
	let tensorDataset: tf.Tensor;
	let loss: any;
	let optim: tf.Optimizer;
	let lr: number = 0.01;
	let activation: ActivationIdentifier = "tanh";
	let epoch: number = 0;
	let maxLoss = 0;

	// output items
	let preds: Point3D[] = [];
	let latent: Point2D[] = [];
	let min: Point2D = [Infinity, Infinity];
	let max: Point2D = [0, 0];
	let pos: Point3D = [0.45, 0.9, 1.6];
	let printLoss: number;
	const lrOptions = [0.00001, 0.001, 0.01, 0.1, 0.3, 0.5, 1];
	const actOptions = ["tanh", "sigmoid", "relu"];
	let encoderNeurons = [64, 64, 2];
	let decoderNeurons = [2, 64, 64];
	let inputColor = "hsla(194, 91%, 45%, 0.3)";
	let latentColor = "hsla(122, 51%, 82%, 1)";
	let encoderFill = "hsla(194, 74%, 73%, 0.7)";
	let outputColor = "hsla(29, 100%, 55%, 1)";
	let decoderFill = "hsla(29, 95%, 64%, 0.7)";
	let encoderStroke = "hsla(194, 91%, 45%, 1)";
	let decoderStroke = outputColor;
	let clearText = "rgba(0,0,0,0.2)";
	let oppgrads = "Opposite Gradients";
	let oppgradsColors = new Array(oppgrads.length)
		.fill("")
		.map((_, i) =>
			d3
				.color(d3.interpolateSpectral(i / (oppgrads.length - 1)))
				.darker(0.2)
		);

	let isRunning = false;

	let configTweened = {
		delay: 0,
		duration: 1000,
		easing: easings.cubicOut,
	};
	// computed when we change dataset or config
	$: grads = zeros2D(dataset.length);
	$: gradsTweened = tweened(zeros2D(dataset.length), configTweened);
	$: latentTweened = tweened(zeros2D(dataset.length), configTweened);
	$: minTweened = tweened([0, 0], configTweened);
	$: maxTweened = tweened([0, 0], configTweened);
	$: predsTweened = tweened(zeros3D(dataset.length), configTweened);
	// colors computed
	$: inputColors = genColorArray(dataset.length, () => inputColor);
	$: outputColors = genColorArray(dataset.length, (i) =>
		d3.interpolateSpectral(i / (dataset.length - 1))
	);

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
				if (printLoss > maxLoss) {
					maxLoss = printLoss;
				}
				getOuputs();
				if (epoch % 50 == 0) {
					grads = computeLatentGrads();
					gradsTweened.set(grads);
					latentTweened.set(latent);
					minTweened.set(min);
					maxTweened.set(max);
					predsTweened.set(preds);
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
		isRunning = false;
		maxLoss = 0;
		model.dispose();
		model = new Autoencoder(activation, encoderNeurons, decoderNeurons);
		preds = [];
		latent = [];
		printLoss = undefined;
		// gradsTweened.set(zeros2D(dataset.length));
		// latentTweened.set(zeros2D(dataset.length));
		// minTweened.set([-2, 2]);
		// maxTweened.set([-2, 2]);
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
		const dInputs = weights.mul(dweights).sum(0).div(inputs);
		const gradDesc = inputs.sub(dInputs.mul(lr));
		return gradDesc;
	}
	function computeLatentGrads() {
		const optimCpy = tf.train.sgd(lr);
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
		optimCpy.dispose();
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

	let mounted = false;
	onMount(async () => {
		// define data
		tensorDataset = arrayToTensor(dataset).variable();
		// define model
		model = new Autoencoder(activation, encoderNeurons, decoderNeurons);
		// define loss
		loss = tf.losses.meanSquaredError;
		// define optimizer
		optim = tf.train.adam(lr);
		mounted = true;
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
	function setOptimizer(lr: number) {
		optim.dispose();
		optim = tf.train.adam(lr);
	}
	function setModel(activation: ActivationIdentifier) {
		model.dispose();
		model = new Autoencoder(activation, encoderNeurons, decoderNeurons);
	}
	function setDataset(index: number) {
		dataset = datasets[index];
		tensorDataset.dispose();
		tensorDataset = arrayToTensor(dataset).variable();
	}

	// computed properties
	$: optionsEnabled = epoch == 0 && printLoss == undefined;
	$: {
		if (mounted) {
			setOptimizer(lr);
		}
	}
	$: {
		if (mounted) {
			setModel(activation);
		}
	}
	let selectedDatasetIndex = 0;
	let globalHover = -1;
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
		<div style="margin-bottom: 60px;">
			<div
				class="colored"
				style="margin-left: 25px;font-size: 30px; color: {clearText}"
			>
				A.
			</div>
			<div class="colored">Pick a Dataset</div>
			<div
				class="colored"
				style="margin-left: 50px; font-size: 30px; color: {clearText}"
			>
				B.
			</div>
			<div class="colored" style="color: steelblue;">
				Train Autoencoder
			</div>
		</div>
		<div id="control-center">
			<div style="width: 150px">
				{#each datasets as ds, i}
					<Data
						image="prev/{datasetNames[i]}.png"
						onClick={() => {
							selectedDatasetIndex = i;
							reset();
							setDataset(selectedDatasetIndex);
						}}
						selected={selectedDatasetIndex == i}
					/>
					<!-- <div
						class="dataset"
						on:click={() => {
							dataset = [...ds];
						}}
					>
						{i}
					</div> -->
				{/each}
			</div>
			<div id="controls">
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
								reset();
							}}
							disabled={isRunning || epoch == 0}
						>
							<i class="material-icons">refresh</i>
						</button>
					</div>
				</div>
			</div>
			<div id="metrics">
				<div style="font-size: 16px; font-weight: 250;">Epochs</div>
				<div style="font-size: 25px;">{zeroPad(epoch)}</div>
			</div>
			<div id="loss">
				<div style="font-size: 16px; font-weight: 250;">Loss</div>
				<div style="font-size: 25px;">
					{printLoss ? printLoss.toFixed(6) : "..."}
				</div>
			</div>
			<div id="custom">
				<!-- <div id="lr">
					<div style="font-size: 16px; font-weight: 250;">
						Learning Rate
					</div>
					<select bind:value={lr} disabled={!optionsEnabled}>
						{#each lrOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div> -->
				<!-- <div id="activation">
					<div style="font-size: 16px; font-weight: 250;">Activation</div>
					<select bind:value={activation} disabled={!optionsEnabled}>
						{#each actOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div> -->
			</div>
		</div>
		<div id="model">
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
				{inputColor}
				{outputColor}
				{inputColors}
				{outputColors}
				{encoderFill}
				{decoderFill}
				{encoderStroke}
				{decoderStroke}
				{latentColor}
			/>
		</div>
	</div>
	<div class="divider" />
	<div id="graphs">
		<div id="layered-view">
			<div style="position: relative;">
				<div
					class="colored"
					style="color: {clearText}; font-weight: normal;"
				>
					Layered
				</div>
				<div class="colored" style="color: {encoderStroke};">
					3D input Data
				</div>
				<div
					class="colored"
					style="color: {clearText}; font-weight: normal;"
				>
					and
				</div>
				<div class="colored" style="color: {outputColor};">
					3D Reconstruction
				</div>
				<!-- <div class="colored" style="color: {outputColor};">
					<span class="material-icons">3d_rotation</span>
					<img src="pointer.svg" />
				</div> -->

				<!-- <div class="colored" style="color: {inputColor};">
					<span class="material-icons">3d_rotation</span>
				</div> -->
			</div>
			<div>
				<Plot3D
					data3D={[
						...dataset,
						...(preds.length > 0 ? $predsTweened : []),
					]}
					on:hover={(e) => {
						globalHover = e.detail % dataset.length;
					}}
					on:drag={(e) => {
						const { x, y, z } = e.detail.position;
						pos = [x, y, z];
					}}
					width="400px"
					height="400px"
					hoveredPointIndex={globalHover}
					axesVisible
					style="border: 3px rgba(0, 0, 0, 0.1) solid; border-radius: 3px;"
					{pos}
					colorIndices={[...inputColors, ...outputColors]}
					pointConfig={{
						colorHover: clearText,
					}}
				/>
			</div>
		</div>
		<div id="latent-grads">
			<div>
				<div
					class="colored"
					style="color: {latentColor};font-size: 15px;"
				>
					2D Latent Space
				</div>
				<div
					class="colored"
					style="color: {clearText};font-size: 15px;"
				>
					with
				</div>
				{#each oppgrads as letter, index}
					<span
						style="color: {oppgradsColors[
							index
						]};font-size: 15px; {letter != ' '
							? 'display: inline-block '
							: ''};"
					>
						{letter}
					</span>
				{/each}
				<img src="trail.svg" alt="trail" />
			</div>
			<div>
				<Latent
					grads={epoch == 0 ? [] : $gradsTweened}
					points={epoch == 0 ? [] : $latentTweened}
					min={$minTweened}
					max={$maxTweened}
					colorIndices={outputColors}
					borderColor={latentColor}
				/>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	$divider-color: hsla(0, 0%, 0%, 0.1);
	#control-center {
		height: 40px;
		display: flex;
		align-items: center;
		margin-bottom: 150px;
		margin-left: 25px;
		// margin-left: 150px;
		// border-bottom: 1px $divider-color solid;
		width: 800px;

		#datasets {
			display: flex;
			.dataset {
				height: 40px;
				width: 40px;
				border: 1px solid black;
				margin: 5px;
			}
			margin-right: 50px;
		}
		#controls {
			margin-left: 60px;
			button {
				cursor: pointer;
				outline: none;
				border-radius: 50%;
				background: steelblue;
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
				font-size: 30px;
				line-height: 0;
			}
		}
		#metrics {
			width: 100px;
			margin-left: 20px;
		}
		#loss {
			width: 100px;
			margin-left: 20px;
		}
		#custom {
			margin-left: 20px;
			display: flex;
			#lr {
			}
			#activation {
				margin-left: 20px;
			}
		}
	}
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		border-top: 1px solid $divider-color;
		user-select: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;

		#model {
		}
		.divider {
			margin-right: 40px;
			margin-left: 20px;
			width: 1px;
			height: 800px;
			background-color: $divider-color;
		}
		#graphs {
			#latent-grads {
				margin-top: 25px;
				// width: 300px;
				// height: 300px;
				// background: lightgrey;
				// border: 1px black solid;
			}
		}
	}
	.colored {
		display: inline;
		font-size: 20px;
		font-weight: 500;
	}
	// .data-menu {
	// 	display: flex;
	// 	width: 200px;
	// 	// margin-left: 5%;
	// }
</style>
