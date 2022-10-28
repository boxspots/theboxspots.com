import { Client } from 'pg';
import firebaseAuth from './firebaseAuth';

const client = new Client();
client.connect();

/**
 * Authenticates user based on bearer token from firebase.
 * @param {*} req Request object from REST
 * @param {('place'|'visitor')} type Auth type
 * @returns {Object} User information
 */
export async function getAuth(req, type) {
    try {
        let token = req.headers?.authorization;
        if (!token) throw null;

        token = token.split(" ")[1];
        if (!token) throw null;

        let { uid, firebase } = await firebaseAuth.verifyIdToken(token);

        switch (firebase.sign_in_provider) {
            case 'password': // Place
                if (type !== "place") throw null;

                let place = await client.query(`SELECT * FROM place WHERE id = $1`, [uid]);

                if (place.rowCount === 0)
                    place = await client.query(`INSERT INTO place(id) VALUES ($1) RETURNING *`, [uid]);

                return place.rows[0];

            case 'google.com': // Visitor
                if (type !== "visitor") throw null;

                let visitor = await client.query(`SELECT * FROM visitor WHERE id = $1`, [uid]);

                console.log(firebase);
                return null;

                if (visitor.rowCount === 0)
                    visitor = await client.query(`INSERT INTO visitor(id, given_name, family_name) VALUES ($1) RETURNING *`, [uid]);

                return visitor.rows[0];

        }
    } catch (error) { console.error(error); return null; }
}

/**
 * Edits general information of place.
 * @param {String} pid Place ID
 * @param {('name'|'location')} col Column to edit 
 * @param {String} val Value to substitute
 */
export async function editPlaceInfo(pid, col, val) {
    try {
        switch (col) {
            case "name": await client.query(`UPDATE place SET name = $1 WHERE id = $2`, [val, pid]); break;
            case "location": await client.query(`UPDATE place SET location = $1 WHERE id = $2`, [val, pid]); break;

            default: throw "Invalid column name";
        }
    } catch (error) { console.error(error); return null; }
}

/**
 * Get maps with certain place id.
 * @param {String} pid Place ID
 * @returns List of maps
 */
export async function getMaps(pid) {
    try {
        let { rows: maps } = await client.query(`SELECT * FROM map WHERE place=$1`, [pid]);
        return maps;
    } catch (error) { console.error(error); return null; }
}

/**
 * Get spots with certain map id.
 * @param {Number} mid Map ID
 * @returns List of spots
 */
export async function getSpots(mid) {
    try {
        let { rows: spots } = await client.query(`SELECT * FROM spot WHERE map=$1`, [mid]);
        return spots;
    } catch (error) { console.error(error); return null; }
}

/**
 * Get events with certain place id.
 * @param {String} pid Place ID
 * @returns List of events
 */
export async function getEvents(pid) {
    try {
        let { rows: events } = await client.query(`SELECT * FROM event WHERE place=$1`, [pid]);
        return events;
    } catch (error) { console.error(error); return null; }
}

/**
 * Creates new map
 * @param {String} pid Place ID
 * @param {String} image Image bucket ID
 * @param {String} name Name of map
 * @param {Number} width Width of map image
 * @param {Number} height Height of map image
 * @returns Map ID
 */
export async function createMap(pid, image, name, width, height, index) {
    try {
        let mid = await client.query(`INSERT INTO map(place, image, name, width, height, index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [pid, image, name, width, height, index]);
        return mid.rows[0].id;
    } catch (error) { console.error(error); return null; }
}

/**
 * Creates new spot
 * @param {Number} mid Map ID
 * @param {String} name Name of spot
 * @param {String} description Description of spot
 * @param {String} image Image of spot
 * @param {Number} x Longitude of spot
 * @param {Number} y Latitude of spot
 * @returns Spot ID
 */
export async function createSpot(mid, name, description, image, x, y) {
    try {
        let sid = await client.query(`INSERT INTO spot(map, name, description, image, x, y) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [mid, name, description, image, x, y]);
        return sid.rows[0].id;
    } catch (error) { console.error(error); return null; }
}

/**
 * Load map information
 * @param {Number} mid Map ID
 * @returns Map information
 */
export async function getMap(mid) {
    try {
        let maps = await client.query(`SELECT * FROM map WHERE id=$1`, [mid]);

        if (maps.rowCount === 0) return null;
        else return maps.rows[0];
    } catch (error) { console.error(error); return null; }
}

/**
 * 
 * @param {Number} sid Spot ID
 * @param {('name'|'description'|'image'|'x'|'y')} col Column to edit 
 * @param {*} val Value to substitute
 * @returns 
 */
export async function editSpot(sid, col, val) {
    try {
        switch (col) {
            case 'name': await client.query(`UPDATE spot SET name=$1 WHERE id=$2`, [val, sid]); break;
            case 'description': await client.query(`UPDATE spot SET description=$1 WHERE id=$2`, [val, sid]); break;
            case 'image': await client.query(`UPDATE spot SET image=$1 WHERE id=$2`, [val, sid]); break;
            case 'x': await client.query(`UPDATE spot SET x=$1 WHERE id=$2`, [val, sid]); break;
            case 'y': await client.query(`UPDATE spot SET y=$1 WHERE id=$2`, [val, sid]); break;

            default: throw "Invalid column name";
        }
    } catch (error) { console.error(error); return null; }
}

/**
 * Load spot information
 * @param {Number} sid Spot ID
 */
export async function getSpot(sid) {
    try {
        let spot = await client.query(`SELECT * FROM spot WHERE id=$1`, [sid]);

        if (spot.rowCount === 0) return null;
        else return spot.rows[0];
    } catch (error) { console.error(error); return null; }
}