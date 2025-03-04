import { Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import L, { LatLngBoundsLiteral } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { MapRCR } from "@/models/RCR";
import landmark from "@/assets/landmark.svg";
import { ChevronRight, Printer, Undo2 } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useSearchParams } from "react-router";
import { routes } from "@/pages/routes";
import { useTranslation } from "react-i18next";

const customIconCreateFunction = (cluster: any) => {
	const childMarkers = cluster.getAllChildMarkers();
	const childCount = cluster.getChildCount();

	let totalBooks = 0;
	childMarkers.forEach((marker: any) => {
		const childBooksNumber = marker.options["data-books-number"];
		totalBooks += childBooksNumber;
	});

	let className = " marker-cluster-";
	if (totalBooks < 1000) {
		className += "small";
	} else if (totalBooks < 10000) {
		className += "medium";
	} else {
		className += "large";
	}

	let size = 150;
	if (totalBooks < 1000) {
		size = 60;
	} else if (totalBooks < 10000) {
		size = 100;
	}

	const html = `<div>
      <p class="marker-cluster-label">
        <span>${totalBooks.toLocaleString()}</span>
        <span class="marker-cluster-label-count">${childCount.toLocaleString()} <img src="${landmark}" alt="libraries" /></span>
      </p>
    </div>`;

	return new L.DivIcon({
		html: html,
		className: "marker-cluster" + className,
		iconSize: new L.Point(size, size),
	});
};

const handleFitBounds = (data: MapRCR[], map: L.Map, defaultBounds: LatLngBoundsLiteral) => {
	if (data && data?.length > 0) {
		const markers = data
			.slice(0, 100)
			.map((establishment) => L.marker([establishment.location.latitude, establishment.location.longitude]));
		const group = L.featureGroup(markers);
		map.fitBounds(group.getBounds().isValid() ? group.getBounds() : defaultBounds, {
			padding: [20, 20],
		});
	} else {
		map.fitBounds(defaultBounds, {
			padding: [20, 20],
		});
	}
};

type MapContentProps = {
	data: MapRCR[];
	defaultBounds: LatLngBoundsLiteral;
};

export default function MapContent({ data, defaultBounds }: MapContentProps) {
	const { t } = useTranslation();
	const map = useMap();
	const [searchParams] = useSearchParams();
	searchParams.delete("page");
	searchParams.delete("itemsPerPage");

	const handleResetZoom = () => {
		if (data && map) {
			handleFitBounds(data, map, defaultBounds);
		}
	};

	const handlePrint = () => {
		const mapElement = document.getElementById("map");
		const barsChartElement = document.getElementById("bars-chart");
		const rcrListElement = document.getElementById("rcr-list");
		const searchbarContainerElement = document.getElementById("searchbar-container");

		if (mapElement) {
			mapElement.style.width = "21cm";
			mapElement.style.height = "29.7cm";
			mapElement.style.position = "absolute";
			mapElement.style.top = "0";
			mapElement.style.left = "0";
			mapElement.style.zIndex = "1000";
			if (barsChartElement) {
				barsChartElement.style.display = "none";
			}
			if (rcrListElement) {
				rcrListElement.style.display = "none";
			}
			if (searchbarContainerElement) {
				searchbarContainerElement.style.display = "none";
			}
			map.invalidateSize();
			window.print();
			mapElement.style.width = "100%";
			mapElement.style.height = "100%";
			mapElement.style.position = "static";
			mapElement.style.top = "0";
			mapElement.style.left = "0";
			mapElement.style.zIndex = "0";
			if (barsChartElement) {
				barsChartElement.style.display = "block";
			}
			if (rcrListElement) {
				rcrListElement.style.display = "block";
			}
			if (searchbarContainerElement) {
				searchbarContainerElement.style.display = "block";
			}
			map.invalidateSize();
		}
	};

	return (
		<>
			<MarkerClusterGroup
				singleMarkerMode={true}
				iconCreateFunction={customIconCreateFunction}
				maxClusterRadius={140}
				spiderfyOnMaxZoom={true}
				spiderfyDistanceMultiplier={4}>
				{data.map((establishment) =>
					establishment.location?.latitude && establishment.location?.longitude ? (
						<Marker
							position={[establishment.location.latitude, establishment.location.longitude]}
							key={establishment.name}
							data-books-number={establishment.numberOfDocuments}>
							<Popup>
								<p style={{ textAlign: "center" }}>
									<span style={{ fontWeight: "bold" }}>{establishment.name}</span>
									<br />
									<span style={{ fontStyle: "italic" }}>{establishment.contact.address.street}</span>
								</p>
								<p style={{ fontWeight: "bold", textAlign: "center" }}>
									<span style={{ fontWeight: "bold" }}>
										{establishment.numberOfDocuments?.toLocaleString()}{" "}
										{t("Map.documents", { count: establishment.numberOfDocuments })}
									</span>
								</p>
								<div className="flex justify-center">
									<Link
										to={{
											pathname: routes.rcr.path.replace(":rcr", establishment.rcr),
											search: searchParams.toString(),
										}}>
										<Button variant="outline" size="sm" className="cursor-pointer">
											{t("Map.details")} <ChevronRight size={16} />
										</Button>
									</Link>
								</div>
							</Popup>
						</Marker>
					) : null
				)}
			</MarkerClusterGroup>
			<button onClick={handleResetZoom} className="reset-zoom-button shadow print:hidden">
				<Undo2 size={16} />
			</button>
			<button onClick={handlePrint} className="print-button shadow print:hidden">
				<Printer size={16} />
			</button>
		</>
	);
}
