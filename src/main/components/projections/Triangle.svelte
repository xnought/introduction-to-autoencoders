<script lang="ts">
	export let point: Point2D;
	export let grad: Point2D;
	// export let width: number;
	export let xScale;
	export let yScale;
	export let stroke = "";
	export let color = "hsla(194, 74%, 73%, 1)";
	function toScale(point: Point2D): Point2D {
		return [xScale(point[0]), yScale(point[1])];
	}
	function getDegreeFromCartesian([x, y]: Point2D): number {
		return Math.atan(y / x);
	}
	function toCartesian([r, theta]: Point2D): Point2D {
		const x = r * Math.cos(theta);
		const y = r * Math.sin(theta);
		return [x, y];
	}
	function translate(
		[x, y]: Point2D,
		[translateX, translateY]: Point2D
	): Point2D {
		return [x + translateX, y + translateY];
	}
	const deg90toRads = Math.PI / 2;
	function polarConversion(point: Point2D, grad: Point2D, radius: number) {
		const translateTo: Point2D = [-point[0], -point[1]]; // copy by value with neg
		const translateBack: Point2D = [point[0], point[1]]; // copy by value

		// center at origin
		// const pointTranslated = translate(point, translateTo);
		const gradTranslated = translate(grad, translateTo);

		// first need the theta from gradTranslated
		const theta = getDegreeFromCartesian(gradTranslated);

		const pointB = toCartesian([radius, theta - deg90toRads]);
		const pointC = toCartesian([radius, theta + deg90toRads]);

		return [
			translate(pointB, translateBack),
			translate(pointC, translateBack),
		];
	}
	function computeTriangle(point: Point2D, grad: Point2D) {
		const pointA = grad;
		const [pointB, pointC] = polarConversion(point, grad, 1.75);

		const polygon = `${pointA[0]}, ${pointA[1]} ${pointB[0]}, ${pointB[1]} ${pointC[0]}, ${pointC[1]}`;
		return polygon;
	}
	function same(arr1: Point2D, arr2: Point2D) {
		return arr1[0] == arr2[0] && arr1[1] == arr2[1];
	}
	let points = "";
	$: {
		const pointToScale: Point2D = toScale(point);
		const gradToScale: Point2D = toScale(grad);
		points = same(pointToScale, gradToScale)
			? ""
			: computeTriangle(pointToScale, gradToScale);
	}
</script>

<polygon fill={color} {points} {stroke} stroke-width={0.2} />
