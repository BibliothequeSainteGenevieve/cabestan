import ListPagination from "@/components/Pagination";
import RCRList from "@/components/RCRList";
import ResultsCount from "@/components/ResultsCount";
import SearchBar from "@/components/SearchBar";
import Map from "@/components/Map";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getRCRList } from "@/api";
import { useSearchParams } from "react-router";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import BarsChart from "@/components/Chart";

export default function Home() {
	const { t } = useTranslation();

	const [searchParams] = useSearchParams();
	const {
		data: rcrList,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["rcr-list", searchParams.toString()],
		queryFn: () => getRCRList(searchParams.toString()),
	});

	return (
		<div className="py-4 flex flex-col">
			<div>
				<h1 className="pb-2">{t("HomePage.title")}</h1>
				<SearchBar />
			</div>
			<section>
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
						<div className="mt-6 mb-4">
							<ResultsCount totalItems={rcrList?.pagination.totalResults || 0} />
						</div>
						{rcrList?.items.length > 0 && (
							<div className="flex flex-col md:flex-row">
								<div>
									<div className="md:max-w-md lg:max-w-xl pr-4 max-h-[calc(100vh-23rem)] overflow-y-auto">
										<RCRList items={rcrList?.items || []} />
									</div>

									<div className="md:max-w-md lg:max-w-lg mt-4">
										<ListPagination totalItems={rcrList?.pagination.totalResults || 0} />
									</div>
								</div>
								<div className="flex-1 pl-4 flex flex-col justify-between">
									<Map />
									<div>
										{rcrList?.items.length > 0 && <BarsChart data={rcrList?.items.slice(0, 10) || []} />}
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</section>
		</div>
	);
}
