<script lang="ts">
	import { scaleLinear } from "d3";

	// measurements and settings
	export let animating: boolean = false;
	export let width: number;
	export let height: number;
	export let leftVerticalWidth: number = 50;
	export let rightVerticalWidth: number = 100;

	// styling settings
	export let fill = "lightgrey";
	export let stroke = "black";

	let leftBottom: number,
		leftTop: number,
		rightBottom: number,
		rightTop: number,
		leftSide: number = 0,
		rightSide: number = width;
	$: xScale = scaleLinear().domain([0, 100]).range([0, width]);
	$: yScale = scaleLinear().domain([0, 100]).range([height, 0]);
	$: {
		rightBottom = (100 - rightVerticalWidth) / 2;
		rightTop = rightBottom + rightVerticalWidth;

		leftBottom = (100 - leftVerticalWidth) / 2;
		leftTop = leftBottom + leftVerticalWidth;
	}
</script>

<svg {width} {height} style="overflow: visible;">
	<path
		d={`M${leftSide},${yScale(leftBottom)}L${rightSide},${yScale(
			rightBottom
		)}L${rightSide},${yScale(rightTop)}L${leftSide},${yScale(leftTop)}z`}
		{fill}
	/>
	<line
		x1={leftSide}
		x2={rightSide}
		y1={yScale(leftTop)}
		y2={yScale(rightTop)}
		{stroke}
		class="line {animating ? 'animateLine' : ''}"
	/>
	<line
		x1={leftSide}
		x2={rightSide}
		y1={yScale(leftBottom)}
		y2={yScale(rightBottom)}
		{stroke}
		class="line {animating ? 'animateLine' : ''}"
	/>
</svg>

<style lang="scss">
	/*  put stuff here */
	line {
		stroke-width: 3px;
	}
	.line {
		stroke-dasharray: none;
	}
	.animateLine {
		stroke-dasharray: 20, 5;
		animation: flowForward linear infinite forwards;
		animation-duration: 1.2s;
	}

	@keyframes flowForward {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -204;
		}
	}
</style>
