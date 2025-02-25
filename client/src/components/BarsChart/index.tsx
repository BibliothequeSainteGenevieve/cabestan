import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RCR } from "@/models/RCR";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
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

	return (
		<Card className="bg-white rounded-sm shadow-sm mt-2 py-1">
			<CardHeader onClick={() => setIsOpen(!isOpen)} className="cursor-pointer py-1 px-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="uppercase">{t("BarsChart.title")}</CardTitle>
					</div>
					{isOpen ? <Minus /> : <Plus />}
				</div>
			</CardHeader>

			{isOpen && (
				<CardContent className="px-4">
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
