<script>
	import { onMount } from "svelte";
	import { legend } from "./legend.js";
	import * as d3 from "d3";

	// not optional
	let el;
	export let title = "Title";
	export let data = [0, 1];
	export let scale = d3.scaleSequential;
	export let scheme = d3.interpolateBlues;

	// optionals
	export let width = undefined;
	export let height = undefined;
	export let marginTop = undefined;
	export let marginRight = undefined;
	export let marginBottom = undefined;
	export let marginLeft = undefined;
	export let tickSize = undefined;
	export let tickFormat = undefined;

	const color = scale(data, scheme);

	function addLegend() {
		d3.select(el).node().append(
			legend({
				color,
				title,
				tickSize,
				tickFormat,
				width,
				height,
				marginTop,
				marginRight,
				marginBottom,
				marginLeft,
				tickSize,
				tickFormat,
			})
		);
	}

	onMount(() => {
		addLegend();
	});
</script>

<div bind:this={el} />
