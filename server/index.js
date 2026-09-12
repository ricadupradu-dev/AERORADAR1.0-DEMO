require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");
const path = require("path");
const https = require("https");

const openSkyHttpsAgent = new https.Agent({ keepAlive: true, family: 4 });

function httpsRequest(url, { method = "GET", headers = {}, body = "", timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers, agent: openSkyHttpsAgent, timeout: timeoutMs }, res => {
      const chunks = [];
      res.on("data", chunk => chunks.push(Buffer.from(chunk)));
      res.on("end", () => resolve({ status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("timeout", () => req.destroy(new Error("ETIMEDOUT")));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

const app = express();

// Produção: cabeçalhos básicos, compressão opcional e proteção simples contra abuso.
app.disable("x-powered-by");
app.set("trust proxy", 1);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false
});

app.use(
  cors({
    origin:
      process.env.FRONTEND_ORIGIN || "http://localhost:5500",
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS flexível: same-origin funciona sem configuração; FRONTEND_ORIGIN restringe origens externas quando usado.
const allowedOrigin = process.env.FRONTEND_ORIGIN ? new Set(process.env.FRONTEND_ORIGIN.split(",").map(v => v.trim()).filter(Boolean)) : null;
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigin && !allowedOrigin.has(origin)) return res.status(403).json({ error: "Origem não autorizada" });
  next();
});

// Compressão sem dependências externas para respostas JSON/texto.
const zlib = require("zlib");
app.use((req, res, next) => {
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let chunks = [];
  let started = false;
  const acceptsGzip = /gzip/i.test(String(req.headers["accept-encoding"] || ""));
  const shouldCompress = acceptsGzip && req.method !== "HEAD";
  if (!shouldCompress) return next();
  res.write = (chunk, encoding) => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)); return true; };
  res.end = (chunk, encoding) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    const body = Buffer.concat(chunks);
    const type = String(res.getHeader("Content-Type") || "");
    if (body.length < 1024 || (!/json|text|javascript|css|svg|xml/i.test(type))) {
      res.write = originalWrite; res.end = originalEnd; return originalEnd(body);
    }
    try {
      const compressed = zlib.gzipSync(body, { level: 6 });
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Content-Length", compressed.length);
      res.write = originalWrite; res.end = originalEnd;
      return originalEnd(compressed);
    } catch (_) {
      res.write = originalWrite; res.end = originalEnd; return originalEnd(body);
    }
  };
  next();
});

/*
 * Entrega o AERO RADAR:
 * index.html, assets/app.js, assets/style.css etc.
 */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

app.use(express.static(path.join(__dirname, ".."), {
  index: "index.html",
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  etag: true
}));

// Health checks para hospedagem e monitoramento.
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, service: "aero-radar", database: "ok", uptime: Math.round(process.uptime()) });
  } catch (error) {
    res.status(503).json({ ok: false, service: "aero-radar", database: "error" });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "ok", now: new Date().toISOString() });
  } catch (_) {
    res.status(503).json({ ok: false, database: "error" });
  }
});

// Rate limit simples por IP para login/cadastro (sem bloquear o restante do radar).
const authAttempts = new Map();
function authRateLimit(req, res, next) {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const current = authAttempts.get(key) || { start: now, count: 0 };
  if (now - current.start > 15 * 60 * 1000) { current.start = now; current.count = 0; }
  current.count += 1; authAttempts.set(key, current);
  if (current.count > 20) return res.status(429).json({ error: "Muitas tentativas. Aguarde alguns minutos." });
  next();
}


const secret =
  process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION";

function token(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    secret,
    {
      expiresIn: "7d"
    }
  );
}

function setCookie(res, t) {
  res.cookie("aero_token", t, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 864e5
  });
}

async function auth(req, res, next) {
  try {
    let t = req.cookies.aero_token;

    if (!t) {
      return res
        .status(401)
        .json({
          error: "Não autenticado"
        });
    }

    req.user = jwt.verify(t, secret);

    next();
  } catch (e) {
    res
      .status(401)
      .json({
        error: "Sessão inválida"
      });
  }
}

app.get(
  "/api/health",
  (req, res) =>
    res.json({
      ok: true,
      service: "AERO RADAR API"
    })
);

let openskyToken = null;
let openskyTokenExpiresAt = 0;
let openskyAuthFailureUntil = 0;

async function getOpenSkyToken() {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais OpenSky não configuradas no .env");
  }

  if (openskyToken && Date.now() < openskyTokenExpiresAt) return openskyToken;
  if (Date.now() < openskyAuthFailureUntil) {
    throw new Error("OpenSky OAuth temporariamente indisponível; usando acesso anônimo");
  }

  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  }).toString();

  let response;
  try {
    response = await httpsRequest(
      "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(form),
          "Accept": "application/json",
          "User-Agent": "AERO-RADAR/3.1"
        },
        body: form,
        timeoutMs: 10000
      }
    );
  } catch (error) {
    openskyAuthFailureUntil = Date.now() + 60 * 1000;
    throw new Error(`OpenSky token connection failed: ${error?.code || error?.message || "network error"}`);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`OpenSky token error: ${response.status} ${response.body.slice(0, 500)}`);
  }

  let data;
  try { data = JSON.parse(response.body); }
  catch (_) { throw new Error("OpenSky token returned invalid JSON"); }

  if (!data.access_token) throw new Error("OpenSky token response did not contain access_token");

  openskyToken = data.access_token;
  openskyAuthFailureUntil = 0;
  const expiresIn = Number(data.expires_in) || 1800;
  openskyTokenExpiresAt = Date.now() + Math.max(60, expiresIn - 60) * 1000;
  return openskyToken;
}

function openSkyParams(req) {
  const params = new URLSearchParams();
  ["lamin", "lomin", "lamax", "lomax"].forEach(k => {
    if (req.query[k] !== undefined && Number.isFinite(Number(req.query[k]))) {
      params.set(k, String(Number(req.query[k])));
    }
  });
  return params.toString();
}

function mapOpenSkyStates(data) {
  const states = data?.states || [];
  return states
    .filter(s => s[5] !== null && s[6] !== null)
    .map(s => ({
      callsign: String(s[1] || "").trim(),
      hex: String(s[0] || "").trim().toUpperCase(),
      reg: "",
      type: "ADS-B",
      model: "",
      originCountry: s[2] || "",
      from: "",
      to: "",
      lat: s[6],
      lon: s[5],
      alt: s[7] !== null ? Math.round(s[7] * 3.28084) : null,
      speed: s[9] !== null ? Math.round(s[9] * 1.94384) : null,
      heading: s[10] !== null ? s[10] : null,
      source: "real",
      onGround: Boolean(s[8])
    }));
}

async function getOpenSkyStates(req) {
  const query = openSkyParams(req);
  const url = `https://opensky-network.org/api/states/all${query ? "?" + query : ""}`;

  // First try OAuth2 when credentials are available. If the auth host is
  // unreachable (common on some hosting networks), fall back to the official
  // anonymous endpoint so the public radar can still receive live states.
  let authError = null;
  try {
    const token = await getOpenSkyToken();
    const response = await httpsRequest(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "AERO-RADAR/3.1"
      },
      timeoutMs: 15000
    });
    if (response.status >= 200 && response.status < 300) {
      return { data: JSON.parse(response.body), mode: "oauth" };
    }
    if (response.status === 401) {
      openskyToken = null;
      openskyTokenExpiresAt = 0;
      authError = `OpenSky states returned 401`;
    } else {
      throw new Error(`OpenSky states error: ${response.status} ${response.body.slice(0, 500)}`);
    }
  } catch (error) {
    authError = error?.message || String(error);
  }

  // Anonymous access is officially supported with lower rate limits.
  const response = await httpsRequest(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "AERO-RADAR/3.1"
    },
    timeoutMs: 15000
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`OpenSky anonymous error: ${response.status} ${response.body.slice(0, 500)}${authError ? ` | OAuth: ${authError}` : ""}`);
  }
  return { data: JSON.parse(response.body), mode: "anonymous", authError };
}


// Teste temporário de conectividade do Render com a API pública adsb.fi.
// Este endpoint não altera o /api/flights atual.
app.get("/api/test-adsbfi", async (req, res) => {
  const lat = Number(req.query.lat ?? -22.45);
  const lon = Number(req.query.lon ?? -44.45);
  const dist = Number(req.query.dist ?? 100);

  if (![lat, lon, dist].every(Number.isFinite)) {
    return res.status(400).json({ ok: false, error: "Parâmetros inválidos" });
  }

  const url = `https://opendata.adsb.fi/api/v3/lat/${lat}/lon/${lon}/dist/${dist}`;
  try {
    const response = await httpsRequest(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AERO-RADAR/ADSBFI-TEST"
      },
      timeoutMs: 15000
    });

    let data = null;
    try { data = JSON.parse(response.body); } catch (_) {}

    if (response.status < 200 || response.status >= 300) {
      return res.status(502).json({
        ok: false,
        source: "adsb.fi",
        status: response.status,
        message: response.body.slice(0, 500)
      });
    }

    return res.json({
      ok: true,
      source: "adsb.fi",
      status: response.status,
      total: Number(data?.total) || 0,
      sample: Array.isArray(data?.ac) ? data.ac.slice(0, 5) : [],
      now: data?.now ?? null
    });
  } catch (error) {
    console.error("Erro teste adsb.fi:", error?.message || error);
    return res.status(502).json({
      ok: false,
      source: "adsb.fi",
      message: error?.code || error?.message || "network error"
    });
  }
});

const adsbFiCache = new Map();
let adsbFiRequestChain = Promise.resolve();

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function queueAdsbFiRequest(task) {
  const run = adsbFiRequestChain.then(async () => {
    const result = await task();
    await sleep(1100);
    return result;
  });
  adsbFiRequestChain = run.catch(() => {});
  return run;
}

async function fetchAdsbFiArea(lat, lon, dist=250) {
  const key = `${Number(lat).toFixed(2)}:${Number(lon).toFixed(2)}:${Number(dist)}`;
  const cached = adsbFiCache.get(key);
  if (cached && Date.now() - cached.time < 45000) return cached.data;

  const data = await queueAdsbFiRequest(async () => {
    const url = `https://opendata.adsb.fi/api/v3/lat/${Number(lat).toFixed(4)}/lon/${Number(lon).toFixed(4)}/dist/${Number(dist)}`;
    const response = await httpsRequest(url, {
      headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/ADSBFI" },
      timeoutMs: 15000
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`adsb.fi error: ${response.status} ${response.body.slice(0, 500)}`);
    }
    return JSON.parse(response.body);
  });
  adsbFiCache.set(key, {time:Date.now(), data});
  return data;
}

async function getAdsbFiFlights(req) {
  const lamin = Number(req.query.lamin);
  const lomin = Number(req.query.lomin);
  const lamax = Number(req.query.lamax);
  const lomax = Number(req.query.lomax);

  const hasBounds = [lamin, lomin, lamax, lomax].every(Number.isFinite);
  const lat = hasBounds ? (lamin + lamax) / 2 : -22.45;
  const lon = hasBounds ? (lomin + lomax) / 2 : -44.45;

  // adsb.fi aceita até 250 NM por consulta. Calculamos um raio suficiente
  // para cobrir a área visível do mapa, sem ultrapassar esse limite.
  let dist = 100;
  if (hasBounds) {
    const latSpan = Math.abs(lamax - lamin);
    const lonSpan = Math.abs(lomax - lomin);
    const kmLat = latSpan * 111.32;
    const kmLon = lonSpan * 111.32 * Math.cos((lat * Math.PI) / 180);
    const diagonalKm = Math.sqrt(kmLat * kmLat + kmLon * kmLon);
    dist = Math.min(250, Math.max(25, Math.ceil((diagonalKm / 2) / 1.852)));
  }

  // Para mostrar mais tráfego sem pesar o navegador, agregamos algumas áreas de 250 NM
  // somente quando o zoom está mais afastado. As consultas são cacheadas e serializadas
  // para respeitar o limite público de aproximadamente 1 requisição por segundo.
  const zoom = Number(req.query.zoom);
  const areaCount = Number.isFinite(zoom) ? (zoom <= 7 ? 5 : zoom <= 10 ? 3 : 1) : 1;
  const latSpan = hasBounds ? Math.abs(lamax - lamin) : 4;
  const lonSpan = hasBounds ? Math.abs(lomax - lomin) : 4;
  const dLat = Math.max(1.8, Math.min(5.0, latSpan * 0.55));
  const dLon = Math.max(2.0, Math.min(6.0, lonSpan * 0.55));
  const centers = [[lat, lon]];
  if (areaCount >= 3) centers.push([lat, lon - dLon], [lat, lon + dLon]);
  if (areaCount >= 5) centers.push([lat - dLat, lon], [lat + dLat, lon]);

  const datasets = await Promise.all(centers.map(([clat, clon]) => fetchAdsbFiArea(clat, clon, 250)));
  const aircraftMap = new Map();
  datasets.forEach(data => {
    (Array.isArray(data?.ac) ? data.ac : []).forEach(a => {
      const key = String(a?.hex || `${a?.flight || ""}:${a?.lat || ""}:${a?.lon || ""}`).trim().toUpperCase();
      if (key) aircraftMap.set(key, a);
    });
  });
  const aircraft = [...aircraftMap.values()];
  const data = datasets.find(d => d?.now != null) || datasets[0] || {};

  const flights = aircraft
    .filter(a => Number.isFinite(Number(a?.lat)) && Number.isFinite(Number(a?.lon)))
    .map(a => {
      const rawAlt = a?.alt_baro;
      const onGround = rawAlt === "ground" || rawAlt === null || rawAlt === undefined;
      const alt = Number.isFinite(Number(rawAlt)) ? Math.round(Number(rawAlt)) : null;
      const speed = Number.isFinite(Number(a?.gs)) ? Math.round(Number(a.gs)) : null;
      const heading = Number.isFinite(Number(a?.track)) ? Number(a.track) : null;
      return {
        callsign: String(a?.flight || "").trim(),
        hex: String(a?.hex || "").trim().toUpperCase(),
        reg: String(a?.r || "").trim().toUpperCase(),
        type: String(a?.t || "").trim().toUpperCase() || "ADS-B",
        model: String(a?.desc || "").trim(),
        originCountry: "",
        from: "",
        to: "",
        lat: Number(a.lat),
        lon: Number(a.lon),
        alt,
        speed,
        heading,
        source: "real",
        provider: "adsb.fi",
        onGround,
        squawk: a?.squawk || null,
        verticalRate: Number.isFinite(Number(a?.baro_rate)) ? Number(a.baro_rate) : null,
        category: a?.category || null,
        seen: Number.isFinite(Number(a?.seen)) ? Number(a.seen) : null,
        distanceNm: Number.isFinite(Number(a?.dst)) ? Number(a.dst) : null
      };
    });

  return { flights, now: data?.now ?? null, total: flights.length, dist:250, areas:centers.length };
}

// Tráfego aéreo real via adsb.fi. A API pública é gratuita, sem chave,
// limitada a 1 consulta por segundo e permite consultas de até 250 NM.
app.get("/api/flights", async (req, res) => {
  try {
    const result = await getAdsbFiFlights(req);
    res.json({
      source: "adsb.fi",
      time: result.now,
      count: result.flights.length,
      flights: result.flights,
      radiusNm: result.dist,
      areas: result.areas || 1,
      notice: "Tráfego ADS-B em tempo real fornecido por adsb.fi para uso pessoal e não comercial."
    });
  } catch (error) {
    console.error("Erro adsb.fi:", error?.message || error);
    res.status(502).json({
      error: "Não foi possível obter o tráfego aéreo",
      source: "adsb.fi",
      message: error?.message || "network error"
    });
  }
});

const planespottersPhotoCache = new Map();
const routeCache = new Map();

const aircraftMetaCache = new Map();

function manufacturerCountry(manufacturer="") {
  const m=String(manufacturer||"").trim().toLowerCase();
  if(!m) return null;
  if(m.includes("airbus")) return "França";
  if(m.includes("boeing")) return "Estados Unidos";
  if(m.includes("embraer")) return "Brasil";
  if(m.includes("comac")) return "China";
  if(m.includes("bombardier")) return "Canadá";
  if(m.includes("de havilland")) return "Canadá";
  if(m.includes("atr")) return "França / Itália";
  if(m.includes("cessna")) return "Estados Unidos";
  if(m.includes("gulfstream")) return "Estados Unidos";
  if(m.includes("lockheed")) return "Estados Unidos";
  if(m.includes("fokker")) return "Países Baixos";
  if(m.includes("tupolev") || m.includes("sukhoi")) return "Rússia";
  return null;
}

async function fetchAircraftMetadata({hex="", registration="", callsign=""}={}) {
  const h = String(hex || "").trim().toUpperCase();
  let reg = String(registration || "").trim().toUpperCase();
  const key = `${h}|${reg}`;
  const cached = aircraftMetaCache.get(key);
  if (cached && Date.now() - cached.time < 6 * 60 * 60 * 1000) return cached.data;

  let meta = { registration: reg || null, country: null, countryCode: null, manufacturer: null, manufacturerCountry: null, model: null, yearBuilt: null, age: null, serialNumber: null, operator: null, source: null };

  // Base pública: ADSBDB resolve matrícula, país, fabricante/modelo e operador.
  try {
    const lookup = reg || h;
    if (lookup) {
      const r = await fetch(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(lookup)}`, { headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" } });
      if (r.ok) {
        const j = await r.json();
        const a = j?.response?.aircraft || j?.aircraft || j;
        meta.registration = meta.registration || a?.registration || null;
        meta.country = a?.registered_owner_country_name || null;
        meta.countryCode = a?.registered_owner_country_iso_name || null;
        meta.manufacturer = a?.manufacturer || null;
        meta.model = a?.type || a?.icao_type || null;
        meta.operator = a?.registered_owner || null;
        meta.source = "ADSBDB";
      }
    }
  } catch (e) {
    console.warn("ADSBDB metadata falhou:", e?.message || e);
  }

  // Consulta combinada do ADSBDB: quando há callsign, pode retornar aeronave + rota.
  if (callsign && (h || reg)) {
    try {
      const lookup = h || reg;
      const r = await fetch(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(lookup)}?callsign=${encodeURIComponent(callsign)}`, { headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" } });
      if (r.ok) {
        const j = await r.json();
        const a = j?.response?.aircraft || j?.aircraft || null;
        if (a) {
          meta.registration = a.registration || meta.registration;
          meta.country = a.registered_owner_country_name || meta.country;
          meta.countryCode = a.registered_owner_country_iso_name || meta.countryCode;
          meta.manufacturer = a.manufacturer || meta.manufacturer;
          meta.model = a.type || a.icao_type || meta.model;
          meta.operator = a.registered_owner || meta.operator;
          meta.source = meta.source ? `${meta.source}+ADSBDB` : "ADSBDB";
        }
      }
    } catch (e) {
      console.warn("ADSBDB combinado falhou:", e?.message || e);
    }
  }

  // Fallback HexDB: fabricante, tipo, operador e matrícula sem chave.
  if ((h || reg) && (!meta.manufacturer || !meta.registration || !meta.operator)) {
    try {
      const lookup = h || reg;
      const r = await fetch(`https://hexdb.io/api/v1/aircraft/${encodeURIComponent(lookup)}`, { headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" } });
      if (r.ok) {
        const a = await r.json();
        meta.registration = meta.registration || a?.Registration || null;
        meta.manufacturer = meta.manufacturer || a?.Manufacturer || null;
        meta.model = meta.model || a?.Type || a?.ICAOTypeCode || null;
        meta.operator = meta.operator || a?.RegisteredOwners || null;
        meta.source = meta.source ? `${meta.source}+HexDB` : "HexDB";
      }
    } catch (e) {
      console.warn("HexDB metadata falhou:", e?.message || e);
    }
  }

  meta.manufacturerCountry = manufacturerCountry(meta.manufacturer);

  // Base mundial com ano de fabricação. A chave é opcional e fica somente no servidor.
  // SkyLink oferece uma base mundial e retorna registration, country e year_built.
  const apiKey = process.env.SKYLINK_API_KEY || process.env.AIRCRAFT_DB_API_KEY || "";
  if (apiKey && (h || reg)) {
    try {
      const host = "skylink-api.p.rapidapi.com";
      const endpoint = h
        ? `https://${host}/v3/aircraft/icao24/${encodeURIComponent(h)}`
        : `https://${host}/v3/aircraft/registration/${encodeURIComponent(reg)}`;
      const r = await fetch(endpoint, { headers: { Accept: "application/json", "x-rapidapi-key": apiKey, "x-rapidapi-host": host } });
      if (r.ok) {
        const j = await r.json();
        const a = j?.aircraft || j?.response?.aircraft || null;
        if (a) {
          meta.registration = a.registration || meta.registration;
          meta.country = a.country || meta.country;
          meta.countryCode = a.country_code || meta.countryCode;
          meta.manufacturer = a.manufacturer || meta.manufacturer;
          meta.model = a.type_name || meta.model;
          meta.operator = a.owner_operator || meta.operator;
          meta.yearBuilt = Number(a.year_built) || null;
          meta.serialNumber = a.serial_number || null;
          meta.source = meta.source ? `${meta.source}+SkyLink` : "SkyLink";
        }
      }
    } catch (e) {
      console.warn("SkyLink metadata falhou:", e?.message || e);
    }
  }

  if (Number.isFinite(Number(meta.yearBuilt))) {
    meta.yearBuilt = Number(meta.yearBuilt);
    meta.age = Math.max(0, new Date().getUTCFullYear() - meta.yearBuilt);
  }
  aircraftMetaCache.set(key, { time: Date.now(), data: meta });
  return meta;
}

app.get("/api/aircraft-meta", auth, async (req, res) => {
  const hex = String(req.query.hex || "").trim().toUpperCase();
  const registration = String(req.query.registration || "").trim().toUpperCase();
  const callsign = String(req.query.callsign || "").trim().toUpperCase();
  if (!hex && !registration) return res.status(400).json({ ok: false, error: "Informe ICAO24 ou matrícula" });
  try {
    const meta = await fetchAircraftMetadata({ hex, registration, callsign });
    return res.json({ ok: true, ...meta, year: meta.yearBuilt, ageYears: meta.age, manufacturerCountry: meta.manufacturerCountry });
  } catch (error) {
    return res.status(502).json({ ok: false, error: "Não foi possível consultar os dados da aeronave" });
  }
});


async function fetchFlightRoute(callsign, {hex="", registration=""}={}) {
  const cs = String(callsign || "").trim().toUpperCase();
  if (!cs) return null;
  const cached = routeCache.get(cs);
  if (cached && Date.now() - cached.time < 10 * 60 * 1000) return cached.data;

  const providers = [];
  const lookup = String(hex || registration || "").trim().toUpperCase();
  if (lookup) providers.push(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(lookup)}?callsign=${encodeURIComponent(cs)}`);
  providers.push(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cs)}`);
  providers.push(`https://hexdb.io/api/v1/route/icao/${encodeURIComponent(cs)}`);

  for (const url of providers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
      const data = await response.json().catch(() => null);
      clearTimeout(timeout);
      if (!response.ok) continue;

      const fr = data?.response?.flightroute || data?.flightroute || data?.route || data;
      const origin = fr?.origin || data?.response?.origin || data?.origin;
      const destination = fr?.destination || data?.response?.destination || data?.destination;
      if (!origin || !destination) continue;

      const result = {
        from: String(origin.iata_code || origin.iata || origin.icao_code || origin.icao || "").toUpperCase(),
        to: String(destination.iata_code || destination.iata || destination.icao_code || destination.icao || "").toUpperCase(),
        fromName: origin.name || origin.municipality || "",
        toName: destination.name || destination.municipality || "",
        fromIcao: origin.icao_code || origin.icao || "",
        toIcao: destination.icao_code || destination.icao || "",
        fromLat: Number(origin.latitude ?? origin.lat ?? origin.latitude_deg ?? origin.lat_deg),
        fromLon: Number(origin.longitude ?? origin.lon ?? origin.lng ?? origin.longitude_deg ?? origin.lon_deg),
        toLat: Number(destination.latitude ?? destination.lat ?? destination.latitude_deg ?? destination.lat_deg),
        toLon: Number(destination.longitude ?? destination.lon ?? destination.lng ?? destination.longitude_deg ?? destination.lon_deg),
        source: url.includes("adsbdb") ? "ADSBDB" : "HexDB"
      };
      if (!result.from && !result.to) continue;
      routeCache.set(cs, { time: Date.now(), data: result });
      return result;
    } catch (error) {
      console.warn("Falha ao buscar rota", cs, error?.cause?.code || error?.code || error?.message);
    }
  }

  routeCache.set(cs, { time: Date.now(), data: null });
  return null;
}


// Banco mundial de aeroportos (OurAirports). Mantemos o CSV em cache no servidor
// e entregamos somente os aeroportos dentro da área visível do mapa.
let worldAirportsCache = null;
let worldAirportsCacheAt = 0;

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

async function loadWorldAirports() {
  if (worldAirportsCache && Date.now() - worldAirportsCacheAt < 24 * 60 * 60 * 1000) {
    return worldAirportsCache;
  }
  const url = "https://davidmegginson.github.io/ourairports-data/airports.csv";
  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) throw new Error(`OurAirports HTTP ${response.status}`);
  const text = await response.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) throw new Error("OurAirports vazio");
  const headers = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const wantedTypes = new Set(["large_airport", "medium_airport", "small_airport"]);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const c = parseCsvLine(lines[i]);
    const type = c[idx.type] || "";
    if (!wantedTypes.has(type)) continue;
    const lat = Number(c[idx.latitude_deg]);
    const lon = Number(c[idx.longitude_deg]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (c[idx.closed] === "yes") continue;
    const iata = String(c[idx.iata_code] || "").trim().toUpperCase();
    const icao = String(c[idx.icao_code] || c[idx.gps_code] || "").trim().toUpperCase();
    const ident = String(c[idx.ident] || "").trim().toUpperCase();
    data.push({
      code: iata || icao || ident,
      iata,
      icao,
      ident,
      name: c[idx.name] || ident,
      city: c[idx.municipality] || "",
      lat,
      lon,
      type,
      scheduled: String(c[idx.scheduled_service] || "").toLowerCase() === "yes"
    });
  }
  worldAirportsCache = data;
  worldAirportsCacheAt = Date.now();
  console.log(`Aeroportos mundiais carregados: ${data.length}`);
  return data;
}

app.get("/api/airports", async (req, res) => {
  try {
    const all = await loadWorldAirports();
    const minLat = Number(req.query.minLat);
    const maxLat = Number(req.query.maxLat);
    const minLon = Number(req.query.minLon);
    const maxLon = Number(req.query.maxLon);
    const zoom = Number(req.query.zoom || 5);
    const validBounds = [minLat, maxLat, minLon, maxLon].every(Number.isFinite);
    const west = validBounds ? minLon : -180;
    const east = validBounds ? maxLon : 180;
    const south = validBounds ? Math.max(-90, minLat) : -90;
    const north = validBounds ? Math.min(90, maxLat) : 90;

    // Em zoom mundial mostramos os aeroportos maiores; aproximando, liberamos
    // aeroportos pequenos e todos os aeroportos com serviço programado.
    const visible = all.filter(a => {
      if (a.lat < south || a.lat > north) return false;
      const lonOk = west <= east ? (a.lon >= west && a.lon <= east) : (a.lon >= west || a.lon <= east);
      if (!lonOk) return false;
      if (zoom < 4) return a.type === "large_airport" || a.type === "medium_airport";
      if (zoom < 7) return a.type !== "small_airport" || a.scheduled;
      return true;
    });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({ ok: true, count: visible.length, airports: visible });
  } catch (error) {
    console.error("Falha ao carregar aeroportos mundiais:", error?.message || error);
    return res.status(502).json({ ok: false, error: "Não foi possível carregar a base mundial de aeroportos" });
  }
});


const airportTrafficCache = new Map();
const airportRunwayCache = {time:0,data:null};
async function loadRunways(){
  if(airportRunwayCache.data && Date.now()-airportRunwayCache.time<6*3600e3) return airportRunwayCache.data;
  const r=await fetch("https://davidmegginson.github.io/ourairports-data/runways.csv",{headers:{"User-Agent":"AERO-RADAR/3.0"}});
  if(!r.ok) throw new Error(`runways HTTP ${r.status}`);
  const text=await r.text(); const lines=text.split(/\r?\n/); const head=parseCsvLine(lines.shift()||""); const idx=Object.fromEntries(head.map((v,i)=>[v,i])); const rows=[];
  for(const line of lines){if(!line.trim())continue;const c=parseCsvLine(line);rows.push({airport_ident:String(c[idx.airport_ident]||"").toUpperCase(),ident1:c[idx.le_ident]||"",ident2:c[idx.he_ident]||"",length_ft:Number(c[idx.length_ft])||0,width_ft:Number(c[idx.width_ft])||0,surface:c[idx.surface]||""});}
  airportRunwayCache.data=rows;airportRunwayCache.time=Date.now();return rows;
}
function parseMetarJson(j){const x=Array.isArray(j)?j[0]:j?.data?.[0]||j?.data||j?.results?.[0]||j?.results||j; if(!x||typeof x!=='object')return null;return {raw:x.rawOb||x.raw_text||x.raw||x.metar||"",temp_c:x.temp??x.temp_c,wind_dir_degrees:x.wdir??x.wind_dir_degrees,wind_speed_kt:x.wspd??x.wind_speed_kt,visibility_statute_mi:x.visib??x.visibility_statute_mi,flight:x.fltCat||x.flight_category||x.wx||"",observed:x.reportTime||x.obsTime||x.report_time||""};}
app.get("/api/airport/:icao", async (req,res)=>{
  const icao=String(req.params.icao||"").trim().toUpperCase(); const lat=Number(req.query.lat), lon=Number(req.query.lon), name=String(req.query.name||"");
  if(!icao || !Number.isFinite(lat)||!Number.isFinite(lon)) return res.status(400).json({error:"Aeroporto inválido"});
  try{
    const all=await loadWorldAirports(); const a=all.find(v=>String(v.icao||v.code||"").toUpperCase()===icao)||{icao,name,lat,lon};
    const runways=(await loadRunways()).filter(r=>r.airport_ident===icao);
    let metar=null; try{const mr=await fetch(`https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=json`,{headers:{"Accept":"application/json","User-Agent":"AERO-RADAR/3.0"}});if(mr.ok)metar=parseMetarJson(await mr.json());}catch(e){console.warn("METAR falhou",icao,e.message)}
    const cache=airportTrafficCache.get(icao); let traffic=cache&&Date.now()-cache.time<30000?cache.data:null;
    if(!traffic){
      const distNm=70;
      const url=`https://opendata.adsb.fi/api/v3/lat/${encodeURIComponent(lat)}/lon/${encodeURIComponent(lon)}/dist/${distNm}`;
      const rr=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"AERO-RADAR/3.0"}});
      const jj=rr.ok?await rr.json():{ac:[]};
      const aircraft=Array.isArray(jj.ac)?jj.ac:[];
      const candidates=aircraft.filter(s=>Number.isFinite(Number(s.lat))&&Number.isFinite(Number(s.lon))).slice(0,120);
      const enriched=[];
      for(let i=0;i<candidates.length;i+=10){
        const batch=candidates.slice(i,i+10);
        const vals=await Promise.all(batch.map(async s=>{
          const cs=String(s.flight||s.callsign||"").trim().toUpperCase();
          let route=null;
          try{route=await fetchFlightRoute(cs,{hex:String(s.hex||"").toUpperCase(),registration:String(s.r||"").toUpperCase()})}catch(_){}
          return {
            callsign:cs,
            hex:String(s.hex||"").toUpperCase(),
            reg:String(s.r||"").toUpperCase(),
            lat:Number(s.lat),
            lon:Number(s.lon),
            alt:s.alt_baro!=null?Number(s.alt_baro):null,
            speed:s.gs!=null?Math.round(Number(s.gs)):null,
            onGround:Boolean(s.on_ground),
            from:route?.from||"",
            to:route?.to||"",
            fromName:route?.fromName||"",
            toName:route?.toName||"",
            model:String(s.t||s.type||""),
            status:Boolean(s.on_ground)?"EM SOLO":"AO VIVO",
            distanceNm:s.distanceNm!=null?Number(s.distanceNm):null
          };
        }));
        enriched.push(...vals);
      }
      const airportKeys=new Set([String(a.iata||"").toUpperCase(),String(a.icao||icao).toUpperCase()].filter(Boolean));
      const ground=enriched.filter(f=>f.onGround);
      const arrivals=enriched.filter(f=>airportKeys.has(String(f.to||"").toUpperCase())).map(f=>({...f,status:"VINDO PARA POUSAR"}));
      const departures=enriched.filter(f=>airportKeys.has(String(f.from||"").toUpperCase())).map(f=>({...f,status:"PARTIDA"}));
      traffic={arrivals,departures,ground}; airportTrafficCache.set(icao,{time:Date.now(),data:traffic});
    }
    let photo=null; try{
      const jpUrl=`https://www.jetphotos.com/registration/${encodeURIComponent(icao)}`;
      const jr=await fetch(jpUrl,{headers:{"User-Agent":"Mozilla/5.0 (compatible; AERO-RADAR/1.0; +https://ricadupradu-dev.github.io/AERORADAR1.0-DEMO/)"},redirect:"follow"});
      if(jr.ok){
        const html=await jr.text();
        const urls=[]; const seen=new Set();
        const re=/https?:\/\/cdn\.jetphotos\.com\/[^\"'<>\s\\]+/gi; let m;
        while((m=re.exec(html)) && urls.length<8){
          const u=m[0].replace(/&amp;/g,"&");
          if(!seen.has(u)){seen.add(u);urls.push(u);}
        }
        if(urls.length){
          photo={provider:"JetPhotos",pageUrl:jpUrl,photos:urls.slice(0,5).map((url,i)=>({url,source:"JetPhotos",index:i+1}))};
        }
      }
    }catch(_){ }
    return res.json({ok:true,airport:{...a,icao:a.icao||icao},metar,runways,photo,...traffic});
  }catch(e){console.error("airport endpoint",e);return res.status(502).json({error:"Não foi possível carregar os dados do aeroporto"});}
});

app.get("/api/route", async (req, res) => {
  const callsign = String(req.query.callsign || req.query.flight || "").trim().toUpperCase();
  const hex = String(req.query.hex || "").trim().toUpperCase();
  const registration = String(req.query.registration || "").trim().toUpperCase();
  if (!callsign) return res.status(400).json({ ok: false, error: "Informe callsign" });
  const route = await fetchFlightRoute(callsign, { hex, registration });
  if (!route) return res.status(404).json({ ok: false, callsign, error: "Rota não encontrada" });
  return res.json({ ok: true, callsign, ...route });
});

async function fetchJetPhotosViaJetAPI(registration) {
  const reg = String(registration || "").trim().toUpperCase();
  if (!reg) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const jetApiBase = process.env.JETAPI_URL || "https://www.jetapi.dev/api";
    const separator = jetApiBase.includes("?") ? "&" : "?";
    const url = `${jetApiBase}${separator}reg=${encodeURIComponent(reg)}&photos=3&only_jp=true`;
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`JetAPI HTTP ${response.status}`);
    const payload = await response.json();
    const candidates = [];
    const add = v => { if (Array.isArray(v)) candidates.push(...v); };
    add(payload?.photos); add(payload?.data?.photos); add(payload?.jetPhotos);
    add(payload?.data?.jetPhotos); add(payload?.results?.photos); add(payload?.results?.jetPhotos);
    // JetAPI atualmente retorna as fotos no campo Images.
    add(payload?.Images); add(payload?.images); add(payload?.data?.Images); add(payload?.data?.images);
    const out=[]; const seen=new Set();
    for (const item of candidates) {
      if (!item || typeof item !== "object") continue;
      const thumb = item.thumbnailUrl || item.thumbnail_url || item.Thumbnail || item.thumbnail || item.thumb || item.imageUrl || item.image_url || item.Image || item.image || item.src || null;
      const photo = item.photoUrl || item.photo_url || item.Link || item.link || item.url || item.pageUrl || item.page_url || item.href || item.Image || thumb || null;
      if (!thumb && !photo) continue;
      const key=String(photo||thumb); if(seen.has(key)) continue; seen.add(key);
      out.push({
        thumbnailUrl: thumb || photo,
        photoUrl: photo || thumb,
        photographer: item.photographer || item.Photographer || item.photographer_name || item.credit || null,
        source: "JetPhotos"
      });
      if(out.length>=3) break;
    }
    return out;
  } finally { clearTimeout(timeout); }
}


async function fetchPlanespottersPhoto(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://api.planespotters.net/pub/photos/${path}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AERO-RADAR/3.0 (+http://localhost:3000)"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Planespotters HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

app.get(
  "/api/photos",
  async (req, res) => {
    const hex = String(req.query.hex || "").trim().toUpperCase();
    const requestedReg = String(req.query.registration || "").trim().toUpperCase();
    const callsign = String(req.query.callsign || "").trim().toUpperCase();
    if (!hex && !requestedReg && !callsign) {
      return res.status(400).json({ error: "ICAO24 ou matrícula não informado" });
    }

    const key = `${hex}|${requestedReg}`;
    const fallbackUrl = hex
      ? `https://www.planespotters.net/hex/${encodeURIComponent(hex)}`
      : `https://www.planespotters.net/photos/reg/${encodeURIComponent(requestedReg)}`;
    const now = Date.now();
    const cached = planespottersPhotoCache.get(key);
    if (cached && now - cached.time < 24 * 60 * 60 * 1000) {
      return res.json(cached.data);
    }

    let registration = requestedReg || null;
    let lastError = null;

    // OpenSky fornece o ICAO24, mas não a matrícula. Primeiro tentamos descobrir
    // a matrícula em uma fonte pública de enriquecimento e só então consultamos
    // o Planespotters pelo registro, que é uma rota suportada pelo serviço.
    if (!registration && hex) {
      try {
        const metaResponse = await fetch(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(hex)}`, {
          headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/1.0" }
        });
        if (metaResponse.ok) {
          const meta = await metaResponse.json();
          registration = meta?.aircraft?.registration || meta?.response?.aircraft?.registration || meta?.registration || null;
          if (registration) registration = String(registration).trim().toUpperCase();
        }
      } catch (e) {
        lastError = e;
      }
    }

    // Fallback público: o HexDB também resolve ICAO24 -> matrícula.
    // Isso é importante quando o ADSBDB não responde ou não retorna registro.
    if (!registration && hex) {
      try {
        const hexDbResponse = await fetch(`https://hexdb.io/api/v1/aircraft/${encodeURIComponent(hex)}`, {
          headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0 (+http://localhost:3000)" }
        });
        if (hexDbResponse.ok) {
          const aircraft = await hexDbResponse.json();
          registration = aircraft?.Registration || aircraft?.registration || null;
          if (registration) registration = String(registration).trim().toUpperCase();
        }
      } catch (e) {
        lastError = e;
      }
    }

    if (!registration && callsign) {
      try {
        const lookup = hex || requestedReg || callsign;
        const metaResponse = await fetch(`https://api.adsbdb.com/v0/${hex || requestedReg ? `aircraft/${encodeURIComponent(lookup)}` : `callsign/${encodeURIComponent(callsign)}`}`, {
          headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" }
        });
        if (metaResponse.ok) {
          const meta = await metaResponse.json();
          registration = meta?.response?.aircraft?.registration || meta?.response?.flightroute?.aircraft?.registration || registration;
          if (registration) registration = String(registration).trim().toUpperCase();
        }
      } catch (e) { lastError = e; }
    }

    const attempts = [];
    if (registration) attempts.push({ kind: "reg", value: registration });
    if (hex) attempts.push({ kind: "hex", value: hex });

    // Consultamos registro e HEX e juntamos as fotos. Isso evita o problema
    // em que a consulta por matrícula retorna apenas 1 foto, enquanto a
    // consulta por HEX possui outras imagens do mesmo avião.
    const mergedPhotos = [];
    const seenPhotoUrls = new Set();
    let firstPhoto = null;

    for (const attempt of attempts) {
      try {
        const payload = await fetchPlanespottersPhoto(`${attempt.kind}/${encodeURIComponent(attempt.value)}`);
        const photos = Array.isArray(payload.photos) ? payload.photos : [];

        for (const item of photos) {
          const thumbnailUrl =
            (typeof item?.thumbnail === "string" ? item.thumbnail : null) ||
            item?.thumbnail?.src || item?.thumbnail?.url ||
            item?.thumbnail_large?.src || item?.thumbnail_large?.url || null;
          const photoUrl = item?.link || item?.url || fallbackUrl;
          const photographer = item?.photographer || item?.photographer_name || null;
          if (!thumbnailUrl) continue;

          const uniqueKey = String(photoUrl || thumbnailUrl);
          if (seenPhotoUrls.has(uniqueKey)) continue;
          seenPhotoUrls.add(uniqueKey);
          const normalized = { thumbnailUrl, photoUrl, photographer };
          if (!firstPhoto) firstPhoto = normalized;
          mergedPhotos.push(normalized);
          if (mergedPhotos.length >= 6) break;
        }
      } catch (error) {
        lastError = error;
      }
      if (mergedPhotos.length >= 6) break;
    }

    const jetphotosUrl = registration
      ? `https://www.jetphotos.com/photo/search?keywords=${encodeURIComponent(registration)}`
      : `https://www.jetphotos.com/photo/search?keywords=${encodeURIComponent(hex)}`;
    let jetPhotos = [];
    if (registration) {
      try { jetPhotos = await fetchJetPhotosViaJetAPI(registration); }
      catch (error) {
        console.warn("JetPhotos/JetAPI indisponível — seguindo apenas com Planespotters:", error.code || error.message);
      }
    }

    if (!firstPhoto && (hex || registration)) {
      try {
        const lookup = registration || hex;
        const rr = await fetch(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(lookup)}`, { headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" } });
        if (rr.ok) {
          const jj = await rr.json();
          const aa = jj?.response?.aircraft || jj?.aircraft || null;
          const thumb = aa?.url_photo_thumbnail || null;
          const full = aa?.url_photo || thumb || null;
          if (thumb) {
            firstPhoto = { thumbnailUrl: thumb, photoUrl: full || thumb, photographer: null };
            mergedPhotos.push(firstPhoto);
          }
        }
      } catch (e) { lastError = e; }
    }

    const data = {
      hex: hex || null,
      registration: registration || null,
      provider: "Planespotters.net + JetPhotos",
      photos: mergedPhotos.slice(0, 3),
      jetPhotos: jetPhotos.slice(0, 3),
      thumbnailUrl: firstPhoto?.thumbnailUrl || null,
      photoUrl: firstPhoto?.photoUrl || fallbackUrl,
      searchUrl: fallbackUrl,
      jetphotosUrl,
      photographer: firstPhoto?.photographer || null,
      attribution: firstPhoto?.photographer ? `© ${firstPhoto.photographer} · Planespotters.net` : "Planespotters.net",
      found: mergedPhotos.length > 0 || jetPhotos.length > 0
    };
    planespottersPhotoCache.set(key, { time: now, data });
    return res.json(data);
  }
);

app.get(
  "/api/radio",
  (req, res) =>
    res.json({
      message:
        "Use fontes externas autorizadas",

      liveatc:
        "https://www.liveatc.net/feedindex.php?type=all"
    })
);

app.post(
  "/api/auth/register",
  authRateLimit,
  async (req, res) => {
    try {
      let {
        name,
        email,
        password
      } = req.body;

      if (
        !name ||
        !email ||
        !password ||
        password.length < 8
      ) {
        return res
          .status(400)
          .json({
            error:
              "Nome, e-mail e senha de pelo menos 8 caracteres são obrigatórios."
          });
      }

      let hash =
        await bcrypt.hash(
          password,
          12
        );

      let r =
        await pool.query(
          "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email",
          [
            name,
            email.toLowerCase(),
            hash
          ]
        );

      setCookie(
        res,
        token(r.rows[0])
      );

      res.json({
        user:
          r.rows[0]
      });

    } catch (e) {
      res
        .status(400)
        .json({
          error:
            e.code === "23505"
              ? "E-mail já cadastrado."
              : "Não foi possível criar a conta."
        });
    }
  }
);

app.post(
  "/api/auth/login",
  authRateLimit,
  async (req, res) => {
    try {
      let {
        email,
        password
      } = req.body;

      let r =
        await pool.query(
          "SELECT id,name,email,password_hash FROM users WHERE email=$1",
          [
            String(email).toLowerCase()
          ]
        );

      if (
        !r.rows[0] ||
        !(await bcrypt.compare(
          password,
          r.rows[0]
            .password_hash
        ))
      ) {
        return res
          .status(401)
          .json({
            error:
              "E-mail ou senha inválidos."
          });
      }

      let u =
        r.rows[0];

      delete u.password_hash;

      setCookie(
        res,
        token(u)
      );

      res.json({
        user: u
      });

    } catch (e) {
      res
        .status(500)
        .json({
          error:
            "Erro no servidor."
        });
    }
  }
);

app.get(
  "/api/auth/me",
  auth,
  (req, res) =>
    res.json({
      user:
        req.user
    })
);

app.post(
  "/api/auth/logout",
  (req, res) => {
    res.clearCookie(
      "aero_token"
    );

    res.json({
      ok: true
    });
  }
);

const fr24MostTrackedCache = { time: 0, flights: [] };
function findMostTrackedArray(value, depth=0){
  if(depth>6 || value==null) return [];
  if(Array.isArray(value)){
    const scored=value.filter(x=>x && typeof x==='object' && (x.clicks!=null || x.followers!=null || x.flight || x.callsign));
    if(scored.length) return scored;
    for(const item of value){ const found=findMostTrackedArray(item,depth+1); if(found.length)return found; }
  }
  if(typeof value==='object'){
    for(const [k,v] of Object.entries(value)){
      if(/most|tracked|data|flights|results/i.test(k)){ const found=findMostTrackedArray(v,depth+1); if(found.length)return found; }
    }
  }
  return [];
}
function normalizeMostTrackedItem(x){
  const flight=x.flight || x.flight_number || x.flightNumber || x.identification?.number?.default || x.callsign || "";
  const callsign=x.callsign || x.identification?.callsign || "";
  const clicks=Number(x.clicks ?? x.followers ?? x.following ?? x.views ?? x.tracking_count);
  const fromIata=x.from_iata || x.origin_iata || x.orig_iata || x.airport_origin_code_iata || x.from?.iata || x.origin?.iata || "";
  const toIata=x.to_iata || x.destination_iata || x.dest_iata || x.airport_destination_code_iata || x.to?.iata || x.destination?.iata || "";
  const fromCity=x.from_city || x.origin_city || x.from?.city || x.origin?.city || "";
  const toCity=x.to_city || x.destination_city || x.to?.city || x.destination?.city || "";
  const model=x.model || x.aircraft_model || x.aircraft?.model || x.aircraft?.type || x.type || "";
  const id=x.flight_id || x.fr24_id || x.id || "";
  return { flight, callsign, clicks:Number.isFinite(clicks)?clicks:null, from:fromIata, to:toIata, fromCity, toCity, model, url:id?`https://www.flightradar24.com/${encodeURIComponent(callsign||flight)}/${encodeURIComponent(id)}`:`https://www.flightradar24.com/${encodeURIComponent(callsign||flight)}` };
}
app.get("/api/fr24-most-tracked", async (req,res)=>{
  if(Date.now()-fr24MostTrackedCache.time < 60*1000 && fr24MostTrackedCache.flights.length){
    return res.json({ok:true,source:"Flightradar24",updatedAt:fr24MostTrackedCache.time,flights:fr24MostTrackedCache.flights});
  }
  const url="https://www.flightradar24.com/flights/most-tracked";
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(url,{headers:{Accept:"application/json, text/plain, */*","Accept-Language":"pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7","User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",Referer:"https://www.flightradar24.com/"},redirect:"follow",signal:controller.signal});
    const text=await response.text();
    if(!response.ok) throw new Error(`FR24 HTTP ${response.status}`);
    let payload=null;
    try{payload=JSON.parse(text);}catch(_){
      const matches=text.match(/\{[\s\S]{0,200000}\}/g)||[];
      for(const m of matches.slice(0,20)){
        try{const j=JSON.parse(m);const arr=findMostTrackedArray(j);if(arr.length){payload=j;break;}}catch(_){}
      }
    }
    const raw=findMostTrackedArray(payload);
    const flights=raw.map(normalizeMostTrackedItem).filter(x=>x.flight||x.callsign).slice(0,10);
    if(!flights.length) throw new Error("FR24 não retornou o ranking em formato público compatível");
    fr24MostTrackedCache.time=Date.now(); fr24MostTrackedCache.flights=flights;
    res.json({ok:true,source:"Flightradar24",updatedAt:fr24MostTrackedCache.time,flights});
  }catch(error){
    console.warn("FR24 most tracked indisponível:",error?.message||error);
    res.status(502).json({ok:false,source:"Flightradar24",error:"O ranking do Flightradar24 não pôde ser obtido automaticamente agora.",details:error?.message||"fetch failed",flights:[]});
  }finally{clearTimeout(timeout);}
});

app.get("/api/jetapi-test", auth, async (req, res) => {
  const registration = String(req.query.registration || req.query.reg || "").trim().toUpperCase();
  if (!registration) return res.status(400).json({ ok:false, error:"Informe registration, por exemplo PS-LBB" });
  const jetApiBase = process.env.JETAPI_URL || "https://www.jetapi.dev/api";
  const separator = jetApiBase.includes("?") ? "&" : "?";
  const url = `${jetApiBase}${separator}reg=${encodeURIComponent(registration)}&photos=3&only_jp=true`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const started = Date.now();
  try {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "AERO-RADAR/3.0" }, signal: controller.signal });
    const text = await response.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) {}
    return res.status(response.ok ? 200 : 502).json({ ok: response.ok, status: response.status, ms: Date.now()-started, endpoint: jetApiBase, registration, data: data ?? text.slice(0,1000) });
  } catch (error) {
    return res.status(502).json({ ok:false, status:0, ms: Date.now()-started, endpoint: jetApiBase, registration, error: error?.cause?.code || error?.code || error?.message || "fetch failed", cause: error?.cause?.message || null });
  } finally { clearTimeout(timeout); }
});


app.get("/api/my-flights", auth, async (req,res)=>{try{const r=await pool.query("SELECT id,flight_number,flight_date,origin,destination,airline,seat FROM my_flights WHERE user_id=$1 ORDER BY flight_date DESC,id DESC",[req.user.id]);res.json({ok:true,flights:r.rows});}catch(e){res.status(500).json({error:"Não foi possível carregar seus voos"});}});
app.post("/api/my-flights", auth, async (req,res)=>{const b=req.body||{};if(!b.flight_number||!b.flight_date||!b.origin||!b.destination)return res.status(400).json({error:"Preencha voo, data, origem e destino"});try{const r=await pool.query("INSERT INTO my_flights(user_id,flight_number,flight_date,origin,destination,airline,seat) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",[req.user.id,String(b.flight_number).trim().toUpperCase(),b.flight_date,String(b.origin).trim().toUpperCase(),String(b.destination).trim().toUpperCase(),b.airline||"",b.seat||""]);res.status(201).json({ok:true,flight:r.rows[0]});}catch(e){res.status(500).json({error:"Não foi possível salvar o voo"});}});
app.delete("/api/my-flights/:id", auth, async (req,res)=>{try{await pool.query("DELETE FROM my_flights WHERE id=$1 AND user_id=$2",[req.params.id,req.user.id]);res.json({ok:true});}catch(e){res.status(500).json({error:"Não foi possível remover o voo"});}});

app.use((err, req, res, next) => {
  console.error("AERO RADAR erro não tratado:", err?.stack || err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

async function initDatabase() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
  await pool.query(`CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`);
  await pool.query(`CREATE TABLE IF NOT EXISTS my_flights (id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,flight_number TEXT NOT NULL,flight_date DATE NOT NULL,origin TEXT NOT NULL,destination TEXT NOT NULL,airline TEXT,seat TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
  await pool.query(`CREATE INDEX IF NOT EXISTS my_flights_user_date_idx ON my_flights(user_id,flight_date DESC);`);
}

const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, "0.0.0.0", async () => {
  try { await initDatabase(); console.log(`AERO RADAR online na porta ${PORT}`); }
  catch (e) { console.error("Falha ao inicializar banco:", e.message); }
});

async function shutdown(signal) {
  console.log(`Recebido ${signal}; encerrando AERO RADAR...`);
  server.close(async () => { try { await pool.end(); } finally { process.exit(0); } });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));


