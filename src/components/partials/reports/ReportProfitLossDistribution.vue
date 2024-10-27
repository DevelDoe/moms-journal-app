<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

export default {
	props: {
		trades: {
			type: Array,
			required: true,
		},
		granularity: {
			type: String,
			default: "daily", // Options: 'hourly', 'daily', 'weekly', 'monthly', 'yearly'
		},
	},
	components: {
		VChart,
	},
	data() {
		return {
			isTooltipVisible: false,
		};
	},
	methods: {
		showTooltip() {
			this.isTooltipVisible = true;
		},
		hideTooltip() {
			this.isTooltipVisible = false;
		},
		formatDate(date) {
			const d = new Date(date);
			switch (this.granularity) {
				case "hourly":
					return `${d.toLocaleDateString()} ${d.getHours()}:00`;
				case "daily":
					return d.toLocaleDateString(); // Date only, no time
				case "weekly":
					const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay()));
					return `Week of ${startOfWeek.toLocaleDateString()}`;
				case "monthly":
					return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
				case "yearly":
					return d.getFullYear().toString();
				default:
					return d.toLocaleDateString();
			}
		},
	},
	computed: {
		profitLossDistribution() {
			if (this.trades.length === 0) {
				return { labels: [], data: [] };
			}

			// Set up bucket ranges
			const bucketRanges = [
				{ label: "Below -$987", min: -Infinity, max: -987 },
				// ... (remaining buckets)
				{ label: "Above $987", min: 987, max: Infinity },
			];

			// Initialize an object to store grouped profit/loss by granularity
			const groupedData = {};

			// Group trades by granularity
			this.trades.forEach((trade) => {
				const dateKey = this.formatDate(trade.date);
				if (!groupedData[dateKey]) {
					groupedData[dateKey] = [];
				}
				groupedData[dateKey].push(trade);
			});

			const labels = [];
			const data = [];

			// Calculate profit/loss for each bucket within each time group
			Object.keys(groupedData).forEach((dateKey) => {
				const tradesInGroup = groupedData[dateKey];
				const profitLossCount = bucketRanges.reduce((acc, range) => {
					acc[range.label] = 0;
					return acc;
				}, {});

				tradesInGroup.forEach((trade) => {
					const profitLoss = trade.profitLoss;
					const bucket = bucketRanges.find((range) => profitLoss >= range.min && profitLoss < range.max);
					if (bucket) {
						profitLossCount[bucket.label]++;
					}
				});

				// Push labels and values for the chart
				labels.push(dateKey);
				data.push(Object.values(profitLossCount).reduce((a, b) => a + b, 0));
			});

			return { labels, data };
		},
		chartOptions() {
			return {
				title: {
					text: "Profit/Loss Distribution",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: { type: "shadow" },
					formatter: (params) => `${params[0].name}: ${Math.abs(params[0].value).toFixed(2)}`,
				},
				grid: { top: 80, bottom: 30 },
				xAxis: {
					type: "value",
					position: "top",
					splitLine: { lineStyle: { type: "dashed" } },
					name: "Number of Trades",
				},
				yAxis: {
					type: "category",
					data: this.profitLossDistribution.labels,
					name: "Profit/Loss Range",
				},
				series: [
					{
						name: "Number of Trades",
						type: "bar",
						data: this.profitLossDistribution.data,
						itemStyle: {
							color: (params) => (this.profitLossDistribution.labels[params.dataIndex].includes("-") ? "#e57373" : "#91cc75"),
						},
					},
				],
			};
		},
	},
};
</script>
