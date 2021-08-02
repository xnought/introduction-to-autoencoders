<script lang="ts">
	import { onMount } from "svelte";
	import { scaleLinear } from "d3";
	const PI2 = 2 * Math.PI;

	export let data2D: Point2D[] = [
		[0, 0.1],
		[-0.5, 0.5],
		[0.1, 0.2],
	];
	export let width = 250;
	export let height = 250;
	export let min: Point2D;
	export let max: Point2D;
	export let color = "black";
	export let radius = 2;
	export let padding = 0.1;

	let xScale = scaleLinear().domain([-2, 2]).range([0, width]);
	let yScale = scaleLinear().domain([-2, 2]).range([height, 0]);
	let container: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let mounted = false;

	onMount(() => {
		ctx = container.getContext("2d");
		ctx.fillStyle = color;
		render2D(data2D);
		renderOutline();
		mounted = true;
	});

	$: {
		if (mounted) {
			updateAxes(min, max);
			render2D(data2D);
		}
	}

	function updateAxes(min, max) {
		xScale = scaleLinear()
			.domain([min[0] - padding, max[0] + padding])
			.range([0, width]);
		yScale = scaleLinear()
			.domain([min[1] - padding, max[1] + padding])
			.range([height, 0]);
	}
	function clearCanvas() {
		ctx.clearRect(0, 0, width, height);
	}
	function render2D(data2D: number[][]) {
		clearCanvas();
		for (const coord of data2D) {
			const [x, y] = coord;
			plotPoint([xScale(x), yScale(y)], radius);
		}
	}
	function plotPoint([x, y]: number[], radius: number = 5) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, PI2);
		ctx.fill();
	}
	function renderOutline() {
		ctx.beginPath();
		ctx.rect(0, 0, width, height);
		ctx.stroke();
	}
</script>

<div>
	<canvas bind:this={container} {width} {height} />
</div>

<style lang="scss">
	/*  put stuff here */
</style>
