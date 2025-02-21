import { getDetails } from "@/api";
import { useQuery } from "@tanstack/react-query";

type ValueLabelProps = {
	slug: string;
	isLast: boolean;
	type: string;
};

function singularize(word: string) {
	const endings = {
		ves: "fe",
		ies: "y",
		i: "us",
		zes: "ze",
		ses: "s",
		es: "e",
		s: "",
	};
	return word.replace(new RegExp(`(${Object.keys(endings).join("|")})$`), (r) => endings[r as keyof typeof endings]);
}

// Separate component to use tanstack caching
export default function ValueLabel({ type, slug, isLast }: ValueLabelProps) {
	const { data: details } = useQuery({
		queryKey: [type, slug],
		queryFn: () => getDetails(singularize(type), slug),
	});

	return (
		<>
			{details?.name}
			{isLast ? "" : ", "}
		</>
	);
}
