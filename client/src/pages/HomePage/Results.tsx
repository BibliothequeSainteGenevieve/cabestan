import ListPagination from "@/components/Pagination";
import RCRList from "@/components/RCRList";
import ResultsCount from "@/components/ResultsCount";
import Map from "@/components/Map";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getRCRList } from "@/api";
import { useSearchParams } from "react-router";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import BarsChart from "@/components/BarsChart";

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
					<div className="flex flex-col md:flex-row">
						<div className="md:w-[25rem] xl:w-[38rem] min-h-[calc(100vh-23rem)]">
							{rcrList?.items.length === 0 && <p className="text-gray-500 w-full">{t("RCRList.noResults")}</p>}
							{rcrList?.items.length > 0 && (
								<>
									<div className="pr-4  md:h-[calc(100vh-26rem)] lg:h-[calc(100vh-23rem)] overflow-y-auto">
										<RCRList items={rcrList?.items || []} />
									</div>

									<div className="mt-4">
										<ListPagination totalItems={rcrList?.pagination.totalResults || 0} />
									</div>
								</>
							)}
						</div>
						<div className="hidden md:flex flex-col justify-between flex-1 pl-4">
							<Map />
							<div>{rcrList?.items.length > 0 && <BarsChart data={rcrList?.items.slice(0, 10) || []} />}</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
