import { type ApexOptions } from 'apexcharts';

export { default as ColumnChart } from './ColumnChart';
export { default as DonutChart } from './DonutChart';
export { default as LineChart } from './LineChart';

export type DataChartType = {
	title?: string;
	xAxis: string[];
	/**
	 * Dùng cho trường hợp nhiều column
	 */
	yAxis: number[][];
	yLabel: string[];
	height?: number;
	width?: number;
	type?: 'bar' | 'area';
	colors?: string[];
	formatY?: (val: number) => string;
	showTotal?: boolean;

	otherOptions?: ApexOptions;
};
