<script lang="ts">
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { color, interpolateSpectral } from "d3";
	import LatentGraph from "../main/components/projections/Latent.svelte";
	/* Put stuff here */
	export let data;
	export let colorIndices;
	export let latentColor;

	let configTweened = {
		delay: 0,
		duration: 1000,
		easing: cubicOut,
	};

	let epochInterval = 50;
	const first = data[0];
	const latentTweened = tweened(first.latent, configTweened);
	const gradsTweened = tweened(first.grads, configTweened);
	const minTweened = tweened(first.min, configTweened);
	const maxTweened = tweened(first.max, configTweened);
	const lossTweened = tweened(first.loss, configTweened);
	const epochTweened = tweened(0, configTweened);
	let oppgrads = "Opposite Gradients";
	let oppgradsColors = new Array(oppgrads.length)
		.fill("")
		.map((_, i) =>
			color(interpolateSpectral(i / (oppgrads.length - 1))).darker(0.2)
		);
	let value = 0;
	function iterateTween(index: number) {
		if (index < data.length) {
			const curr = data[index];
			latentTweened.set(curr.latent);
			gradsTweened.set(curr.grads);
			minTweened.set(curr.min);
			maxTweened.set(curr.max);
			lossTweened.set(curr.loss);
			epochTweened.set(index == 0 ? 1 : index * epochInterval);
		}
	}
	//directly from ganlab by minuk kahng
	function zeroPad(n: number): string {
		const pad = "000000";
		return (pad + n)
			.slice(-pad.length)
			.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	$: {
		iterateTween(value);
	}
	let clearText = "rgba(0,0,0,0.2)";
</script>

<div id="latentVis">
	<div>
		<div>
			<div class="colored" style="color: {latentColor};font-size: 15px;">
				2D Latent Space
			</div>
			<div class="colored" style="color: {clearText};font-size: 15px;">
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
		<LatentGraph
			grads={$gradsTweened}
			points={$latentTweened}
			min={$minTweened}
			max={$maxTweened}
			{colorIndices}
			borderColor={latentColor}
			width={300}
			height={300}
		/>
	</div>
	<div>
		<div style="display: flex; width: 300px;">
			<div id="metrics" style="margin-left: 20px; width: 100px;">
				<div style="font-size: 16px; font-weight: 250;">Epochs</div>
				<div style="font-size: 25px;">
					{zeroPad(+$epochTweened.toFixed(0))}
				</div>
			</div>
			<div id="loss" style="margin-left: 20px;">
				<div style="font-size: 16px; font-weight: 250;">Loss</div>
				<div style="font-size: 25px;">
					{$lossTweened.toFixed(6)}
				</div>
			</div>
		</div>
		<div style="margin-left: 20px; margin-top: 10px;">
			<d-slider
				style="width: 200px;"
				min="0"
				max="3"
				step="1"
				{value}
				on:input={(e) => (value = e.target.value)}
			/>
		</div>
	</div>
	<!-- First need to bring in the latent grads -->
</div>

<style lang="scss">
	/*  put stuff here */
	#latentVis {
		// width: 400px;
		// height: 500px;
		// border: 1px solid black;
	}
	.colored {
		display: inline;
		font-size: 20px;
		font-weight: 500;
	}
</style>
