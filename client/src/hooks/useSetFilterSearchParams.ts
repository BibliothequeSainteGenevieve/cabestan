import { useLocation, useNavigate, useSearchParams } from "react-router";

/**
 * @param newValues The new values corresponding to the filter
 * @param type The type or key of the filter
 */

export function useSetFilterSearchParams() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const location = useLocation();

	function setFilterSearchParams(newValues: string[], type: string) {
		if (newValues.length > 0 && newValues[0] !== undefined) {
			searchParams.set(type, newValues.join(","));
		} else {
			searchParams.delete(type);
		}

		if (type !== "page") {
			searchParams.set("page", "1");
		}

		navigate({
			pathname: location.pathname,
			search: searchParams.toString(),
		});
	}

	return setFilterSearchParams;
}
