/// <reference types="svelte" />

// data types
declare type Point3D = [number, number, number];
declare type Point2D = [number, number];
declare type dataType = Point3D[];
declare type ndArray =
	| number[]
	| number[][]
	| number[][][]
	| number[][][][]
	| number[][][][][]
	| number[][][][][][];

// options for activation in Autoencoder
declare type ActivationIdentifier = "relu" | "sigmoid" | "tanh";

// Refers to the Mnist json data
declare interface IData {
	data: number[];
	label: number;
}

// the format the 2d coordinate is taken
interface IScatterFormat {
	x: number;
	y: number;
	label: number;
}

declare type color = string;
