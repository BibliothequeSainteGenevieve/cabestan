import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

export default function ResetFiltersButton() {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="sm"
						className="bg-foreground text-white cursor-pointer"
						onClick={() => {
							navigate(
								{
									pathname: location.pathname,
								},
								{ replace: true }
							);
							navigate(0);
						}}>
						<X className="w-4 h-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent className="text-white">
					<p>{t("SearchBar.resetFilters")}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
