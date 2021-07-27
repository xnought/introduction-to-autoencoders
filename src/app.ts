interface IJSON {
	data: dataType;
}
export async function getData(fileName: string): Promise<dataType> {
	const data = await fetch(`data/${fileName}`);
	const json: IJSON = await data.json();
	return json.data;
}
