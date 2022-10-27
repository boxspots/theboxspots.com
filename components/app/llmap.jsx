import { MapContainer, ImageOverlay, Marker, useMapEvents } from 'react-leaflet';
import { CRS, latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";

export default function LLMap({ map, openSpotOverlay, setEditSpotOverlay, setSpotDim, url, width, height }) {
    return (
        <MapContainer style={{ height: "100%", width: "100%", zIndex: 1 }} center={[height / 2, width / 2]} zoom={2} maxZoom={4} minZoom={1} crs={CRS.Simple} maxBounds={latLngBounds([0, height], [width, 0])}>
            <ImageOverlay url={url} bounds={latLngBounds([0, height], [width, 0])} />

            <Spots spots={map.spots} openSpotOverlay={openSpotOverlay} setEditSpotOverlay={setEditSpotOverlay} setSpotDim={setSpotDim} />
        </MapContainer>
    );
}

function Spots({ spots, openSpotOverlay, setEditSpotOverlay, setSpotDim }) {
    let map = useMapEvents({
        click(e) {
            openSpotOverlay();
            setSpotDim([e.latlng.lat, e.latlng.lng]);
        }
    });

    if (spots?.length) return spots.map((v, i) => <Marker eventHandlers={{
        click: (e) => {
            setEditSpotOverlay(i);
        }
    }} key={i} position={[v.x, v.y]} title={v.name} />);
    else return null;
}