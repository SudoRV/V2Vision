const fs = require("fs");
const path = require("path");

const RTree = require('rtree');

function metersToLatLng(lat, lng, w, h) {
    const LATITUDE_METERS_TO_DEG = 111320; // Approximate meters per degree of latitude
    const LONGITUDE_METERS_TO_DEG = LATITUDE_METERS_TO_DEG * Math.cos(lat * Math.PI / 180); // Adjust for longitude based on latitude

    // Convert meters to degrees for width (longitude)
    const widthInDegrees = w / LONGITUDE_METERS_TO_DEG;

    // Convert meters to degrees for height (latitude)
    const heightInDegrees = h / LATITUDE_METERS_TO_DEG;

    // Return the adjusted lat, lng along with the converted width and height in degrees
    return {
        x: lng - (widthInDegrees / 2),  // Adjusted longitude (x coordinate)
        y: lat - (heightInDegrees / 2), // Adjusted latitude (y coordinate)
        w: widthInDegrees,              // Width in degrees of longitude
        h: heightInDegrees              // Height in degrees of latitude
    };
}

class VehicleMap {
    constructor() {
        this.tree = new RTree();
        this.mapping = new Map();
        this.sockets = new Map();
    }

    addUser(socket) {
        this.sockets.set(socket.id, { socket: socket });
    }

    deleteUser(socketId) {
        this.sockets.delete(socketId);
    }

    addLocation(socketId, location, w, h) {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        const bbox = metersToLatLng(lat, lng, w, h);

        if (this.mapping.has(socketId)) {
            this.prevData = this.mapping.get(socketId);
            this.deleteLocation(socketId);
        }

        this.tree.insert(bbox, {
            id: socketId,
        })

        this.mapping.set(socketId, { bbox: bbox, location: location });

        return bbox;
    }

    deleteLocation(data) {
        let id = data;
        if (typeof data == 'object') {
            data = data;
        }
        else if (typeof data == 'string' || typeof data == 'number') {
            try {
                data = this.mapping.get(data).bbox;
            } catch (e) { console.log("user not found and tried to delete exception") }
        }

        this.tree.remove(data);
        this.mapping.delete(id);
    }

    searchLocation(socketId, bbox) {
        bbox = metersToLatLng(bbox.lat, bbox.lng, bbox.w, bbox.h);
        let ids = this.tree.search(bbox)
            .map(val => val.id)
            .filter(ids => ids !== socketId)

        let locations = [...this.mapping.entries()]
            .filter(([key, val]) => ids.includes(key))
            .map((node) => ({ id: node[0], location: node[1].location }));

        return locations;
    }

    getLocations() {
        return this.tree.getTree();
    }
}


module.exports = VehicleMap;


if (require.main === module) {
    const map = new VehicleMap();

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../media/data/locations.json")).toString());


    data.locations.within_500m.forEach((location) => {
        map.addLocation(location.lat, location.lng, 1, 1, location.id);
    })

    data.locations.btw_500_1000m.forEach((location) => {
        map.addLocation(location.lat, location.lng, 1, 1, location.id);
    })


    //console.log(map.getLocations())

    //let search = metersToLatLng(28.9690, 80.0178, 200, 200);
    //console.log(search)
    //console.log(map.searchLocation(search))


}
