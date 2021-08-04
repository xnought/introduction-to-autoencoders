<script lang="ts">
	import {
		createAxes,
		createScales,
		addAxisToDOM,
		reverseScales,
	} from "./scatter";
	import { onMount } from "svelte";
	import { pointer, scaleOrdinal, schemeCategory10 } from "d3";
	import Legend from "../legend/Legend.svelte";

	// svg config
	const square = 400;
	export let width: number = square;
	export let height: number = square;
	export let legendTitle: string = "title";

	// point config
	export let radius: number = 5;
	export let strokeWidth: number = 3;
	export let strokeColor: string = "white";
	// export let color: string = "steelblue";
	export let position: (x: number, y: number) => void = () => {};

	export let selectedColorArray = schemeCategory10;
	export let color = (index: number) => selectedColorArray[index];

	interface ICoordinate {
		x: number;
		y: number;
		label: number;
	}
	export let data: ICoordinate[] = [
		{ x: 0, y: 0, label: 0 },
		{ x: 2, y: 2, label: 9 },
	];

	// scale config
	export let padding: number = 0;
	export let xDomain: [number, number] = [0, 10];
	export let yDomain: [number, number] = [0, 10];

	// crate scales and save them
	const { xScale, yScale } = createScales({
		width,
		height,
		xDomain,
		yDomain,
		padding,
	});
	// crate scales and save them
	const { revxScale, revyScale } = reverseScales({
		width,
		height,
		xDomain,
		yDomain,
		padding,
	});

	// here we add some axes to the dom
	const addAllAxes = (svgPtr: SVGElement): void => {
		//create the axes and add them to dom
		const { xAxis, yAxis } = createAxes(xScale, yScale);
		addAxisToDOM(svgPtr, `translate(${width - 2 * padding} ,0)`, yAxis);
		addAxisToDOM(svgPtr, `translate(0,${height - 2 * padding})`, xAxis);
	};

	let svgPtr: SVGElement; // bound to the svg in the DOM as seen below
	onMount(() => {
		// addAllAxes(svgPtr); // start by adding some axes to the scatter plot
	});
</script>

<!-- This svg is bound the svg variable above -->
MNIST Latent Space
<div id="container">
	<svg
		bind:this={svgPtr}
		{width}
		{height}
		on:pointermove={(e) => {
			const [x, y] = pointer(e, svgPtr);
			position(revxScale(x), revyScale(y));
		}}
	>
		<rect
			x={0}
			y={0}
			{width}
			{height}
			fill="#00000000"
			stroke="#cccccc19"
			stroke-width={1}
		/>
		<!-- <SVGOutline {width} /> -->
		{#each data as { x, y, label }}
			<circle
				cx={xScale(x)}
				cy={yScale(y)}
				r={radius}
				stroke={strokeColor}
				fill={color(label)}
				stroke-width={strokeWidth}
			/>
		{/each}
	</svg>
</div>
<div style="margin-top: 20px;">
	<Legend
		title={legendTitle}
		data={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
		scale={scaleOrdinal}
		scheme={selectedColorArray}
	/>
</div>

<style lang="scss">
	@import "../../styles/theme";
	svg {
		overflow: visible;
		// cursor: crosshair;
		border: 3px solid black;
		border-radius: 3px;
	}
	#container {
		padding: 5px;
	}
</style>
