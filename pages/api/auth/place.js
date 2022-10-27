import { getAuth } from "../../../lib/db";

// POST - Returns place information if authed
export default async function handler(req, res) {
    switch (req.method) {
        case 'POST':
            let place = await getAuth(req, "place");
            if (!place) return res.status(403).end();

            res.status(200).json(place);
            break;

        default:
            res.status(405).end();
    }
}