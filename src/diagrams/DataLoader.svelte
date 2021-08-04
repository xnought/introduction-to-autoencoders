<script lang="ts">
	import { onMount } from "svelte";
	import { interpolateSpectral } from "d3";
	import Encoder from "./Encoder.svelte";
	import Decoder from "./Decoder.svelte";
	import Latent from "./Latent.svelte";

	type picker = "encoder" | "latent" | "decoder";
	export let diagramPicker: picker;
	let latentData, data3D;
	let mounted = false;

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
	let inputColors: string[];
	let outputColors: string[];
	let inputColor = "hsla(194, 91%, 45%, 0.3)";
	let latentColor = "hsla(122, 51%, 82%, 1)";
	let encoderFill = "hsla(194, 74%, 73%, 0.7)";
	let outputColor = "hsla(29, 100%, 55%, 1)";
	let decoderFill = "hsla(29, 95%, 64%, 0.7)";
	let encoderStroke = "hsla(194, 91%, 45%, 1)";
	let decoderStroke = outputColor;
	const numData = 25;
	onMount(async () => {
		if (diagramPicker === "encoder" || diagramPicker === "decoder") {
			const getData3D = await fetch("data/circle.json");
			data3D = (await getData3D.json()).data;
		}
		const getLatentData = await fetch("data/latentGrads.json");
		latentData = await getLatentData.json();

		inputColors = genColorArray(numData, () => inputColor);
		outputColors = genColorArray(numData, (i) =>
			interpolateSpectral(i / (numData - 1))
		);

		console.log(latentData);
		mounted = true;
	});
</script>

<div id="container">
	{#if mounted}
		{#if diagramPicker === "encoder"}
			<div id="encoder">
				<Encoder
					inputs={data3D}
					minLatent={latentData[latentData.length - 1].min}
					latent={latentData[latentData.length - 1].latent}
					maxLatent={latentData[latentData.length - 1].max}
					outputs={[]}
					axesVisible
					animating={false}
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
		{:else if diagramPicker === "latent"}
			<div>
				<Latent
					colorIndices={outputColors}
					data={latentData}
					{latentColor}
				/>
			</div>
		{:else if diagramPicker === "decoder"}
			<div id="decoder">
				<Decoder
					inputs={[]}
					minLatent={latentData[latentData.length - 1].min}
					latent={latentData[latentData.length - 1].latent}
					maxLatent={latentData[latentData.length - 1].max}
					outputs={data3D}
					axesVisible
					animating={false}
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
		{/if}
	{/if}
</div>

<style lang="scss">
	#container {
		display: flex;
		justify-content: center;
	}
	#encoder,
	#decoder {
		margin: 20px;
	}
</style>
