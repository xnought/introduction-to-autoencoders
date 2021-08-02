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
