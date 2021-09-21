<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Plot3D from "../main/components/projections/Plot3D.svelte";
	import Plot2D from "../main/components/projections/Plot2D.svelte";
	import Trapezoid from "../main/components/tool/Trapezoid.svelte";

	const dispatch = createEventDispatcher();
	export let inputColors: string[];
	export let outputColors: string[];

	export let inputs: Point3D[] = [];
	export let latent: Point2D[] = [];
	export let minLatent: Point2D = [Infinity, Infinity];
	export let maxLatent: Point2D = [0, 0];
	export let outputs: Point3D[] = [];
	export let animating = false;

	export let globalPosition: Point3D = [0.45, 0.9, 1.6];
	export let globalHover: number = -1;
	export let axesVisible: boolean = false;

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
	export let inputColor = "hsla(0, 0%, 0%, 0.3)";
	export let latentColor = "hsla(194, 91%, 45%, 0.5)";
	export let encoderFill = "hsla(194, 74%, 73%, 1)";
	export let decoderFill = "hsla(249, 48%, 84%, 1)";
	export let encoderStroke;
	export let decoderStroke;
	export let outputColor = "hsla(249, 48%, 84%, 0.5)";
	export let borderRadius = 3;
	export let borderWidth = 3;
	export let scaleDefault = 0.5;
	// fix this later to include mutliple colors labels for data
	export let pointConfig = {
		scaleDefault,
		scaleHover: 1.5,
		colorHover: "hsla(0, 0%, 0%, 0.3)",
	};
</script>

<div class="container">
	<div
		class="input"
		style="border: {borderWidth}px {encoderStroke} solid; border-radius: {borderRadius}px;"
	>
		<Plot3D
			data3D={inputs}
			on:hover={receiveAndSetGlobalHover}
			width="165px"
			height="165px"
			hoveredPointIndex={globalHover}
			pos={globalPosition}
			axesVisible={true}
			colorIndices={inputColors}
			{pointConfig}
			orbitOnStart={true}
		/>
		<div class="text-center">
			<div class="colored" style="color: {encoderStroke};">
				3D Input Data
			</div>
		</div>
	</div>
	<div class="encoder">
		<Trapezoid
			width={141}
			height={165}
			leftVerticalWidth={100}
			rightVerticalWidth={50}
			fill={encoderFill}
			stroke={encoderStroke}
			{animating}
		/>
		<div class="text-center">
			<div class="colored" style="color: {encoderFill}; font-size: 20px;">
				Encoder
			</div>
		</div>
	</div>
	<div
		class="latent"
		style="border: {borderWidth}px {latentColor} solid; border-radius: {borderRadius}px;"
	>
		<Plot2D
			data2D={latent}
			width={81}
			height={81}
			radius={2}
			min={minLatent}
			max={maxLatent}
			colorIndices={outputColors}
			on:hover={(e) => (globalHover = e.detail)}
			hoverPointIndex={globalHover}
		/>
		<div class="text-center">
			<div class="colored" style="color: {latentColor}; font-size: 14px;">
				<p style="line-height: 1.2;">2D Latent Space</p>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	$outline: 1px solid black;
	$test-color: hsla(0, 0%, 0%, 0.1);
	@mixin add-border() {
		border: $outline;
	}

	.container {
		// @include add-border();
		position: relative;
		width: 450px;
		height: 196px;

		.input {
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
			// @include add-border();
			position: absolute;
			width: 81px;
			height: 81px;
			left: 357px;
			top: 57px;
			box-sizing: border-box;
		}
		.decoder {
			position: absolute;
			width: 142px;
			height: 165px;
			left: 455px;
			top: 15px;
		}
		.output {
			// @include add-border();
			position: absolute;
			width: 165px;
			height: 165px;
			left: 611px;
			top: 15px;
		}
	}
	.text-center {
		text-align: center;
	}
	.colored {
		display: inline;
		font-size: 15px;
		font-weight: 500;
	}
</style>
