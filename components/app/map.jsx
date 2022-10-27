import dynamic from 'next/dynamic';
import styles from '../../styles/App.module.scss';
import { useContext, useEffect, useRef, useState } from 'react';
import SiteContext from '../../lib/site-context';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '../../lib/firebase';
import { nanoid } from 'nanoid';
import http from '../../lib/http';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';

export default function Map() {
    const LLMap = dynamic(() => import("./llmap"), { ssr: false });

    let router = useRouter();
    let client = new http(router);

    let { place, maps, setMaps } = useContext(SiteContext);
    let storage = getStorage(firebaseApp);
    let r = useRef();
    let rl = useRef();

    let [overlay, setOverlay] = useState(false);
    let [spotOverlay, setSpotOverlay] = useState(false);
    let [editSpotOverlay, setEditSpotOverlay] = useState(-1);
    let [dimensions, setDimensions] = useState(undefined);
    let [mapIndex, setMapIndex] = useState(0);
    let [mapUrl, setMapUrl] = useState(undefined);
    let [mapDim, setMapDim] = useState(undefined);
    let [spotDim, setSpotDim] = useState(undefined);

    useEffect(() => { loadImage() }, [mapIndex]);

    const loadImage = async () => {
        if (maps.length <= mapIndex || mapIndex < 0) return setMapIndex(-1);

        let url = await getDownloadURL(ref(storage, `${place.id}/${maps[mapIndex].image}`));
        let w = maps[mapIndex].width;
        let h = maps[mapIndex].height;

        setMapUrl(url);
        setMapDim([w, h]);
    }

    const uploadImage = (e) => {
        e.preventDefault();
        r.current.click();
    }

    const uploadedImage = (e) => {
        if (!e.target.files?.length) return;

        let fr = new FileReader();
        fr.readAsDataURL(e.target.files[0]);
        fr.onloadend = (ended) => rl.current.src = ended.target.result;
    }

    const getDimensions = (e) => setDimensions([e.target.width, e.target.height]);

    const submitImage = async (e) => {
        e.preventDefault();

        let name = e.target.name.value;
        let file = e.target.file.files[0];

        if (name.length === 0 || !file) return alert("Missing information");

        let nid = nanoid();
        let sr = ref(storage, `${place.id}/${nid}`);

        try {
            await uploadBytes(sr, file);

            let { data: { id: mid } } = await client.axios({ method: "post", url: "/api/place/map", data: { image: nid, name, width: dimensions[0], height: dimensions[1], index: maps.length } });

            setMaps((m) => [...m, { id: mid, place: place.id, image: nid, name, width: dimensions[0], height: dimensions[1], index: maps.length }]);
            setOverlay(false);
        } catch (error) {
            alert("Unexpected error occured");
        }
    }

    const leaveOverlay = (e) => {
        e.preventDefault();
        setOverlay(false);
        setSpotOverlay(false);
        setEditSpotOverlay(-1);
    }

    const submitSpot = async (e) => {
        e.preventDefault();

        let name = e.target.name.value;
        let description = e.target.description.value;
        let file = e.target.file.files[0];

        if (name.length === 0 || description.length === 0 || !file) return alert("Missing information");

        let nid = nanoid();
        let sr = ref(storage, `${place.id}/${nid}`);

        try {
            await uploadBytes(sr, file);

            let { data: { id: sid } } = await client.axios({ method: "post", url: "/api/place/spot", data: { map: maps[mapIndex].id, name, description, image: nid, x: spotDim[0], y: spotDim[1] } });

            setMaps((m) => {
                let tmp = [...m];
                tmp[mapIndex].spots.push({ id: sid, name, description, image: nid, x: spotDim[0], y: spotDim[1] });
                return tmp;
            });
            setSpotOverlay(false);
        } catch (error) {
            alert(error);
        }
    }

    const editSpot = async (e) => {
        e.preventDefault();

        let tmp = [...maps];

        let name = e.target.name.value;
        let description = e.target.description.value;

        if (name.length === 0 || description.length === 0) return alert("Missing information");

        await client.axios({ method: "post", url: "/api/place/spot", data: { id: maps[mapIndex].spots[editSpotOverlay].id, map: maps[mapIndex].id, column: "name", value: name } });
        await client.axios({ method: "post", url: "/api/place/spot", data: { id: maps[mapIndex].spots[editSpotOverlay].id, map: maps[mapIndex].id, column: "description", value: description } });

        tmp[mapIndex].spots[editSpotOverlay].name = name;
        tmp[mapIndex].spots[editSpotOverlay].description = description;

        let file = e.target.file.files[0];

        if (file) {
            try {
                let nid = nanoid();
                let sr = ref(storage, `${place.id}/${nid}`);

                await uploadBytes(sr, file);

                await client.axios({ method: "post", url: "/api/place/spot", data: { id: maps[mapIndex].spots[editSpotOverlay].id, map: maps[mapIndex].id, column: "image", value: image } });

                tmp[mapIndex].spots[editSpotOverlay].image = nid;
            } catch (error) {
                alert(error);
            }
        }

        setMaps(tmp);
        setEditSpotOverlay(-1);
    }

    const downloadQR = () => {
        let canvas = document.getElementById("qr-code");
        let pngurl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

        let dlink = document.createElement("a");
        dlink.href = pngurl;
        dlink.download = maps[mapIndex].spots[editSpotOverlay].name + ".png";
        document.body.appendChild(dlink);
        dlink.click();
        document.body.removeChild(dlink);
    }

    return (
        <>
            {overlay ? (
                <form className={styles.overlay} onSubmit={submitImage}>
                    <input name='name' autoCapitalize='none' autoCorrect='none' placeholder='Name' />
                    <input className={styles.hidden} name='file' type="file" accept='image/*' ref={r} onChange={uploadedImage} />
                    <img className={styles.hidden} onLoad={getDimensions} ref={rl} alt="waiting" />

                    <button onClick={uploadImage}>Upload Image</button>
                    <button>Create</button>

                    <p className={styles.cancel} onClick={leaveOverlay}>Cancel</p>
                </form>
            ) : spotOverlay ? (
                <form className={styles.overlay} onSubmit={submitSpot}>
                    <input name='name' autoCapitalize='none' autoCorrect='none' placeholder='Name' />
                    <textarea name='description' autoCapitalize='none' autoCorrect='none' placeholder='Description' />
                    <input className={styles.hidden} name='file' type="file" accept='image/*' ref={r} onChange={uploadedImage} />
                    <img className={styles.hidden} onLoad={getDimensions} ref={rl} alt="waiting" />

                    <button onClick={uploadImage}>Upload Image</button>
                    <button>Create</button>

                    <p className={styles.cancel} onClick={leaveOverlay}>Cancel</p>
                </form>
            ) : editSpotOverlay > -1 ? (
                <form className={styles.overlay} onSubmit={editSpot}>
                    <input name='name' defaultValue={maps[mapIndex].spots[editSpotOverlay].name} autoCapitalize='none' autoCorrect='none' placeholder='Name' />
                    <textarea name='description' defaultValue={maps[mapIndex].spots[editSpotOverlay].description} autoCapitalize='none' autoCorrect='none' placeholder='Description' />
                    <input className={styles.hidden} name='file' type="file" accept='image/*' ref={r} onChange={uploadedImage} />
                    <img className={styles.hidden} onLoad={getDimensions} ref={rl} alt="waiting" />

                    <button onClick={uploadImage}>Upload Image</button>
                    <button>Save</button>

                    <p className={styles.cancel} onClick={leaveOverlay}>Cancel</p>
                    <QRCode
                        id="qr-code"
                        value={maps[mapIndex].spots[editSpotOverlay].id}
                        size={50}
                        className={styles.qr}
                        title="Download QR Code"
                        onClick={downloadQR}
                    />
                </form>
            ) : (
                <div className={styles.map}>
                    <div className={styles.list}>
                        <button title="New Map" onClick={() => setOverlay(true)}>New Map</button>
                        {maps.map((v, i) => (
                            <button onClick={() => setMapIndex(i)} title={v.name} style={i === mapIndex ? { opacity: 1 } : undefined} key={i}>{v.name}</button>
                        ))}
                    </div>

                    <div className={styles.llmap}>
                        {mapUrl ? <LLMap map={maps[mapIndex]} setSpotDim={setSpotDim} openSpotOverlay={() => setSpotOverlay(true)} setEditSpotOverlay={setEditSpotOverlay} url={mapUrl} width={mapDim[0]} height={mapDim[1]} /> : undefined}
                    </div>
                </div>
            )}
        </>
    );
}