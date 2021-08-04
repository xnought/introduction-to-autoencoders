import {
	scaleLinear,
	axisBottom,
	axisRight,
	ScaleLinear,
	Axis,
	select,
	NumberValue,
} from "d3";

interface IScales {
	width: number;
	height: number;
	xDomain: [number, number];
	yDomain: [number, number];
	padding?: number;
}
/**
 * This creates the scales for the scatterplot
 *  @param \{ `width`: number, `height`: number, `start`: number, `stop`: number, `padding?`: number\}
 *  @returns \{xScale, yScale\}
 */
export const createScales = ({
	width,
	height,
	xDomain,
	yDomain,
	padding = 0,
}: IScales) => {
	const xScale = scaleLinear()
			.domain(xDomain)
			.range([0, width - 2 * padding]),
		yScale = scaleLinear()
			.domain(yDomain)
			.range([height - 2 * padding, 0]);
	return { xScale, yScale };
};

/**
 * This creates scales reversed for the scatterplot to translate out
 *  @param \{ `width`: number, `height`: number, `start`: number, `stop`: number, `padding?`: number\}
 *  @returns \{xScale, yScale\}
 */
export const reverseScales = ({
	width,
	height,
	xDomain,
	yDomain,
	padding = 0,
}: IScales) => {
	const xScale = scaleLinear()
			.domain([0, width - 2 * padding])
			.range(xDomain),
		yScale = scaleLinear()
			.domain([height - 2 * padding, 0])
			.range(yDomain);
	return { revxScale: xScale, revyScale: yScale };
};

export type linear = ScaleLinear<number, number, never>;
/**
 * This function creates Axes and returns them in an object
 *
 * @param xScale
 * @param yScale
 * @returns \{`xAxis`, `yAxis`\}
 */
export const createAxes = (xScale: linear, yScale: linear) => {
	const xAxis = axisBottom(xScale),
		yAxis = axisRight(yScale);
	return { xAxis, yAxis };
};

/**
 * This function adds the axis to selected svg element
 *
 * @param node this is the svg element in the dom
 * @param transform
 * @param axis the axis wanting to add
 */
export const addAxisToDOM = (
	node: SVGElement,
	transform: string,
	axis: Axis<NumberValue>
) => {
	select(node).append("g").attr("transform", transform).call(axis);
};
