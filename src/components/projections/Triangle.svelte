<script lang="ts">
	export let point: Point2D;
	export let grad: Point2D;
	// export let width: number;
	export let norm = 1;
	export let xScale;
	export let yScale;
	export let color = "hsla(194, 74%, 73%, 1)";

	let point1: number, point2: number, grad1: number, grad2: number;
	$: {
		point1 = xScale(point[0]);
		point2 = yScale(point[1]);

		grad1 = xScale(-grad[0]) * norm;
		grad2 = yScale(-grad[1]) * norm;
	}
</script>

<line
	fill="blue"
	stroke={color}
	x1={point1}
	y1={point2}
	x2={grad1}
	y2={grad2}
	pathLength={0.15}
/>

<!-- <polygon
	fill="blue"
	stroke="blue"
	points="{point1}, {point2} {grad1}, {grad2}"
/> -->
