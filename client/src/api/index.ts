import { MapRCR, RCR } from "@/models/RCR";
import { GlobalSuggestionType } from "@/models/Suggestions";
import { Document } from "@/models/Document";

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
	documentsTypes: { slug: string }[];
	regions: { slug: string }[];
	departments: { slug: string }[];
};

export const getClientConfig = async (): Promise<getClientConfigResponse> => {
	const response = await fetch(`${getApiUrl("/client-config")}`, { headers: getApiHeaders() });
	return response.json();
};

type getGlobalSuggestionsResponse = {
	title: string;
	subtitle: string;
	type: GlobalSuggestionType;
};

export const getGlobalSuggestions = async (value: string | undefined): Promise<getGlobalSuggestionsResponse[]> => {
	if (!value) return [];

	const params = new URLSearchParams();
	params.set("str", value);

	const response = await fetch(`${getApiUrl("/suggestions/search")}?${params}`, { headers: getApiHeaders() });
	return response.json();
};

type getFilterSuggestionsResponse = {
	id: string;
	name: string;
};

export const getFilterSuggestions = async (type: string, value: string | undefined): Promise<getFilterSuggestionsResponse[]> => {
	if (!value) return [];

	const params = new URLSearchParams();
	params.set("str", value);

	const response = await fetch(`${getApiUrl(`/${type}/search`)}?${params}`, { headers: getApiHeaders() });
	return response.json();
};

type getDetailsResponse = {
	id: string;
	name: string;
};

export const getDetails = async (type: string, id: string): Promise<getDetailsResponse> => {
	const response = await fetch(`${getApiUrl(`/${type}/${id}`)}`, { headers: getApiHeaders() });
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

export const getRCRList = async (searchParams: string): Promise<getRCRListResponse> => {
	const mapParams = new URLSearchParams();
	mapParams.set("map_format", "false");

	const response = await fetch(
		`${getApiUrl("/rcrs/search")}${searchParams ? `?${searchParams}&${mapParams}` : `?${mapParams}`}`,
		{
			headers: getApiHeaders(),
		}
	);
	return response.json();
};

export const getMapData = async (searchParams: string): Promise<MapRCR[]> => {
	const mapParams = new URLSearchParams();
	mapParams.set("map_format", "true");

	const response = await fetch(
		`${getApiUrl("/rcrs/search")}${searchParams ? `?${searchParams}&${mapParams}` : `?${mapParams}`}`,
		{
			headers: getApiHeaders(),
		}
	);
	return response.json();
};

export const getRCRExportCSV = async (searchParams: string): Promise<void> => {
	window.open(`${getApiUrl("/rcr/export")}?${searchParams}`);
};

type getRCRDetailsResponse = {
	website: string;
	phone: string;
	email: string;
	languages: string[];
	rcr: string;
	name: string;
	contact: {
		website: string | null;
		phone: string | null;
		email: string;
		address: {
			street: string;
			postalCode: string;
			city: string;
			country: string;
		};
	};
	location: {
		longitude: number;
		latitude: number;
	};
};

export const getRCRDetails = async (rcr: string | undefined): Promise<getRCRDetailsResponse> => {
	if (!rcr) throw new Error("RCR is required");

	const response = await fetch(`${getApiUrl(`/rcr/${rcr}/details`)}`, { headers: getApiHeaders() });
	return response.json();
};

type getRCRBooksSearchResponse = {
	pagination: {
		totalResults: number;
		currentPage: number;
		itemsPerPage: number;
		remainingItems: number;
	};
	items: Document[];
};

export const getRCRBooksSearch = async (rcr: string | undefined, searchParams: string): Promise<getRCRBooksSearchResponse> => {
	if (!rcr) throw new Error("RCR is required");

	const response = await fetch(`${getApiUrl(`/rcr/${rcr}/books/search`)}?${searchParams}`, {
		headers: getApiHeaders(),
	});
	return response.json();
};
