import { Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { MapRCR } from "@/models/RCR";
import landmark from "@/assets/landmark.svg";
import { Undo2 } from "lucide-react";

const customIconCreateFunction = (cluster: any) => {
	const childMarkers = cluster.getAllChildMarkers();
	const childCount = cluster.getChildCount();

	let totalBooks = 0;
	childMarkers.forEach((marker: any) => {
		const childBooksNumber = marker.options["data-books-number"];
		totalBooks += childBooksNumber;
	});

	let className = " marker-cluster-";
	if (totalBooks < 50) {
		className += "small";
	} else if (totalBooks < 100) {
		className += "medium";
	} else {
		className += "large";
	}

	let size = 150;
	if (totalBooks < 50) {
		size = 60;
	} else if (totalBooks < 100) {
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

const handleFitBounds = (data: MapRCR[], map: L.Map) => {
	const markers = data
		.slice(0, 100)
		.map((establishment) => L.marker([establishment.location.latitude, establishment.location.longitude]));
	const group = L.featureGroup(markers);

	map.fitBounds(group.getBounds(), {
		padding: [50, 50],
	});
};

type MapContentProps = {
	data: MapRCR[];
};

export default function MapContent({ data }: MapContentProps) {
	const map = useMap();

	const handleResetZoom = () => {
		console.log({ data, map });
		if (data && map) {
			handleFitBounds(data, map);
		}
	};

	return (
		<>
			<MarkerClusterGroup singleMarkerMode={true} iconCreateFunction={customIconCreateFunction}>
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
									<span style={{ fontWeight: "bold" }}>{establishment.numberOfDocuments} ouvrages</span>
								</p>
							</Popup>
						</Marker>
					) : null
				)}
			</MarkerClusterGroup>
			<button onClick={handleResetZoom} className="reset-zoom-button">
				<Undo2 size={16} />
			</button>
		</>
	);
}
