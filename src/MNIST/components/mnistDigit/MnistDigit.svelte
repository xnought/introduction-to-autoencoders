<script lang="ts">
	import { drawPixels } from "./mnistDigit";
	import { select, interpolateGreys, max, scaleLinear } from "d3";
	import { afterUpdate, onMount } from "svelte";

	// take in the digit data
	// export let digit: IData;
	// const { data, label } = digit;
	export let data: number[];

	// configuration
	export let square: number = 250;
	const dim = 28;
	export let width: number = square;
	export let height: number = square;
	let canvasPtr: HTMLCanvasElement; // points to the canvas in the DOM
	let ctx: CanvasRenderingContext2D; // the context assigned onMount
	export let maxVal: number = max(data);

	// create greyscale function 0 -> 1 output shade
	export let range = [1, 0];
	let colorScale = scaleLinear().domain([0, maxVal]).range(range);
	const greyScale = (value: number): color =>
		interpolateGreys(colorScale(value));

	// on creation paint the digit
	const redraw = () => {
		ctx.clearRect(0, 0, square, square); // clear the canvas
		drawPixels(ctx, width, dim, greyScale, data); // draw the digit on canvas
	};

	// on creation make sure to store the canvas context
	onMount(() => {
		ctx = select(canvasPtr).node().getContext("2d");
	});
	// on update of props redraw the digit
	afterUpdate(() => {
		redraw(); // when we update redraw
	});
</script>

<div>
	<canvas bind:this={canvasPtr} {width} {height} />
</div>
