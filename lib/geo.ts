// [lat, lng] vertex rings. Coarse on purpose — rendered as ~2px dots on a small sphere.
const CONTINENTS: [number, number][][] = [
  // North America
  [[70,-165],[72,-130],[70,-95],[64,-78],[58,-62],[48,-55],[40,-74],[32,-80],[26,-80],[29,-90],[26,-97],[20,-97],[21,-89],[14,-87],[8,-80],[10,-85],[17,-101],[23,-110],[28,-115],[34,-120],[40,-124],[48,-125],[57,-135],[60,-150],[58,-158],[65,-166]],
  // Greenland
  [[83,-40],[81,-20],[75,-20],[68,-25],[60,-43],[65,-53],[76,-58],[80,-55]],
  // South America
  [[12,-72],[5,-52],[-5,-35],[-15,-39],[-25,-48],[-35,-57],[-41,-63],[-50,-68],[-55,-70],[-50,-74],[-37,-73],[-18,-70],[-5,-81],[2,-78],[8,-77]],
  // Africa
  [[35,-6],[37,10],[31,20],[31,32],[27,34],[15,40],[11,44],[11,51],[0,42],[-5,39],[-15,40],[-26,33],[-34,20],[-30,17],[-15,12],[-5,9],[4,9],[5,-5],[7,-13],[15,-17],[21,-17],[28,-13],[32,-9]],
  // Eurasia
  [[38,-9],[43,-8],[47,-2],[51,3],[54,8],[58,5],[63,10],[70,25],[73,60],[76,105],[72,140],[66,178],[62,163],[52,157],[59,142],[45,135],[35,127],[30,121],[23,114],[10,107],[2,103],[13,100],[16,95],[22,91],[13,80],[8,77],[19,72],[24,67],[25,60],[22,59],[13,45],[15,42],[28,34],[36,36],[36,28],[39,23],[42,16],[44,9],[43,4],[39,0],[36,-5]],
  // UK
  [[58,-5],[53,0],[51,1],[50,-5],[54,-4]],
  // Japan
  [[44,142],[41,140],[35,140],[33,131],[38,138]],
  // Sumatra/Java arc
  [[5,96],[-4,102],[-8,114],[-9,119],[-6,107],[1,99]],
  // Borneo
  [[5,110],[0,117],[-3,112],[2,109]],
  // New Guinea
  [[-2,132],[-4,141],[-8,147],[-6,138]],
  // Australia
  [[-11,132],[-12,137],[-17,140],[-11,142],[-19,146],[-27,153],[-37,150],[-39,146],[-35,138],[-32,133],[-33,124],[-33,115],[-26,113],[-20,119],[-18,122],[-14,126]],
  // Antarctica (ring closed through the pole)
  [[-70,-180],[-72,-150],[-68,-120],[-73,-90],[-70,-60],[-69,-30],[-71,0],[-68,30],[-70,60],[-67,90],[-71,120],[-69,150],[-70,180],[-90,180],[-90,-180]],
];

function inRing(lat: number, lng: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function isLand(lat: number, lng: number): boolean {
  return CONTINENTS.some((ring) => inRing(lat, lng, ring));
}

function buildPoints(): [number, number][] {
  const pts: [number, number][] = [];
  for (let lat = -85; lat <= 85; lat += 3) {
    const step = 3 / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
    for (let lng = -180; lng < 180; lng += step) {
      if (isLand(lat, lng)) pts.push([lat, Math.round(lng * 100) / 100]);
    }
  }
  return pts;
}

export const WORLD_POINTS: [number, number][] = buildPoints();

export const LA = { lat: 34.05, lng: -118.24 };

export const CITIES = [
  { name: "Los Angeles", ...LA },
  { name: "New York", lat: 40.71, lng: -74.01 },
  { name: "London", lat: 51.51, lng: -0.13 },
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
  { name: "Sydney", lat: -33.87, lng: 151.21 },
  { name: "São Paulo", lat: -23.55, lng: -46.63 },
  { name: "Berlin", lat: 52.52, lng: 13.41 },
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "San Diego", lat: 32.72, lng: -117.16 },
];
