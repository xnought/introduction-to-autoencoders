<script lang="ts">
	import { pointer } from "d3";

	export let height = 300;
	export let width = 300;

	let initGrad: Point2D = [250, 250];
	let point: Point2D = [150, 150];
	let grad: Point2D = initGrad;

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
		const [pointB, pointC] = polarConversion(point, grad, 12);

		const polygon = `${pointA[0]}, ${pointA[1]} ${pointB[0]}, ${pointB[1]} ${pointC[0]}, ${pointC[1]}`;
		return polygon;
	}
	let svg: SVGElement;
	$: polygonPoints = computeTriangle(point, grad);

	const primary = "#9F0142";
	const secondary = "#B2304D";
	const radius = 20;
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
			<polygon points={polygonPoints} fill={secondary} />
			<circle cx={point[0]} cy={point[1]} fill={primary} r={radius} />
		</svg>
	</div>
</div>
<figcaption>
	<a class="figure-number-text" href="#latentGradDiagram">3</a>: Loss would
	lower if the <span style="color: {primary};">point</span>
	moved in the direction of the <span style="color: {secondary};">trail</span>
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
</style>
