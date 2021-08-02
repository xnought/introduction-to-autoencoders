<script lang="ts">
	import Triangle from "./Triangle.svelte";
	import * as d3 from "d3";
	import { onMount } from "svelte";

	/* Put stuff here */
	export let colorIndices: string[];
	export let padding = 0.1;
	export let height = 200;
	export let width = 200;
	export let min: Point2D;
	export let max: Point2D;
	export let fill = "hsla(194, 91%, 45%, 1)";
	export let borderColor = "hsla(194, 91%, 45%, 0.5)";
	export let borderRadius = 3;
	export let borderWidth = 3;
	export let grads: Point2D[] = [
		[0.2, 0.2],
		[0.1, 0.1],
	];
	export let points: Point2D[] = [
		[0.1, 0.1],
		[0.5, 0.2],
	];

	let xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
	let yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

	$: {
		updateAxes(min, max);
	}
	function updateAxes(min: Point2D, max: Point2D) {
		xScale = d3
			.scaleLinear()
			.domain([min[0] - padding, max[0] + padding])
			.range([0, width]);
		yScale = d3
			.scaleLinear()
			.domain([min[1] - padding, max[1] + padding])
			.range([height, 0]);
	}

	// stroke="hsla(194, 91%, 45%, 0.5)"
	let svg: SVGElement;
</script>

<svg
	bind:this={svg}
	{width}
	{height}
	style="border: {borderWidth}px {borderColor} solid; border-radius: {borderRadius}px;"
>
	{#each points as point, index}
		<Triangle
			{point}
			grad={grads[index]}
			{xScale}
			{yScale}
			color={d3.color(colorIndices[index]).brighter(2)}
		/>
		<circle
			cx={xScale(point[0])}
			cy={yScale(point[1])}
			r={3}
			fill={colorIndices[index]}
		/>
	{/each}
</svg>

<style lang="scss">
	/*  put stuff here */
	// line,
	// circle {
	// 	transition: ease-in-out 1.1s;
	// }
</style>
