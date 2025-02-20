import { ListPagination } from "@/components/Pagination";
import RCRList from "@/components/RCRList";
import ResultsCount from "@/components/ResultsCount";
import SearchBar from "@/components/SearchBar/SearchBar";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getRCRList } from "@/api";
import { useSearchParams } from "react-router";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Home() {
	const { t } = useTranslation();

	const [searchParams] = useSearchParams();
	searchParams.set("map_format", "false");

	const {
		data: rcrList,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["rcr-list", searchParams.toString()],
		queryFn: () => getRCRList(searchParams.toString()),
	});

	return (
		<div className="py-4">
			<h1 className="pb-2">{t("HomePage.title")}</h1>
			<SearchBar />
			{isLoading && (
				<div className="flex items-center justify-center h-[50vh]">
					<LoadingSpinner />
				</div>
			)}
			{error && (
				<div className="flex items-center justify-center h-[50vh] text-center text-red-500">{t("RCRList.error")}</div>
			)}
			{rcrList && (
				<div>
					<div className="mt-8">
						<ResultsCount totalItems={rcrList?.pagination.totalResults || 0} />
					</div>
					{rcrList?.items.length > 0 && (
						<>
							<div className="md:max-w-md lg:max-w-lg mt-4 pr-4 max-h-[calc(100vh-26rem)] overflow-y-auto">
								<RCRList items={rcrList?.items || []} />
							</div>

							<div className="md:max-w-md lg:max-w-lg mt-4">
								<ListPagination totalItems={rcrList?.pagination.totalResults || 0} />
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
