import { RCR } from "@/models/RCR";
import { GlobalSuggestionType } from "@/models/Suggestions";

const API_HOST = "http://localhost:8082";

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
	const response = await fetch(`${API_HOST}/api/client-config`);
	return response.json();
};

type getGlobalSuggestionsResponse = {
	title: string;
	subtitle: string;
	type: GlobalSuggestionType;
};

export const getGlobalSuggestions = async (value: string | undefined): Promise<getGlobalSuggestionsResponse[]> => {
	if (!value) return [];

	const response = await fetch(`${API_HOST}/api/rcr/suggestion?str=${value}`);
	return response.json();
};

type getFilterSuggestionsResponse = {
	slug: string;
	label: string;
};

export const getFilterSuggestions = async (type: string, value: string | undefined): Promise<getFilterSuggestionsResponse[]> => {
	if (!value) return [];

	const response = await fetch(`${API_HOST}/api/${type}/${value}`);
	return response.json();
};

type getDetailsResponse = {
	slug: string;
	label: string;
};

export const getDetails = async (type: string, slug: string): Promise<getDetailsResponse> => {
	const response = await fetch(`${API_HOST}/api/${type}/details/${slug}`);
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
