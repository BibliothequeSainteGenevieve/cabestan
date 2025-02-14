import { getPublisherDetails } from "@/api";
import { useQuery } from "@tanstack/react-query";

type PublishersValueProps = {
	slug: string;
	isLast: boolean;
};

// Separate component to use tanstack caching
export default function PublishersValue({ slug, isLast }: PublishersValueProps) {
	const { data: details } = useQuery({
		queryKey: [`${slug}-details`],
		queryFn: () => getPublisherDetails(slug),
	});

	return (
		<>
			{details?.label}
			{isLast ? "" : ", "}
		</>
	);
}
