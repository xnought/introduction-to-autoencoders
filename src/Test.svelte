<script lang="ts">
	export let height = 400;
	export let width = 400;

	let point: Point2D = [200, 200];
	let grad: Point2D = [300, 200];
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
	let stringqui = toPolyString(equi) + grad.toString();
	$: {
		equi = equidistant(point, 10);
		stringqui = toPolyString(equi) + grad.toString();
	}
</script>

<div>
	<svg
		{width}
		{height}
		on:mousemove={(e) => {
			grad = [e.layerX, e.layerY];
		}}
	>
		<!--  -->
		<circle cx={point[0]} cy={point[1]} fill="red" r={25} />
		<polygon points={stringqui} fill="blue" />
	</svg>
</div>

<style lang="scss">
	svg {
		border: 1px solid black;
	}
	polygon {
		fill-rule: nonzero;
	}
	/*  put stuff here */
</style>
