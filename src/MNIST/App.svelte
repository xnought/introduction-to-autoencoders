<script lang="ts">
	import Scatter from "./components/scatter/Scatter.svelte";
	import MnistDigit from "./components/mnistDigit/MnistDigit.svelte";
	import { onDestroy, onMount } from "svelte";
	import { dataFilePath, get, decodeGivenCoord } from "./app";
	import * as tf from "@tensorflow/tfjs";

	export let title: string;
	let loaded = false;
	let x = 0,
		y = 40;
	let encoder: tf.LayersModel, decoder: tf.LayersModel;
	let digitData: number[];
	let maxData: number;

	let formattedData: IScatterFormat[];
	let square = 600;

	onMount(async () => {
		const data2 = await get<IData>(dataFilePath("latent.json"));
		decoder = await tf.loadLayersModel("datafiles/decoder/model.json");
		const { decoded, max } = decodeGivenCoord(decoder, [x, y]);
		digitData = decoded;
		maxData = max;
		formattedData = data2.data;
		console.log(formattedData.length);
		loaded = true;
	});

	// afterUpdate(() => {
	// 	console.log(tf.memory().numTensors);
	// });
	onDestroy(() => {
		encoder.dispose();
		decoder.dispose();
	});
</script>

<div style="border: 1px solid black; width: 800px;">
	{#if loaded}
		<div style="display: inline-flex;">
			<div>
				<Scatter
					width={200}
					height={200}
					data={formattedData}
					xDomain={[-80, 10]}
					yDomain={[-40, 70]}
					radius={3}
					strokeWidth={0.5}
					position={(xPoint, yPoint) => {
						(x = xPoint), (y = yPoint);
						tf.tidy(() => {
							const { decoded, max } = decodeGivenCoord(decoder, [
								+x,
								+y,
							]);
							digitData = decoded;
							maxData = max;
						});
					}}
					legendTitle={"Digit Label"}
				/>
			</div>
			<div style="margin-left: 100px;">
				<MnistDigit data={digitData} square={300} maxVal={maxData} />
			</div>
		</div>
	{:else}
		<center>Loading...</center>
	{/if}
</div>

<style lang="scss">
	@import "./styles/theme.scss";

	#bar {
		background-color: $primary;
		display: flex;
		align-items: center;
		margin-bottom: 20px;
		height: 50px;
		#title {
			margin-left: 20px;
			font-size: 20px;
			color: black;
		}
	}
	#button-container {
		position: fixed;
		right: 20px;
		bottom: 20px;

		display: flex;
		align-items: center;

		.divider {
			background: white;
			height: 40px;
			width: 1px;
			margin-right: 10px;
			margin-left: 10px;
		}
		#personal {
			color: $primary;
		}
	}
</style>
