import { createMap, getAuth } from "../../../lib/db";

export default function handler(req, res) {
    switch (req.method) {
        case 'POST': POST(req, res); break;

        default: res.status(405).end();
    }
}

// Create map
async function POST(req, res) {
    let place = await getAuth(req, "place");
    if (!place) return res.status(403).end();

    let mid = await createMap(place.id, req.body.image, req.body.name, req.body.width, req.body.height, req.body.index);
    res.status(200).json({ id: mid });
}