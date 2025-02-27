import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RCR } from "@/models/RCR";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Minus, Plus, Printer } from "lucide-react";
import "./BarsChart.css";

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#d37475",
	},
} satisfies ChartConfig;

interface BarsChartProps {
	data: RCR[];
}

export default function BarsChart({ data }: BarsChartProps) {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const handlePrint = () => {
		const chartElement = document.getElementById("bars-chart");
		const mapElement = document.getElementById("map");
		const rcrListElement = document.getElementById("rcr-list");
		const searchbarContainerElement = document.getElementById("searchbar-container");

		if (chartElement) {
			chartElement.style.width = "21cm";
			chartElement.style.position = "absolute";
			chartElement.style.top = "0";
			chartElement.style.left = "0";
			chartElement.style.zIndex = "1000";
			if (mapElement) {
				mapElement.style.display = "none";
			}
			if (rcrListElement) {
				rcrListElement.style.display = "none";
			}
			if (searchbarContainerElement) {
				searchbarContainerElement.style.display = "none";
			}
			window.print();
			chartElement.style.width = "100%";
			chartElement.style.position = "relative";
			chartElement.style.top = "0";
			chartElement.style.left = "0";
			chartElement.style.zIndex = "0";
			if (mapElement) {
				mapElement.style.display = "block";
			}
			if (rcrListElement) {
				rcrListElement.style.display = "block";
			}
			if (searchbarContainerElement) {
				searchbarContainerElement.style.display = "block";
			}
		}
	};

	return (
		<Card id="bars-chart" className="bg-white rounded-sm shadow-sm mt-2 py-1 relative">
			<CardHeader onClick={() => setIsOpen(!isOpen)} className="cursor-pointer py-1 px-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="uppercase">{t("BarsChart.title")}</CardTitle>
					</div>
					{isOpen ? <Minus className="print:hidden" /> : <Plus className="print:hidden" />}
				</div>
			</CardHeader>

			{isOpen && (
				<CardContent className="px-4">
					<button
						onClick={handlePrint}
						className="print:hidden bg-white shadow absolute top-10 right-4 p-2 z-10 cursor-pointer">
						<Printer size={16} />
					</button>
					<ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] w-full">
						<BarChart
							accessibilityLayer
							height={200}
							data={data}
							margin={{
								top: 20,
							}}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="name"
								tickLine={true}
								tickMargin={10}
								axisLine={false}
								tickFormatter={(value) => value.slice(0, 8)}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										hideIndicator
										formatter={(value) => [
											`${t("BarsChart.tooltip.numberOfDocuments")} : `,
											value.toLocaleString(),
										]}
									/>
								}
							/>
							<Bar dataKey="numberOfDocuments" fill="var(--color-desktop)" radius={8}>
								<LabelList
									formatter={(value: number) => value.toLocaleString()}
									position="top"
									offset={12}
									className="fill-foreground"
									fontSize={12}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				</CardContent>
			)}
		</Card>
	);
}
