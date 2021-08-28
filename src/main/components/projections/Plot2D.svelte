<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import { scaleLinear, pointer } from "d3";
	const dispatch = createEventDispatcher();

	export let data2D: Point2D[] = [
		[0, 0.1],
		[-0.5, 0.5],
		[0.1, 0.2],
	];
	export let width = 250;
	export let height = 250;
	export let min: Point2D;
	export let max: Point2D;
	export let radius = 3;
	export let largerRadius = radius + 3;
	export let padding = 0.25;
	export let colorIndices: string[];
	export let hoverPointIndex = -1;

	let svg: SVGElement;
	let xScale = scaleLinear().domain([-2, 2]).range([0, width]);
	let yScale = scaleLinear().domain([-2, 2]).range([height, 0]);
	let REVyScale = scaleLinear().domain([-2, 2]).range([height, 0]);
	let REVxScale = scaleLinear().domain([-2, 2]).range([height, 0]);
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	$: {
		if (mounted) {
			updateAxes(min, max);
		}
	}
	function handleMousemove(x: number, y: number) {
		if (colorIndices.length == 0 || data2D.length == 0) return;
		var minDist = Infinity;
		var minIndex = 0;
		data2D.forEach((d, i) => {
			const dx = d[0] - x;
			const dy = d[1] - y;
			const dist = dx * dx + dy * dy;
			if (dist < minDist) {
				minDist = dist;
				minIndex = i;
			}
		});
		dispatch("hover", minIndex);
	}
	function updateAxes(min: Point2D, max: Point2D) {
		xScale = scaleLinear()
			.domain([min[0] - padding, max[0] + padding])
			.range([0, width]);
		yScale = scaleLinear()
			.domain([min[1] - padding, max[1] + padding])
			.range([height, 0]);
	}
</script>

<div>
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<svg
		{width}
		{height}
		bind:this={svg}
		on:mouseleave={() => dispatch("hover", -1)}
		on:mousemove={(e) => {
			const [x, y] = pointer(e, svg);
			REVxScale = scaleLinear()
				.range([min[0] - padding, max[0] + padding])
				.domain([0, width]);
			REVyScale = scaleLinear()
				.range([min[1] - padding, max[1] + padding])
				.domain([height, 0]);
			handleMousemove(REVxScale(x), REVyScale(y));
		}}
	>
		{#each data2D as point, index}
			<circle
				r={hoverPointIndex !== index ? radius : largerRadius}
				cx={xScale(point[0])}
				cy={yScale(point[1])}
				fill={hoverPointIndex !== index
					? colorIndices[index]
					: "rgba(0,0,0, 0.3)"}
				stroke="gray"
				stroke-width={0.1}
			/>
		{/each}
	</svg>
</div>
