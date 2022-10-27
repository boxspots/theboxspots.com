import { getAuth } from "../../../lib/db";

// POST - Returns visitor information if authed
export default async function handler(req, res) {
    switch (req.method) {
        case 'POST':
            let visitor = await getAuth(req, "visitor");
            if (!visitor) return res.status(403).end();

            res.status(200).json(visitor);
            break;

        default:
            res.status(405).end();
    }
}