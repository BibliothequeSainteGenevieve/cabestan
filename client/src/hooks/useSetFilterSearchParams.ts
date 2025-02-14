import { useNavigate, useSearchParams } from "react-router";

/**
 * @param newValues The new values corresponding to the filter
 * @param type The type or key of the filter
 */

export function useSetFilterSearchParams() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	function setFilterSearchParams(newValues: string[], type: string) {
		if (newValues.length > 0 && newValues[0] !== undefined) {
			searchParams.set(type, newValues.join(","));
		} else {
			searchParams.delete(type);
		}

		navigate({
			pathname: "/search",
			search: searchParams.toString(),
		});
	}

	return setFilterSearchParams;
}
