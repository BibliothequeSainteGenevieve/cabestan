import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { useSearchParams } from "react-router";

type PaginationProps = {
	totalItems: number;
};

const itemsPerPageOptions = [10, 20, 50];

export default function ListPagination({ totalItems }: PaginationProps) {
	const [searchParams] = useSearchParams();
	const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
	const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get("itemsPerPage")) || 20);
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();

	return (
		<div className="flex items-center justify-center gap-3 text-sm">
			<div className="flex items-center gap-2">
				{t("RCRList.pagination.resultsPerPage")} :
				<Select
					value={itemsPerPage.toString()}
					onValueChange={(value) => {
						setItemsPerPage(Number(value));
						setFilterSearchParams([value], "itemsPerPage");
						setCurrentPage(1);
					}}>
					<SelectTrigger className="w-20 bg-white">
						<SelectValue placeholder="Page" />
					</SelectTrigger>
					<SelectContent className="bg-white">
						<SelectGroup>
							{itemsPerPageOptions.map((option) => (
								<SelectItem key={option} value={option.toString()}>
									{option}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-2">
				{t("RCRList.pagination.page")} :
				<Select
					value={currentPage.toString()}
					onValueChange={(value) => {
						setCurrentPage(Number(value));
						setFilterSearchParams([value], "page");
					}}>
					<SelectTrigger className="w-20 bg-white">
						<SelectValue placeholder="Page" />
					</SelectTrigger>
					<SelectContent className="bg-white">
						<SelectGroup>
							{Array.from({ length: totalPages }).map((_, index) => (
								<SelectItem key={index} value={(index + 1).toString()}>
									{index + 1}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center">
				<div>
					<Button
						variant="ghost"
						disabled={currentPage === 1}
						onClick={() => {
							if (currentPage > 1) {
								setCurrentPage(currentPage - 1);
								setFilterSearchParams([(currentPage - 1).toString()], "page");
							}
						}}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				</div>
				<div>
					<Button
						variant="ghost"
						disabled={currentPage === totalPages}
						onClick={() => {
							if (currentPage < totalPages) {
								setCurrentPage(currentPage + 1);
								setFilterSearchParams([(currentPage + 1).toString()], "page");
							}
						}}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
