import math
from shapely.geometry import Point, LineString
from shapely.strtree import STRtree
from backend.app.data.chennai_roads import CHENNAI_ROADS

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class RoadNetworkSnapper:
    def __init__(self, roads_data=CHENNAI_ROADS):
        self.roads = roads_data
        self.line_geoms = []
        self.road_map = {}
        for r in self.roads:
            line = LineString([[pt[1], pt[0]] for pt in r["coords"]])
            self.line_geoms.append(line)
            self.road_map[id(line)] = r

        self.tree = STRtree(self.line_geoms)

    def snap_point(self, lat: float, lon: float, max_dist_m: float = 80.0):
        """
        Returns (road_edge_id, offset_formatted, snapped_lat, snapped_lon, distance_m)
        """
        pt = Point(lon, lat)
        nearest_geom_idx = self.tree.nearest(pt)
        nearest_line = self.line_geoms[nearest_geom_idx]
        road_info = self.road_map[id(nearest_line)]

        proj_dist = nearest_line.project(pt)
        line_length = nearest_line.length
        offset_ratio = proj_dist / line_length if line_length > 0 else 0.0

        snapped_pt = nearest_line.interpolate(proj_dist)
        snapped_lon, snapped_lat = snapped_pt.x, snapped_pt.y

        dist_m = haversine_distance_m(lat, lon, snapped_lat, snapped_lon)
        if dist_m <= max_dist_m:
            edge_id_with_offset = f"{road_info['id']}:{offset_ratio:.2f}"
            return road_info["id"], edge_id_with_offset, snapped_lat, snapped_lon, dist_m
        else:
            return "w_offroad", "offroad:0.0", lat, lon, dist_m

snapper = RoadNetworkSnapper()
