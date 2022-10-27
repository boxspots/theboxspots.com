import { editPlaceInfo, getAuth, getEvents, getMaps, getSpots } from "../../../lib/db";

export default function handler(req, res) {
    switch (req.method) {
        case 'POST': POST(req, res); break;
        case 'GET': GET(req, res); break;

        default: res.status(405).end();
    }
}

// Edit information
async function POST(req, res) {
    let place = await getAuth(req, "place");
    if (!place) return res.status(403).end();

    await editPlaceInfo(place.id, req.body.column, req.body.value);
    res.status(200).end();
}

// Load maps, spots, and events
async function GET(req, res) {
    let place = await getAuth(req, "place");
    if (!place) return res.status(403).end();

    let maps = await getMaps(place.id);
    let events = await getEvents(place.id);

    for (let m of maps) m.spots = await getSpots(m.id);

    res.status(200).json({ maps, events });
}