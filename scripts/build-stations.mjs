// Gera src/services/stations.ts a partir dos dados abertos da ANP (precos reais
// das ultimas 4 semanas) + geocoding de enderecos via OpenStreetMap (Nominatim).
// Uso: baixe os 2 CSVs da ANP para a pasta /tmp e rode `node scripts/build-stations.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TMP = os.tmpdir();
const GAS_CSV = path.join(TMP, 'anp_gas.csv');
const DIESEL_CSV = path.join(TMP, 'anp_diesel.csv');
const OUT = path.join(process.cwd(), 'src', 'services', 'stations.ts');
const CACHE = path.join(process.cwd(), 'scripts', '.geocode-cache.json');

const geocodeCache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

const BBOX = { minLat: -3.92, maxLat: -3.66, minLng: -38.72, maxLng: -38.38 };
const PHOTO = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800';

const BRAND_MAP = {
  RAIZEN: 'Shell',
  'RAÍZEN': 'Shell',
  SHELL: 'Shell',
  VIBRA: 'Petrobras',
  PETROBRAS: 'Petrobras',
  BR: 'Petrobras',
  IPIRANGA: 'Ipiranga',
  ATEM: 'Atem',
  "ATEM'S": 'Atem',
  BRANCA: 'Branded',
};

const PRODUCT_MAP = {
  GASOLINA: 'comum',
  'GASOLINA ADITIVADA': 'aditivada',
  ETANOL: 'etanol',
  'DIESEL S10': 'diesel',
  'DIESEL S500': 'diesel',
  DIESEL: 'diesel',
  GNV: 'gnv',
};

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parsePrice(value) {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function parseDate(value) {
  const [d, m, y] = value.split('/');
  return new Date(`${y}-${m}-${d}`).getTime();
}

function readStations(file) {
  const raw = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  raw.shift();
  const rows = [];
  for (const line of raw) {
    if (!line) continue;
    const c = line.split(';');
    if (c[1] !== 'CE' || c[2] !== 'FORTALEZA') continue;
    const product = PRODUCT_MAP[c[10]?.trim()];
    if (!product) continue;
    const price = parsePrice(c[12]);
    if (price == null) continue;
    rows.push({
      cnpj: c[4]?.trim(),
      revenda: c[3]?.trim(),
      rua: c[5]?.trim(),
      numero: c[6]?.trim(),
      bairro: c[8]?.trim(),
      product,
      price,
      date: parseDate(c[11]),
      brand: BRAND_MAP[c[15]?.trim()] ?? 'Branded',
    });
  }
  return rows;
}

function groupByStation(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.cnpj)) {
      map.set(row.cnpj, {
        cnpj: row.cnpj,
        revenda: row.revenda,
        rua: row.rua,
        numero: row.numero,
        bairro: row.bairro,
        brand: row.brand,
        prices: { comum: null, aditivada: null, etanol: null, diesel: null, gnv: null },
        dates: {},
      });
    }
    const station = map.get(row.cnpj);
    if (!station.dates[row.product] || row.date >= station.dates[row.product]) {
      station.prices[row.product] = row.price;
      station.dates[row.product] = row.date;
    }
  }
  return [...map.values()];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(station) {
  if (geocodeCache[station.cnpj] !== undefined) {
    return geocodeCache[station.cnpj];
  }
  const headers = { 'User-Agent': 'YEP-App/1.0 (student project; ismaelbrandao2003@gmail.com)' };
  const queries = [
    `${station.rua}, ${station.numero}, ${station.bairro}, Fortaleza, CE, Brasil`,
    `${station.rua}, ${station.bairro}, Fortaleza, CE, Brasil`,
    `${station.bairro}, Fortaleza, CE, Brasil`,
  ];
  for (const q of queries) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      await sleep(1200);
      if (data.length > 0) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);
        if (lat >= BBOX.minLat && lat <= BBOX.maxLat && lng >= BBOX.minLng && lng <= BBOX.maxLng) {
          geocodeCache[station.cnpj] = { latitude: lat, longitude: lng };
          fs.writeFileSync(CACHE, JSON.stringify(geocodeCache, null, 2));
          return geocodeCache[station.cnpj];
        }
      }
    } catch {
      await sleep(1200);
    }
  }
  geocodeCache[station.cnpj] = null;
  fs.writeFileSync(CACHE, JSON.stringify(geocodeCache, null, 2));
  return null;
}

function serialize(stations) {
  const items = stations
    .map((s, index) => {
      const coordinate = `{ latitude: ${s.coordinate.latitude}, longitude: ${s.coordinate.longitude} }`;
      const prices = `{ comum: ${s.prices.comum}, aditivada: ${s.prices.aditivada}, etanol: ${s.prices.etanol}, diesel: ${s.prices.diesel}, gnv: ${s.prices.gnv} }`;
      const services = `{ conveniencia: false, calibragem: false, lavagem: false, gnv: ${s.prices.gnv != null} }`;
      return `  {
    id: '${index + 1}',
    name: ${JSON.stringify(titleCase(s.revenda))},
    brand: '${s.brand}',
    neighborhood: ${JSON.stringify(titleCase(s.bairro))},
    address: ${JSON.stringify(`${titleCase(s.rua)}, ${s.numero} - ${titleCase(s.bairro)}`)},
    coordinate: ${coordinate},
    prices: ${prices},
    services: ${services},
    photo: '${PHOTO}',
    updatedAt: '${new Date(s.updatedAt).toISOString()}',
  }`;
    })
    .join(',\n');

  return `import { Station } from './types';

// Dados reais: precos oficiais da ANP (levantamento das ultimas 4 semanas) com
// enderecos geocodificados via OpenStreetMap (Nominatim). Gerado por
// scripts/build-stations.mjs — nao editar a mao.
export const stations: Station[] = [
${items},
];

export function getStationById(id: string): Station | undefined {
  return stations.find((station) => station.id === id);
}
`;
}

const SNAP_RADIUS_KM = 0.5;

function haversine(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

async function fetchOsmFuelNodes() {
  const query = '[out:json][timeout:25];(node["amenity"="fuel"](around:14000,-3.7319,-38.5267););out body;';
  const headers = {
    'User-Agent': 'YEP-App/1.0 (student project; ismaelbrandao2003@gmail.com)',
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers,
    body: 'data=' + encodeURIComponent(query),
  });
  const data = await res.json();
  return data.elements.map((e) => ({ latitude: e.lat, longitude: e.lon }));
}

// Snap cada posto para o no de combustivel real do OSM mais proximo (atribuicao
// gulosa por menor distancia, cada no usado uma unica vez) dentro do raio.
function snapToOsm(stations, nodes) {
  const pairs = [];
  stations.forEach((station, si) => {
    nodes.forEach((node, ni) => {
      const dist = haversine(station.coordinate, node);
      if (dist <= SNAP_RADIUS_KM) {
        pairs.push({ si, ni, dist });
      }
    });
  });
  pairs.sort((a, b) => a.dist - b.dist);

  const usedStation = new Set();
  const usedNode = new Set();
  let snapped = 0;
  for (const pair of pairs) {
    if (usedStation.has(pair.si) || usedNode.has(pair.ni)) {
      continue;
    }
    usedStation.add(pair.si);
    usedNode.add(pair.ni);
    stations[pair.si].coordinate = nodes[pair.ni];
    snapped += 1;
  }
  return snapped;
}

async function main() {
  const rows = [...readStations(GAS_CSV), ...readStations(DIESEL_CSV)];
  const grouped = groupByStation(rows);
  console.log(`Postos distintos em Fortaleza: ${grouped.length}`);

  const resolved = [];
  for (const station of grouped) {
    const coordinate = await geocode(station);
    if (!coordinate) {
      console.log(`  [skip] sem coords: ${station.revenda}`);
      continue;
    }
    const updatedAt = Math.max(...Object.values(station.dates));
    resolved.push({ ...station, coordinate, updatedAt });
  }
  console.log(`Geocodificados: ${resolved.length}/${grouped.length}`);

  const nodes = await fetchOsmFuelNodes();
  console.log(`Postos reais no OSM (Overpass): ${nodes.length}`);
  const snapped = snapToOsm(resolved, nodes);
  console.log(`Snapados para a posicao real do OSM: ${snapped}/${resolved.length}`);

  fs.writeFileSync(OUT, serialize(resolved));
  console.log(`Escrito: ${OUT}`);
}

main();
