import { createMap, getAuth, getMap } from "../../../lib/db";

export default function handler(req, res) {
    switch (req.method) {
        case 'GET': GET(req, res); break;
        case 'POST': POST(req, res); break;

        default: res.status(405).end();
    }
}

// Get map
async function GET(req, res) {
    // TODO - auth and save history
    let map = await getMap(req.query.mid);

    res.status(200).json(map);
}

// Create map
async function POST(req, res) {
    let place = await getAuth(req, "place");
    if (!place) return res.status(403).end();

    let mid = await createMap(place.id, req.body.image, req.body.name, req.body.width, req.body.height, req.body.index);
    res.status(200).json({ id: mid });
}