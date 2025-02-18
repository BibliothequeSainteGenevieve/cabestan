import { RCR } from "@/models/RCR";
import { GlobalSuggestionType } from "@/models/Suggestions";

const API_HOST = import.meta.env.VITE_API_HOST ?? "localhost";
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL ?? "http";
const API_PATH = import.meta.env.VITE_API_PATH ?? "/api/rest";

const getApiUrl = (path: string) => `${API_PROTOCOL}://${API_HOST}${API_PATH}${path}`;

const getApiHeaders = () => {
	const headers = new Headers();
	headers.set("Authorization", "Bearer a");
	return headers;
};

type getClientConfigResponse = {
	languages: { slug: string }[];
	establishementsTypes: { slug: string }[];
	documentTypes: { slug: string }[];
	booksTypes: { slug: string }[];
	regions: { slug: string }[];
	departments: { slug: string }[];
	cities: { slug: string }[];
};

export const getClientConfig = async (): Promise<getClientConfigResponse> => {
	const response = await fetch(`${getApiUrl("/client-config")}`,{headers:getApiHeaders()});
	return response.json();
};

type getGlobalSuggestionsResponse = {
	title: string;
	subtitle: string;
	type: GlobalSuggestionType;
};

export const getGlobalSuggestions = async (value: string | undefined): Promise<getGlobalSuggestionsResponse[]> => {
	if (!value) return [];

	const response = await fetch(`${getApiUrl("/suggestions/search")}?str=${value}`,{headers:getApiHeaders()});
	return response.json();
};

type getFilterSuggestionsResponse = {
	slug: string;
	label: string;
};

export const getFilterSuggestions = async (type: string, value: string | undefined): Promise<getFilterSuggestionsResponse[]> => {
	if (!value) return [];

	const response = await fetch(`${getApiUrl(`/api/${type}/${value}`)}`,{headers:getApiHeaders()});
	return response.json();
};

type getDetailsResponse = {
	slug: string;
	label: string;
};

export const getDetails = async (type: string, slug: string): Promise<getDetailsResponse> => {
	const response = await fetch(`${getApiUrl(`/api/${type}/details/${slug}`)}`,{headers:getApiHeaders()});
	return response.json();
};

type getRCRListResponse = {
	pagination: {
		totalResults: number;
		currentPage: number;
		itemsPerPage: number;
	};
	items: RCR[];
};

export const getRCRList = async (queryParams: string): Promise<getRCRListResponse> => {
	const response = await fetch(`${API_HOST}/api/rcr/search${queryParams ? `?${queryParams}` : ""}`);
	return response.json();
};
