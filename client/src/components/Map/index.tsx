import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import { useEffect, useMemo, useState } from "react";
import MapContent from "./MapContent";
import "./Map.css";
import L, { LatLngBoundsExpression, LatLngBoundsLiteral } from "leaflet";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getMapData } from "@/api";
import { LoadingSpinner } from "../LoadingSpinner";
import { useTranslation } from "react-i18next";

export default function Map() {
	const { t } = useTranslation();
	const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>();

	const [searchParams] = useSearchParams();
	searchParams.delete("page");
	searchParams.delete("itemsPerPage");

	const defaultBounds = useMemo<LatLngBoundsLiteral>(
		() => [
			[51.034222, -5.199594],
			[41.486518, 9.454489],
		],
		[]
	);

	const {
		data: mapData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["map-data", searchParams.toString()],
		queryFn: () => getMapData(searchParams.toString()),
	});

	useEffect(() => {
		if (mapData && mapData?.length > 0) {
			const markers = mapData
				.slice(0, 100)
				.map((establishment) => L.marker([establishment.location.latitude, establishment.location.longitude]));
			const group = L.featureGroup(markers);
			const bounds = group.getBounds();
			if (bounds.isValid()) {
				setBounds(bounds);
			} else {
				setBounds(defaultBounds);
			}
		} else if (mapData) {
			setBounds(defaultBounds);
		}
	}, [mapData, defaultBounds]);

	return (
		<div id="map" className="relative z-0 h-full flex-1">
			{isLoading && (
				<div className="flex justify-center items-center h-full">
					<LoadingSpinner />
				</div>
			)}
			{error && (
				<div className="flex justify-center items-center text-red-500">
					<div>{t("Map.error")}</div>
				</div>
			)}
			{mapData && bounds && (
				<MapContainer
					center={[48.8566, 2.3522]}
					minZoom={2}
					bounds={bounds}
					boundsOptions={{ padding: [50, 50] }}
					scrollWheelZoom={true}
					attributionControl={false}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
						url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
						subdomains="abcd"
						noWrap={true}
					/>
					<MapContent data={mapData} defaultBounds={defaultBounds} />
				</MapContainer>
			)}
		</div>
	);
}
