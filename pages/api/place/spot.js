import { createSpot, editSpot, getAuth, getMap } from "../../../lib/db";

export default function handler(req, res) {
    switch (req.method) {
        case 'POST': POST(req, res); break;

        default: res.status(405).end();
    }
}

// Create spot
async function POST(req, res) {
    let place = await getAuth(req, "place");
    if (!place) return res.status(403).end();

    let m = await getMap(req.body.map);
    if (m.place !== place.id) return res.status(403).end();

    if (req.body.id) {
        await editSpot(req.body.id, req.body.column, req.body.value);

        res.status(200).end();
    }
    else {
        let sid = await createSpot(req.body.map, req.body.name, req.body.description, req.body.image, req.body.x, req.body.y);

        res.status(200).json({ id: sid });
    }
}