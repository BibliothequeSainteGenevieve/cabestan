import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { useSearchParams } from "react-router";
import { Input } from "./ui/input";

type PaginationProps = {
	totalItems: number;
};

const itemsPerPageOptions = [10, 20, 50];

export default function ListPagination({ totalItems }: PaginationProps) {
	const [searchParams] = useSearchParams();
	const [inputPage, setInputPage] = useState(Number(searchParams.get("page")) || 1);
	const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
	const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get("itemsPerPage")) || 20);
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();

	if (totalItems === 0) return null;

	return (
		<div className="flex flex-wrap items-center justify-center gap-3 text-sm">
			<div className="hidden @xl:flex items-center gap-2">
				<p className="text-xs w-15 text-grey">{t("Pagination.resultsPerPage")} :</p>
				<Select
					value={itemsPerPage.toString()}
					onValueChange={(value) => {
						setItemsPerPage(Number(value));
						setFilterSearchParams([value], "itemsPerPage");
						setCurrentPage(1);
					}}>
					<SelectTrigger className="w-16 bg-white">
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
			<div className="flex flex-wrap justify-center items-center @xl:border-l-1 border-border gap-y-2">
				<div className="flex items-center mx-1">
					<Button
						size="xs"
						variant="ghost"
						disabled={currentPage === 1}
						onClick={() => {
							setFilterSearchParams(["1"], "page");
						}}>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						size="xs"
						className="p-2 sm:p-2"
						variant="ghost"
						disabled={currentPage === 1}
						onClick={() => {
							if (currentPage > 1) {
								setFilterSearchParams([(currentPage - 1).toString()], "page");
							}
						}}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex items-center mx-1">
						{currentPage - 2 > 0 && (
							<Button
								variant="ghost"
								size="xs"
								onClick={() => {
									setFilterSearchParams([(currentPage - 2).toString()], "page");
								}}>
								<span className="text-sm">{currentPage - 2}</span>
							</Button>
						)}
						{currentPage - 1 > 0 && (
							<Button
								variant="ghost"
								size="xs"
								onClick={() => {
									setFilterSearchParams([(currentPage - 1).toString()], "page");
								}}>
								<span className="text-sm">{currentPage - 1}</span>
							</Button>
						)}
						<Button variant="default" size="xs" className="rounded-full bg-lightRed">
							<span className="text-sm font-bold">{currentPage}</span>
						</Button>
						{currentPage + 1 < totalPages + 1 && (
							<Button
								variant="ghost"
								size="xs"
								onClick={() => {
									setFilterSearchParams([(currentPage + 1).toString()], "page");
								}}>
								<span className="text-sm">{currentPage + 1}</span>
							</Button>
						)}
						{currentPage + 2 < totalPages + 1 && (
							<Button
								variant="ghost"
								size="xs"
								onClick={() => {
									setFilterSearchParams([(currentPage + 2).toString()], "page");
								}}>
								<span className="text-sm">{currentPage + 2}</span>
							</Button>
						)}
					</div>
					<Button
						size="xs"
						variant="ghost"
						disabled={currentPage === totalPages}
						onClick={() => {
							if (currentPage < totalPages) {
								setFilterSearchParams([(currentPage + 1).toString()], "page");
							}
						}}>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						size="xs"
						variant="ghost"
						disabled={currentPage === totalPages}
						onClick={() => {
							setFilterSearchParams([totalPages.toString()], "page");
						}}>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
				<form
					className="flex items-center gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						let value = inputPage;
						if (value > totalPages) {
							value = totalPages;
						}
						if (value < 1) {
							value = 1;
						}
						setFilterSearchParams([value.toString()], "page");
					}}>
					<Input className="w-13 bg-white" value={inputPage} onChange={(e) => setInputPage(Number(e.target.value))} />
					<p className="text-xs w-15 text-grey">{t("Pagination.of", { totalPages })}</p>
				</form>
			</div>
		</div>
	);
}
