<script lang="ts">
	export let point: Point2D;
	export let grad: Point2D;
	// export let width: number;
	export let norm = 1;
	export let xScale;
	export let yScale;
	export let color = "hsla(194, 74%, 73%, 1)";
	function toScale(point: Point2D): Point2D {
		return [xScale(point[0]), yScale(point[1])];
	}
	function shitversionofdist(point1: Point2D, point2: Point2D) {
		return (point2[0] - point1[0]) ** 2 + (point2[1] - point1[1]) ** 2;
	}
	function equidistant(point: Point2D, grad: Point2D, radius: number) {
		let additional: Point2D[] = [
			[point[0] + radius, point[1] + radius],
			[point[0] - radius, point[1] - radius],
			[point[0] + radius, point[1] - radius],
			[point[0] - radius, point[1] + radius],
		];
		let distances = additional.map((point, index) => ({
			index,
			distance: shitversionofdist(point, grad),
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
	let points = "";

	$: {
		const pointToScale: Point2D = toScale(point);
		const gradToScale: Point2D = toScale(grad);
		points =
			toPolyString(equidistant(pointToScale, gradToScale, 1.5)) +
			gradToScale.toString();
	}
</script>

<polygon fill={color} {points} />
