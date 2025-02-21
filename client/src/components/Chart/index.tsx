import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RCR } from "@/models/RCR";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#027D83",
	},
} satisfies ChartConfig;

interface BarsChartProps {
	data: RCR[];
}

export default function BarsChart({ data }: BarsChartProps) {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Card className="bg-white rounded-sm shadow-sm mt-2">
			<CardHeader onClick={() => setIsOpen(!isOpen)} className="cursor-pointer p-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="uppercase">{t("BarsChart.title")}</CardTitle>
					</div>
					{isOpen ? <Minus /> : <Plus />}
				</div>
			</CardHeader>
			{isOpen && (
				<CardContent>
					<ChartContainer config={chartConfig}>
						<BarChart
							accessibilityLayer
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
								tickFormatter={(value) => value.slice(0, 6)}
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
