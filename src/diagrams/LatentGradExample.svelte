<script lang="ts">
	import { pointer } from "d3";
	export let height = 300;
	export let width = 300;

	let initGrad = [250, 250];
	let point: Point2D = [150, 150];
	let grad: Point2D = initGrad;
	function dist(point1: Point2D, point2: Point2D) {
		return Math.sqrt(
			(point2[0] - point1[0]) ** 2 + (point2[1] - point1[1]) ** 2
		);
	}
	function equidistant(point: Point2D, radius: number) {
		let additional: Point2D[] = [
			[point[0] + radius, point[1] + radius],
			[point[0] - radius, point[1] - radius],
			[point[0] + radius, point[1] - radius],
			[point[0] - radius, point[1] + radius],
		];
		let distances = additional.map((point, index) => ({
			index,
			distance: dist(point, grad),
		}));
		let sortedDistances = distances.sort((a, b) => a.distance - b.distance);
		if (point[0] == grad[0] || point[1] == grad[1]) {
			return [
				additional[sortedDistances[0].index],
				additional[sortedDistances[1].index],
			];
		}
		return [
			additional[sortedDistances[1].index],
			additional[sortedDistances[2].index],
		];
	}
	function toPolyString(points: number[][]) {
		let pointsStr = "";
		for (const point of points) {
			pointsStr += point.toString() + " ";
		}
		return pointsStr;
	}
	let equi = equidistant(point, 10);
	let svg: SVGElement;
	let stringqui = toPolyString(equi) + grad.toString();
	$: {
		equi = equidistant(point, 10);
		stringqui = toPolyString(equi) + grad.toString();
	}
</script>

<div class="container">
	<div>
		<svg
			{width}
			{height}
			bind:this={svg}
			on:mousemove={(e) => {
				const [x, y] = pointer(e, svg);
				grad = [x, y];
			}}
		>
			<polygon points={stringqui} fill="#B2304D" />
			<circle cx={point[0]} cy={point[1]} fill="#9F0142" r={20} />
		</svg>
	</div>
</div>
<figcaption>
	<a class="figure-number-text" href="#latentGradDiagram">3</a>: Loss would
	lower if the <span style="color: #9F0142;">point</span>
	moved in the direction of the <span style="color: #B2304D;">trail</span>
	<img src="trail.svg" alt="trail" />
	<code>({grad[0].toFixed(0)}, {grad[1].toFixed(0)})</code>
</figcaption>

<style lang="scss">
	svg {
		border: 3px solid #9f014322;
		border-radius: 3px;
	}
	polygon {
		fill-rule: nonzero;
	}
	.container {
		display: flex;
		justify-content: center;
		margin-top: 15px;
	}
	/*  put stuff here */
</style>
