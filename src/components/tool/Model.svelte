<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Plot3D from "../projections/Plot3D.svelte";
	import Plot2D from "../projections/Plot2D.svelte";
	import Trapezoid from "./Trapezoid.svelte";

	const dispatch = createEventDispatcher();

	export let inputs: Point3D[] = [];
	export let latent: Point2D[] = [];
	export let minLatent: Point2D = [Infinity, Infinity];
	export let maxLatent: Point2D = [0, 0];
	export let outputs: Point3D[] = [];
	export let animating = false;

	export let globalPosition: Point3D = [0.45, 0.9, 1.6];
	export let globalHover: number = -1;
	export let axesVisible: boolean = true;

	interface IPosition {
		position: { x: number; y: number; z: number };
	}
	function receiveAndSetGlobalPosition(e: CustomEvent<IPosition>) {
		dispatch("drag", e.detail);
		const { x, y, z } = e.detail.position;
		globalPosition = [x, y, z];
	}
	function receiveAndSetGlobalHover(e: CustomEvent<number>) {
		globalHover = e.detail;
	}

	// fix this later to include mutliple colors labels for data
	let inputColor = "hsla(0, 0%, 0%, 0.5)";
	let latentColor = "hsla(194, 91%, 45%, 1)";
	let outputColor = "hsla(249, 48%, 84%, 0.5)";
</script>

<div class="container">
	<div class="input">
		<Plot3D
			data3D={inputs}
			on:hover={receiveAndSetGlobalHover}
			on:drag={receiveAndSetGlobalPosition}
			width="165px"
			height="165px"
			hoveredPointIndex={globalHover}
			{axesVisible}
			colors={[inputColor]}
			pos={globalPosition}
		/>
	</div>
	<div class="encoder">
		<Trapezoid
			width={141}
			height={165}
			leftVerticalWidth={100}
			rightVerticalWidth={50}
			fill="hsla(194, 74%, 73%, 1)"
			stroke="hsla(194, 91%, 45%, 0.5)"
			{animating}
		/>
	</div>
	<div class="latent">
		<Plot2D
			data2D={latent}
			width={81}
			height={81}
			color={latentColor}
			radius={1}
			min={minLatent}
			max={maxLatent}
		/>
	</div>
	<div class="decoder">
		<Trapezoid
			width={141}
			height={165}
			leftVerticalWidth={50}
			rightVerticalWidth={100}
			fill="hsla(249, 48%, 84%, 1)"
			stroke="hsla(248, 49%, 68%, 0.5)"
			{animating}
		/>
	</div>
	<div class="output">
		<Plot3D
			data3D={outputs}
			on:hover={receiveAndSetGlobalHover}
			on:drag={receiveAndSetGlobalPosition}
			width="165px"
			height="165px"
			hoveredPointIndex={globalHover}
			{axesVisible}
			colors={[outputColor]}
			pos={globalPosition}
		/>
	</div>
</div>

<style lang="scss">
	$outline: 1px solid black;
	$test-color: hsla(0, 0%, 0%, 0.5);
	@mixin add-border() {
		border: $outline;
	}

	.container {
		@include add-border();
		position: relative;
		width: 794px;
		height: 196px;

		.input {
			@include add-border();
			position: absolute;
			width: 165px;
			height: 165px;
			left: 19px;
			top: 15px;

			// box-sizing: border-box;
		}
		.encoder {
			position: absolute;
			width: 141px;
			height: 165px;
			left: 199px;
			top: 15px;
		}
		.latent {
			@include add-border();
			position: absolute;
			width: 81px;
			height: 81px;
			left: 357px;
			top: 57px;
		}
		.decoder {
			position: absolute;
			width: 142px;
			height: 165px;
			left: 455px;
			top: 15px;
		}
		.output {
			@include add-border();
			position: absolute;
			width: 165px;
			height: 165px;
			left: 611px;
			top: 15px;
		}
	}
</style>
