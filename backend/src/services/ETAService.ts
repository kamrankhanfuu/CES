import { Client, LatLng, RouteLeg, TravelMode } from "@googlemaps/google-maps-services-js";


export default class ETAService {

    private readonly googleClient: Client;
    private readonly apiKey: string;

    constructor() {
        this.googleClient = new Client({});
        this.apiKey = process.env.GOOGLE_MAP_API_KEY;
    }

    async getDirectionRoute(origin: LatLng, destination: LatLng): Promise<RouteLeg> {
        const {data} = await this.googleClient.directions({
            params: {
                key: this.apiKey,
                origin,
                destination,
                mode: TravelMode.driving,
                alternatives: false
            }
        });
        if (data.status === "OK") {
            const [route] = data.routes;
            const [leg] = route.legs;
            return leg;
        }
    }
}