import { getDetails } from "@/api";
import { useQuery } from "@tanstack/react-query";

type ValueLabelProps = {
	slug: string;
	isLast: boolean;
	type: string;
};

// Separate component to use tanstack caching
export default function ValueLabel({ type, slug, isLast }: ValueLabelProps) {
	const { data: details } = useQuery({
		queryKey: [type, slug],
		queryFn: () => getDetails(type, slug),
	});

	return (
		<>
			{details?.name}
			{isLast ? "" : ", "}
		</>
	);
}
