<script lang="ts">
	import Plot3D from "../projections/Plot3D.svelte";
	import Plot2D from "../projections/Plot2D.svelte";

	export let inputs: Point3D[] = [];
	export let latent: Point2D[] = [];
	export let minLatent: Point2D = [Infinity, Infinity];
	export let maxLatent: Point2D = [0, 0];
	export let outputs: Point3D[] = [];

	export let globalPosition: Point3D = [0.45, 0.9, 1.6];
	export let globalHover: number = -1;
	export let axesVisible: boolean = true;

	interface IPosition {
		position: { x: number; y: number; z: number };
	}
	function receiveAndSetGlobalPosition(e: CustomEvent<IPosition>) {
		const { x, y, z } = e.detail.position;
		globalPosition = [x, y, z];
	}
	function receiveAndSetGlobalHover(e: CustomEvent<number>) {
		globalHover = e.detail;
	}

	// fix this later to include mutliple colors labels for data
	let inputColor = "hsla(226, 74%, 50%, 0.5)";
	let latentColor = "hsla(194, 74%, 73%, 1)";
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
	<div class="encoder" />
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
	<div class="decoder" />
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
	$test-color: hsl(194, 74%, 73%);
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
			@include add-border();
			position: absolute;
			width: 141px;
			height: 165px;
			left: 199px;
			top: 15px;

			box-sizing: border-box;
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
			@include add-border();
			position: absolute;
			width: 142px;
			height: 165px;
			left: 455px;
			top: 15px;

			box-sizing: border-box;
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
