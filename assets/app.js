const C = window.AERO_RADAR_CONFIG || {};
const API = C.apiBase || "";

let airports = [
  {code:"SBGL",name:"Rio de Janeiro/Galeão",lat:-22.8099,lon:-43.2506},
  {code:"SBRJ",name:"Rio de Janeiro/Santos Dumont",lat:-22.9105,lon:-43.1631},
  {code:"SBJR",name:"Jacarepaguá",lat:-22.9875,lon:-43.3700},
  {code:"SBSP",name:"São Paulo/Congonhas",lat:-23.6261,lon:-46.6566},
  {code:"SBGR",name:"São Paulo/Guarulhos",lat:-23.4356,lon:-46.4731},
  {code:"SBBR",name:"Brasília",lat:-15.8711,lon:-47.9186},
  {code:"SBRF",name:"Recife",lat:-8.1265,lon:-34.9236},
  {code:"SBKP",name:"Campinas/Viracopos",lat:-23.0074,lon:-47.1345},
  {code:"SBFZ",name:"Fortaleza",lat:-3.7763,lon:-38.5326},
  {code:"SDRS",name:"Aeroporto de Resende / Agulhas Negras",lat:-22.4786,lon:-44.4811}
];

const retired = [
  {type:"B707",model:"Boeing 707",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B720",model:"Boeing 720",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B727",model:"Boeing 727",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B737-100",model:"Boeing 737-100",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B737-200",model:"Boeing 737-200",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B737-300",model:"Boeing 737-300",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B737-400",model:"Boeing 737-400",manufacturer:"Boeing",operator:"Vários operadores",status:"Fora de produção"},
  {type:"B737-500",model:"Boeing 737-500",manufacturer:"Boeing",operator:"Vários operadores",status:"Fora de produção"},
  {type:"B747-100",model:"Boeing 747-100",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B747-200",model:"Boeing 747-200",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B747-300",model:"Boeing 747-300",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B747-400",model:"Boeing 747-400",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"B747SP",model:"Boeing 747SP",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"B757-200",model:"Boeing 757-200",manufacturer:"Boeing",operator:"Vários operadores",status:"Fora de produção"},
  {type:"B757-300",model:"Boeing 757-300",manufacturer:"Boeing",operator:"Vários operadores",status:"Fora de produção"},
  {type:"B767-200",model:"Boeing 767-200",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"B767-300",model:"Boeing 767-300",manufacturer:"Boeing",operator:"Vários operadores",status:"Ainda há cargueiros em operação"},
  {type:"B777-200",model:"Boeing 777-200",manufacturer:"Boeing",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"B787",model:"Boeing 787 Dreamliner",manufacturer:"Boeing",operator:"Vários operadores",status:"Em operação"},
  {type:"DC-3",model:"Douglas DC-3",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada da aviação comercial"},
  {type:"DC-4",model:"Douglas DC-4",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"DC-6",model:"Douglas DC-6",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada da aviação comercial"},
  {type:"DC-7",model:"Douglas DC-7",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"DC-8",model:"Douglas DC-8",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada da aviação de passageiros"},
  {type:"DC-9",model:"Douglas DC-9",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"MD-80",model:"McDonnell Douglas MD-80",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"MD-90",model:"McDonnell Douglas MD-90",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"MD-11",model:"McDonnell Douglas MD-11",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em passageiros"},
  {type:"MD-12",model:"McDonnell Douglas MD-12",manufacturer:"McDonnell Douglas",operator:"Projeto cancelado",status:"Nunca entrou em serviço"},
  {type:"L-1011",model:"Lockheed L-1011 TriStar",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"L-188",model:"Lockheed L-188 Electra",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada da aviação de passageiros"},
  {type:"A300B2",model:"Airbus A300B2",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada"},
  {type:"A300B4",model:"Airbus A300B4",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em passageiros"},
  {type:"A310",model:"Airbus A310",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em passageiros"},
  {type:"A318",model:"Airbus A318",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"A319",model:"Airbus A319",manufacturer:"Airbus",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"A320",model:"Airbus A320ceo",manufacturer:"Airbus",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"A321",model:"Airbus A321ceo",manufacturer:"Airbus",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"A340-200",model:"Airbus A340-200",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada"},
  {type:"A340-300",model:"Airbus A340-300",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"A340-500",model:"Airbus A340-500",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada"},
  {type:"A340-600",model:"Airbus A340-600",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"A380",model:"Airbus A380-800",manufacturer:"Airbus",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"Concorde",model:"Aérospatiale-BAC Concorde",manufacturer:"Aérospatiale / BAC",operator:"Air France / British Airways",status:"Aposentada"},
  {type:"Caravelle",model:"Sud Aviation Caravelle",manufacturer:"Sud Aviation",operator:"Vários operadores",status:"Aposentada"},
  {type:"Mercure",model:"Dassault Mercure",manufacturer:"Dassault",operator:"Air Inter",status:"Aposentada"},
  {type:"Fokker 27",model:"Fokker F27 Friendship",manufacturer:"Fokker",operator:"Vários operadores",status:"Aposentada da aviação comercial"},
  {type:"Fokker 28",model:"Fokker F28 Fellowship",manufacturer:"Fokker",operator:"Vários operadores",status:"Aposentada"},
  {type:"Fokker 50",model:"Fokker 50",manufacturer:"Fokker",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Fokker 70",model:"Fokker 70",manufacturer:"Fokker",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Fokker 100",model:"Fokker 100",manufacturer:"Fokker",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"BAe 146",model:"BAe 146",manufacturer:"British Aerospace",operator:"Vários operadores",status:"Fora de produção"},
  {type:"Avro RJ70",model:"Avro RJ70",manufacturer:"BAe Systems",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Avro RJ85",model:"Avro RJ85",manufacturer:"BAe Systems",operator:"Vários operadores",status:"Aposentada"},
  {type:"Avro RJ100",model:"Avro RJ100",manufacturer:"BAe Systems",operator:"Vários operadores",status:"Aposentada"},
  {type:"BAC 1-11",model:"BAC One-Eleven",manufacturer:"BAC",operator:"Vários operadores",status:"Aposentada"},
  {type:"VC10",model:"Vickers VC10",manufacturer:"Vickers",operator:"Vários operadores",status:"Aposentada"},
  {type:"Comet",model:"de Havilland Comet",manufacturer:"de Havilland",operator:"Vários operadores",status:"Aposentada"},
  {type:"Dash 7",model:"de Havilland Canada DHC-7",manufacturer:"de Havilland Canada",operator:"Vários operadores",status:"Fora de produção"},
  {type:"Dash 8-100",model:"de Havilland Canada DHC-8-100",manufacturer:"de Havilland Canada",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Dash 8-300",model:"de Havilland Canada DHC-8-300",manufacturer:"de Havilland Canada",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Dash 8-400",model:"Dash 8-400",manufacturer:"de Havilland Canada",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"L-188",model:"Lockheed L-188 Electra",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"Electra II",model:"Lockheed L-188 Electra II",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"Il-62",model:"Ilyushin Il-62",manufacturer:"Ilyushin",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Il-86",model:"Ilyushin Il-86",manufacturer:"Ilyushin",operator:"Vários operadores",status:"Aposentada"},
  {type:"Il-96",model:"Ilyushin Il-96",manufacturer:"Ilyushin",operator:"Vários operadores",status:"Operação limitada"},
  {type:"Tu-134",model:"Tupolev Tu-134",manufacturer:"Tupolev",operator:"Vários operadores",status:"Aposentada"},
  {type:"Tu-144",model:"Tupolev Tu-144",manufacturer:"Tupolev",operator:"Aeroflot",status:"Aposentada"},
  {type:"Tu-154",model:"Tupolev Tu-154",manufacturer:"Tupolev",operator:"Vários operadores",status:"Aposentada"},
  {type:"An-24",model:"Antonov An-24",manufacturer:"Antonov",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"An-26",model:"Antonov An-26",manufacturer:"Antonov",operator:"Vários operadores",status:"Fora de produção"},
  {type:"An-72",model:"Antonov An-72",manufacturer:"Antonov",operator:"Vários operadores",status:"Fora de produção"},
  {type:"Yak-40",model:"Yakovlev Yak-40",manufacturer:"Yakovlev",operator:"Vários operadores",status:"Aposentada"},
  {type:"Yak-42",model:"Yakovlev Yak-42",manufacturer:"Yakovlev",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"BAe ATP",model:"BAe ATP",manufacturer:"British Aerospace",operator:"Vários operadores",status:"Aposentada"},
  {type:"ATP",model:"British Aerospace ATP",manufacturer:"British Aerospace",operator:"Vários operadores",status:"Aposentada"},
  {type:"Saab 340",model:"Saab 340",manufacturer:"Saab",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Saab 2000",model:"Saab 2000",manufacturer:"Saab",operator:"Vários operadores",status:"Fora de produção"},
  {type:"BAe Jetstream 31",model:"Jetstream 31",manufacturer:"British Aerospace",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Jetstream 32",model:"Jetstream 32",manufacturer:"British Aerospace",operator:"Vários operadores",status:"Fora de produção"},
  {type:"Embraer EMB-110",model:"Embraer EMB 110 Bandeirante",manufacturer:"Embraer",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Embraer EMB-120",model:"Embraer EMB 120 Brasilia",manufacturer:"Embraer",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"ERJ-135",model:"Embraer ERJ-135",manufacturer:"Embraer",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"ERJ-140",model:"Embraer ERJ-140",manufacturer:"Embraer",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"ERJ-145",model:"Embraer ERJ-145",manufacturer:"Embraer",operator:"Vários operadores",status:"Ainda há unidades em operação"},
  {type:"EMB-170",model:"Embraer 170",manufacturer:"Embraer",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"EMB-175",model:"Embraer 175",manufacturer:"Embraer",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"L-100",model:"Lockheed L-100 Hercules",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"C-130A",model:"Lockheed C-130A Hercules",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"C-141",model:"Lockheed C-141 Starlifter",manufacturer:"Lockheed",operator:"USAF",status:"Aposentada"},
  {type:"C-5A",model:"Lockheed C-5A Galaxy",manufacturer:"Lockheed",operator:"USAF",status:"Aposentada"},
  {type:"DC-10",model:"McDonnell Douglas DC-10",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em passageiros"},
  {type:"MD-11F",model:"McDonnell Douglas MD-11F",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Ainda há cargueiros em operação"},
  {type:"L-1011-500",model:"Lockheed L-1011-500 TriStar",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"Mercure",model:"Dassault Mercure 100",manufacturer:"Dassault",operator:"Air Inter",status:"Aposentada"},
  {type:"727-100",model:"Boeing 727-100",manufacturer:"Boeing",operator:"Vários operadores",status:"Aposentada"},
  {type:"747-8",model:"Boeing 747-8",manufacturer:"Boeing",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"A310-300",model:"Airbus A310-300",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em passageiros"},
  {type:"A300-600",model:"Airbus A300-600",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em passageiros"},
  {type:"CRJ100",model:"Bombardier CRJ100",manufacturer:"Bombardier",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"CRJ200",model:"Bombardier CRJ200",manufacturer:"Bombardier",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"CRJ700",model:"Bombardier CRJ700",manufacturer:"Bombardier",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"CRJ900",model:"Bombardier CRJ900",manufacturer:"Bombardier",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"Q400",model:"Bombardier Dash 8 Q400",manufacturer:"Bombardier",operator:"Vários operadores",status:"Ainda em operação"},
  {type:"L-1049",model:"Lockheed L-1049 Super Constellation",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"DC-3",model:"Douglas DC-3 / C-47",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada da aviação comercial"},
  {type:"DC-4",model:"Douglas DC-4 / C-54",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"DC-6B",model:"Douglas DC-6B",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"DC-7C",model:"Douglas DC-7C",manufacturer:"Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"Constellation",model:"Lockheed Constellation",manufacturer:"Lockheed",operator:"Vários operadores",status:"Aposentada"},
  {type:"Super Guppy",model:"Aero Spacelines Super Guppy",manufacturer:"Aero Spacelines",operator:"NASA / Airbus",status:"Fora de operação comercial"},
  {type:"Beluga 1",model:"Airbus Beluga A300-600ST",manufacturer:"Airbus",operator:"Airbus",status:"Em retirada gradual"},
  {type:"BAe 748",model:"Hawker Siddeley HS 748",manufacturer:"Hawker Siddeley",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"Viscount",model:"Vickers Viscount",manufacturer:"Vickers",operator:"Vários operadores",status:"Aposentada"},
  {type:"Friendship",model:"Fokker F27 Friendship",manufacturer:"Fokker",operator:"Vários operadores",status:"Aposentada"},
  {type:"DC-9-50",model:"McDonnell Douglas DC-9-50",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada"},
  {type:"MD-82",model:"McDonnell Douglas MD-82",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"MD-83",model:"McDonnell Douglas MD-83",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"MD-87",model:"McDonnell Douglas MD-87",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"MD-88",model:"McDonnell Douglas MD-88",manufacturer:"McDonnell Douglas",operator:"Vários operadores",status:"Aposentada em muitas frotas"},
  {type:"A340",model:"Airbus A340 family",manufacturer:"Airbus",operator:"Vários operadores",status:"Aposentada em muitas frotas"}
];

const cameras = [
  {icao:"SBGR",name:"Guarulhos (GRU)",provider:"SBGR LIVE — YouTube",embed:"https://www.youtube.com/embed/2xR4I4esIA4?rel=0",source:"https://www.youtube.com/@sbgrlive"},
  {icao:"SBSP",name:"Congonhas (CGH)",provider:"Aeroescuta / Golf Oscar Romeo",embed:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/cameras-de-aeroportos-do-brasil-ao-vivo/camera-ao-vivo-no-aeroporto-de-congonhas-sbsp/",source:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/cameras-de-aeroportos-do-brasil-ao-vivo/camera-ao-vivo-no-aeroporto-de-congonhas-sbsp/"},
  {icao:"SBKP",name:"Viracopos (VCP)",provider:"Aeroescuta / Golf Oscar Romeo",embed:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/cameras-de-aeroportos-do-brasil-ao-vivo/",source:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/cameras-de-aeroportos-do-brasil-ao-vivo/"},
  {icao:"SBMT",name:"Campo de Marte (SBMT)",provider:"Aeroescuta / Golf Oscar Romeo",embed:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/cameras-de-aeroportos-do-brasil-ao-vivo/",source:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/cameras-de-aeroportos-do-brasil-ao-vivo/"},
  {icao:"SBRJ",name:"Santos Dumont (SDU)",provider:"Aeroescuta / Aviation TV",embed:"https://aeroescuta.com.br/?p=445",source:"https://aeroescuta.com.br/?p=445"},
  {icao:"SBGL",name:"Galeão (GIG)",provider:"Aeroescuta / Aviation TV",embed:"https://aeroescuta.com.br/?p=445",source:"https://aeroescuta.com.br/?p=445"},
  {icao:"SXM",name:"St. Maarten (SXM)",provider:"Aeroescuta / Airport Live Cam",embed:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/",source:"https://aeroescuta.com.br/cameras-de-aroportos-ao-vivo-airports-live-cams/"},
  {icao:"WORLD",name:"Câmeras de aeroportos no mundo",provider:"Airport Livestreams — catálogo de lives",embed:"https://airportlivestreams.com/",source:"https://airportlivestreams.com/"}
];

let flights=[], map, markers=[], airportMarkers=[], selected=null, mode="login";
let flightTrails=new Map(), selectedRouteLayers=[];
let routeVisible=false, followingFlight=false;
let airportFetchTimer=null, airportRequestSeq=0;
let cameraLayer=null, lastFetch=0, fetchTimer=null;
let baseTileLayer=null, hybridLabelsLayer=null, dayNightLayer=null;
let mapStyle="satellite", mapBrightness=100;

function qs(id){return document.getElementById(id)}

function planeIcon(heading = 0, zoom = 7) {
  const z = Number(zoom) || 7;
  const size = Math.max(18, Math.min(42, 16 + (z - 4) * 4));
  const hdg = Number.isFinite(Number(heading)) ? Number(heading) : 0;
  return L.divIcon({
    className: "aero-plane-marker",
    html: `<div class="aero-plane-icon" style="--plane-size:${size}px;--plane-heading:${hdg}deg" aria-hidden="true">
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 2 L28 18 L43 25 L43 29 L28 27 L28 43 L34 46 L34 48 L24 45 L14 48 L14 46 L20 43 L20 27 L5 29 L5 25 L20 18 Z"
          fill="#FFD400" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}
function updatePlaneLabelMode(){
  const z=map?map.getZoom():0;
  // Em zoom baixo, mostrar apenas os aviões evita a sobreposição de centenas de textos.
  // Em zoom próximo, mostrar detalhes; o avião selecionado sempre mantém o texto.
  const show=(localStorage.getItem("aeroShowLabels")!=="0") && z>=10;
  markers.forEach(m=>{
    const f=m._aeroFlight;
    if(!f)return;
    f.showLabels=show||!!f.selected;
    m.setIcon(planeIcon(f));
  });
}
function airportIcon(a){
  return L.divIcon({className:"airport-div",iconSize:[28,28],iconAnchor:[14,14],
    html:`<div class="airport-marker"><span>${a.code.slice(-2)}</span></div>`});
}
function mapStyleConfig(style){
  const cfg={
    terrain:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",attribution:"Esri"},
    roadmap:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:"OpenStreetMap"},
    grayscale:{url:"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",attribution:"CARTO"},
    "radar-blue":{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:"OpenStreetMap"},
    "radar-dark":{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attribution:"CARTO"},
    aubergine:{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attribution:"CARTO"},
    satellite:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attribution:"Esri"},
    hybrid:{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attribution:"Esri"},
    blackwhite:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:"OpenStreetMap"}
  };
  return cfg[style]||cfg.satellite;
}
function mapTileFilter(style,brightness){
  const b=(Number(brightness)||100)/100;
  const base={
    satellite:`brightness(${b})`,terrain:`brightness(${b})`,roadmap:`brightness(${b})`,
    grayscale:`grayscale(1) brightness(${b})`,
    "radar-blue":`saturate(.78) hue-rotate(155deg) brightness(${b*.72}) contrast(1.12)`,
    "radar-dark":`brightness(${b*.48}) saturate(.72) contrast(1.15)`,
    aubergine:`brightness(${b*.52}) saturate(1.3) hue-rotate(275deg) contrast(1.12)`,
    blackwhite:`grayscale(1) contrast(1.55) brightness(${b*1.05})`,
    hybrid:`brightness(${b})`
  };
  return base[style]||base.satellite;
}
function initMapLayerControl(){
  const toggle=qs("mapLayerToggle"), menu=qs("mapLayerMenu");
  if(!toggle||!menu) return;
  toggle.addEventListener("click",()=>menu.classList.toggle("hidden"));
  document.addEventListener("click",(e)=>{
    const box=qs("mapLayerControl");
    if(box && !box.contains(e.target)) menu.classList.add("hidden");
  });
  menu.querySelectorAll("[data-layer-style]").forEach(btn=>btn.addEventListener("click",()=>{
    applyMapStyle(btn.dataset.layerStyle);
    menu.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===btn));
    menu.classList.add("hidden");
  }));
}

function applyMapStyle(style){
  mapStyle=style||"satellite";
  const cfg=mapStyleConfig(mapStyle);
  if(baseTileLayer){map.removeLayer(baseTileLayer);baseTileLayer=null;}
  if(hybridLabelsLayer){map.removeLayer(hybridLabelsLayer);hybridLabelsLayer=null;}
  baseTileLayer=L.tileLayer(cfg.url,{attribution:cfg.attribution,maxZoom:19,updateWhenZooming:false,keepBuffer:1,crossOrigin:true}).addTo(map);
  baseTileLayer.once("load",()=>{ const pane=map.getPane("tilePane"); if(pane) pane.style.filter=mapTileFilter(mapStyle,mapBrightness); });
  const pane=map.getPane("tilePane"); if(pane) pane.style.filter=mapTileFilter(mapStyle,mapBrightness);
  if(mapStyle==="hybrid") hybridLabelsLayer=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,opacity:.9}).addTo(map);
  document.querySelectorAll(".map-style-card").forEach(b=>b.classList.toggle("active",b.dataset.mapStyle===mapStyle));
  localStorage.setItem("aeroMapStyle",mapStyle);
}
function applyMapBrightness(value){
  mapBrightness=Math.max(60,Math.min(140,Number(value)||100));
  const pane=map?.getPane("tilePane"); if(pane) pane.style.filter=mapTileFilter(mapStyle,mapBrightness);
  localStorage.setItem("aeroMapBrightness",String(mapBrightness));
}
function updateDayNight(){
  const enabled=qs("dayNightLine")?.checked;
  if(dayNightLayer){map.removeLayer(dayNightLayer);dayNightLayer=null;}
  if(enabled && window.L && typeof L.terminator==="function"){
    dayNightLayer=L.terminator({fillOpacity:.16,fillColor:"#10263d",color:"#f4b62a",weight:1,opacity:.85,interactive:false}).addTo(map);
    window.setTimeout(()=>{if(dayNightLayer&&dayNightLayer.setTime)dayNightLayer.setTime(new Date());},50);
  }
  localStorage.setItem("aeroDayNight",enabled?"1":"0");
}
function initMap(){
  map=L.map("map",{zoomControl:true,preferCanvas:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([-22.93,-43.22],9);
  map.on("moveend",()=>{scheduleReal(); scheduleWorldAirports(); updatePlaneLabelMode();});
  map.on("zoomend",updatePlaneLabelMode);
  applyMapStyle(localStorage.getItem("aeroMapStyle")||"satellite");
initMapLayerControl();
  applyMapBrightness(Number(localStorage.getItem("aeroMapBrightness")||100));
  setTimeout(()=>map.invalidateSize(),150);
}
function renderAirportsOnMap(){
  airportMarkers.forEach(m=>map.removeLayer(m)); airportMarkers=[];
  if(!qs("showAirports")?.checked) return;
  const bounds=map.getBounds().pad(.12);
  const z=map.getZoom();
  airports.forEach(a=>{
    if(!bounds.contains([a.lat,a.lon])) return;
    const m=L.marker([a.lat,a.lon],{icon:airportIcon(a),interactive:true}).addTo(map)
      .bindTooltip(`<b>${a.iata||a.icao||a.code}</b><br>${a.name}${a.city?`<br>${a.city}`:""}`,{direction:"top",sticky:z>=7})
      .on("click",()=>openAirportPanel(a));
    airportMarkers.push(m);
  });
}

function escHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
async function openAirportPanel(a){
  const panel=qs("airportPanel"), body=qs("airportPanelBody");
  if(!panel||!body)return;
  panel.classList.remove("hidden"); body.innerHTML=`<div class="airport-loading">Carregando aeroporto, METAR e movimento ao vivo…</div>`;
  try{
    const code=String(a.icao||a.code||"").toUpperCase();
    const r=await fetch(`${API}/api/airport/${encodeURIComponent(code)}?lat=${encodeURIComponent(a.lat)}&lon=${encodeURIComponent(a.lon)}&name=${encodeURIComponent(a.name||"")}`,{cache:"no-store"});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||"Falha ao carregar aeroporto");
    renderAirportPanel(d);
  }catch(e){
    body.innerHTML=`<div class="airport-loading"><b>Não foi possível carregar os dados agora.</b><br>${escHtml(e.message)}</div>`;
  }
}
function renderAirportPhoto(photo,airportName){
  const photos=Array.isArray(photo?.photos)&&photo.photos.length?photo.photos:(photo?.url?[{url:photo.url,source:photo.provider||"JetPhotos"}]:[]);
  if(!photos.length) return `<div class="airport-photo-placeholder">📷 Foto do aeroporto indisponível</div>`;
  const pageUrl=photo?.pageUrl||"https://www.jetphotos.com/";
  const safeName=escHtml(airportName||"aeroporto");
  const items=photos.map((p,i)=>`<button type="button" class="airport-photo-dot ${i===0?"active":""}" data-airport-photo-index="${i}" aria-label="Foto ${i+1}"></button>`).join("");
  return `<div class="airport-photo-gallery"><a class="airport-photo-link" id="airportPhotoLink" href="${escHtml(photos[0].url||pageUrl)}" target="_blank" rel="noopener noreferrer"><img id="airportPhotoImage" src="${escHtml(photos[0].url||"")}" alt="Foto de ${safeName} no JetPhotos" loading="lazy"><span class="airport-photo-open">↗</span></a><div class="airport-photo-credit">Foto: <b>JetPhotos</b> · <a href="${escHtml(pageUrl)}" target="_blank" rel="noopener noreferrer">ver fotos do aeroporto</a></div><div class="airport-photo-dots">${items}</div></div>`;
}

function renderAirportPanel(d){
  const body=qs("airportPanelBody"); if(!body)return;
  const a=d.airport||{}; const m=d.metar||{};
  const arr=d.arrivals||[], dep=d.departures||[], ground=d.ground||[];
  const runwayText=(d.runways||[]).map(r=>`
  <div class="runway-detail">
    <b>${escHtml(r.ident1||"")} / ${escHtml(r.ident2||"")}</b>
    <span>Comprimento: ${Number(r.length_ft||0).toLocaleString("pt-BR")} ft (${Math.round(Number(r.length_ft||0)*0.3048).toLocaleString("pt-BR")} m)</span>
    <span>Largura: ${Number(r.width_ft||0).toLocaleString("pt-BR")} ft (${Math.round(Number(r.width_ft||0)*0.3048).toLocaleString("pt-BR")} m)</span>
    <span>Pavimento: ${escHtml(r.surface||"Não informado")}</span>
  </div>`).join("")||"Não disponível";
  const flightRows=(items,kind)=>items.slice(0,50).map(f=>`<div class="airport-flight-row"><div><b>${escHtml(f.callsign||"SEM CALLSIGN")}</b><span>${escHtml(f.reg||"")} ${escHtml(f.model||"")}</span></div><div>${kind==="arr"?`← ${escHtml(f.from||"—")}`:`→ ${escHtml(f.to||"—")}`}</div><strong>${escHtml(f.status||"AO VIVO")}</strong></div>`).join("")||`<div class="airport-empty">Nenhum voo compatível disponível neste momento.</div>`;
  const groundRows=ground.slice(0,60).map(f=>`<div class="airport-ground-row"><b>${escHtml(f.reg||f.callsign||"—")}</b><span>${escHtml(f.model||"Aeronave")}</span><span>${escHtml(f.operator||"")}</span><em>EM SOLO</em></div>`).join("")||`<div class="airport-empty">Nenhuma aeronave no solo identificada.</div>`;
  body.innerHTML=`
    <div class="airport-hero"><div><div class="airport-kicker">AEROPORTO</div><h2>${escHtml(a.name||"Aeroporto")}</h2><div class="airport-code"><span>🇧🇷</span> ${escHtml(a.iata||"")} / ${escHtml(a.icao||"")}</div><div class="airport-sub">${escHtml(a.city||"")} · Elevação ${a.elevation_ft?Number(a.elevation_ft).toLocaleString("pt-BR"):"—"} pés</div></div><button type="button" class="airport-panel-close" id="airportPanelClose">×</button></div>
    <div class="airport-photo-wrap" id="airportPhotoWrap">${renderAirportPhoto(d.photo,a.name)}</div>
    <div class="airport-livebar"><span>🟢 Movimento em tempo real</span><span>Atualização automática a cada 30 s</span><button type="button" id="airportRefreshNow">↻ Atualizar agora</button></div>
    <div class="airport-tabs">
  <button class="active" data-airtab="overview">Geral</button>
  <button data-airtab="arrivals">🛬 Vindo para pousar</button>
  <button data-airtab="departures">🛫 Partidas</button>
  <button data-airtab="ground">🛩 No pátio / solo</button>
  <button data-airtab="events">📅 Eventos</button>
</div>
    <div class="airport-tab-content active" data-airpane="overview"><div class="airport-stat-grid"><div><small>CONDIÇÕES</small><b>${escHtml(m.flight||m.wx||"—")}</b></div><div><small>TEMPERATURA</small><b>${m.temp_c!=null?escHtml(m.temp_c)+"°C":"—"}</b></div><div><small>VENTO</small><b>${m.wind_dir_degrees!=null?escHtml(m.wind_dir_degrees)+"° ":""}${m.wind_speed_kt!=null?escHtml(m.wind_speed_kt)+" kt":"—"}</b></div><div><small>VISIBILIDADE</small><b>${m.visibility_statute_mi?escHtml(m.visibility_statute_mi)+" mi":"—"}</b></div></div><div class="airport-card"><h3>🌦 METAR</h3><code>${escHtml(m.raw||"METAR indisponível")}</code><p>${m.observed?`Observado em ${escHtml(m.observed)}`:""}</p></div><div class="airport-two"><div class="airport-card"><h3>ℹ Informações do aeroporto</h3><p><b>Nome:</b> ${escHtml(a.name||"—")}</p><p><b>IATA:</b> ${escHtml(a.iata||"—")}</p><p><b>ICAO:</b> ${escHtml(a.icao||"—")}</p><p><b>País:</b> ${escHtml(a.country||"—")}</p><p><b>Cidade:</b> ${escHtml(a.city||"—")}</p></div><div class="airport-card"><h3>🛬 Pistas — comprimento e largura</h3><div class="runway-list">${runwayText}</div></div></div><div class="airport-card"><h3>📅 Eventos recentes</h3>${[...arr.slice(0,4).map(f=>`<p>🟢 ${escHtml(f.callsign||"Voo")} — pouso/chegada ${escHtml(f.from||"")}</p>`),...dep.slice(0,4).map(f=>`<p>🟡 ${escHtml(f.callsign||"Voo")} — decolagem/partida ${escHtml(f.to||"")}</p>`)].join("")||"<p>Nenhum evento recente disponível.</p>"}</div></div>
    <div class="airport-tab-content" data-airpane="arrivals"><div class="airport-card"><h3>🛬 Aeronaves vindo para pousar</h3><p class="airport-note">São mostradas as aeronaves cujo destino foi identificado como este aeroporto.</p>${flightRows(arr,"arr")}</div></div>
    <div class="airport-tab-content" data-airpane="departures"><div class="airport-card"><h3>🛫 Partidas próximas</h3>${flightRows(dep,"dep")}</div></div>
    <div class="airport-tab-content" data-airpane="ground"><div class="airport-card"><h3>🛩 Aeronaves no pátio / solo</h3><p class="airport-note">Tráfego ADS-B identificado no solo nas proximidades do aeroporto.</p>${groundRows}</div></div>
    <div class="airport-tab-content" data-airpane="events"><div class="airport-card"><h3>📅 Últimos eventos</h3>${[...arr.slice(0,10).map(f=>`<div class="airport-event">🟢 ${escHtml(f.callsign||"Voo")} · Chegada ${escHtml(f.from||"—")}</div>`),...dep.slice(0,10).map(f=>`<div class="airport-event">🟡 ${escHtml(f.callsign||"Voo")} · Partida ${escHtml(f.to||"—")}</div>`)].join("")||"<div class=\"airport-empty\">Sem eventos recentes.</div>"}</div></div>`;
  qs("airportPanelClose")?.addEventListener("click",()=>qs("airportPanel")?.classList.add("hidden"));
  qs("airportRefreshNow")?.addEventListener("click",()=>openAirportPanel(a));
  clearInterval(airportFetchTimer); airportFetchTimer=setInterval(()=>{ if(!qs("airportPanel")?.classList.contains("hidden")) openAirportPanel(a); },30000);
  const airportPhotos=Array.isArray(d.photo?.photos)?d.photo.photos:[];
  let airportPhotoIndex=0;
  body.querySelectorAll("[data-airport-photo-index]").forEach(btn=>btn.addEventListener("click",()=>{
    airportPhotoIndex=Number(btn.dataset.airportPhotoIndex)||0;
    const photo=airportPhotos[airportPhotoIndex]; if(!photo)return;
    const img=qs("airportPhotoImage"), link=qs("airportPhotoLink");
    if(img) img.src=photo.url||"";
    if(link) link.href=photo.url||d.photo?.pageUrl||"https://www.jetphotos.com/";
    body.querySelectorAll("[data-airport-photo-index]").forEach(x=>x.classList.toggle("active",x===btn));
  }));
  body.querySelectorAll("[data-airtab]").forEach(btn=>btn.addEventListener("click",()=>{body.querySelectorAll("[data-airtab]").forEach(x=>x.classList.toggle("active",x===btn));body.querySelectorAll("[data-airpane]").forEach(x=>x.classList.toggle("active",x.dataset.airpane===btn.dataset.airtab));}));
}

function initMyFlights(){
  const open=()=>{qs("myFlightModal")?.classList.remove("hidden");loadMyFlights();};
  qs("myFlightBtn")?.addEventListener("click",e=>{if(e){e.preventDefault();}open();});
  qs("myFlightBtnCard")?.addEventListener("click",open); qs("myFlightClose")?.addEventListener("click",()=>qs("myFlightModal")?.classList.add("hidden"));
  qs("myFlightForm")?.addEventListener("submit",async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const msg=qs("myFlightMsg");msg.textContent="Salvando…";try{const r=await fetch(`${API}/api/my-flights`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Falha");e.currentTarget.reset();msg.textContent="Voo adicionado.";loadMyFlights();}catch(err){msg.textContent=err.message;}});
}
async function loadMyFlights(){
  const el=qs("myFlightList"); if(!el)return; el.innerHTML="Carregando…";
  try{const r=await fetch(`${API}/api/my-flights`,{credentials:"include",cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Falha");el.innerHTML=d.flights.map(f=>`<div class="my-flight-row"><div><b>${escHtml(f.flight_number||"Voo")}</b><span>${escHtml(f.flight_date||"")}</span></div><div>${escHtml(f.origin||"—")} → ${escHtml(f.destination||"—")}</div><div>${escHtml(f.airline||"")} ${escHtml(f.seat?`· Assento ${f.seat}`:"")}</div><button data-del-myflight="${f.id}">×</button></div>`).join("")||"<div class='airport-empty'>Você ainda não adicionou voos.</div>";el.querySelectorAll("[data-del-myflight]").forEach(b=>b.addEventListener("click",async()=>{await fetch(`${API}/api/my-flights/${b.dataset.delMyflight}`,{method:"DELETE",credentials:"include"});loadMyFlights();}));}catch(e){el.textContent=e.message;}
}

async function loadWorldAirports(){
  if(!map || !qs("showAirports")?.checked) return;
  const seq=++airportRequestSeq;
  const b=map.getBounds();
  const p=new URLSearchParams({
    minLat:String(b.getSouth()), maxLat:String(b.getNorth()),
    minLon:String(b.getWest()), maxLon:String(b.getEast()),
    zoom:String(map.getZoom())
  });
  try{
    const r=await fetch(`${API}/api/airports?${p.toString()}`,{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    if(seq!==airportRequestSeq || !Array.isArray(data.airports)) return;
    airports=data.airports;
    renderAirportsOnMap();
  }catch(e){
    console.warn("Aeroportos mundiais indisponíveis:",e.message);
    renderAirportsOnMap();
  }
}
function scheduleWorldAirports(){
  clearTimeout(airportFetchTimer);
  airportFetchTimer=setTimeout(loadWorldAirports,350);
}
function filtered(){
  const q=(qs("search").value||"").toLowerCase();
  const a=qs("aircraft").value, p=qs("airport").value, r=qs("routeFilter").value, c=qs("country").value;
  const cats=["commercial","executive","military"].filter(id=>qs(id)?.checked);
  const all=qs("allAircraft")?.checked === true;
  const showAirborne=qs("airborne")?.checked !== false;
  const showGround=qs("ground")?.checked !== false;
  return flights.filter(f=>{
    const hay=JSON.stringify(f).toLowerCase();
    const countryMatch=c==="all" || (c==="Brasil" ? String(f.originCountry||"").toLowerCase().includes("brazil") : !String(f.originCountry||"").toLowerCase().includes("brazil"));
    const categoryMatch=all || (cats.length>0 && cats.includes(f.category));
    const isGround=Boolean(f.onGround);
    const statusMatch=(isGround && showGround) || (!isGround && showAirborne);
    return (!q||hay.includes(q))&&(a==="all"||f.type===a)&&(p==="all"||f.from===p||f.to===p)&&(r==="all"||f.from===r||f.to===r)&&countryMatch&&categoryMatch&&statusMatch;
  });
}

function applyCategoryFromData(f){
  const cs=String(f.callsign||"").trim().toUpperCase();
  if(["RCH","REACH","DUKE","NAVY","ARMY","AIRFORCE","AF1","SAM","EXEC","EVAC","VIPER","PAT","CNV","SPAR","TOPCAT","NATO"].some(x=>cs.startsWith(x))) return "military";
  // Muitos voos executivos aparecem no OpenSky com a matrícula como callsign.
  if(/^N[0-9A-Z]{2,6}$/.test(cs) || /^(PT|PR|PP|PS|LV|CX|VH|G|D|F|I)-?[A-Z0-9]{2,6}$/.test(cs)) return "executive";
  return f.category||"commercial";
}

function updateFilters(){
  const types=[...new Set(flights.map(f=>f.type).filter(Boolean))].sort();
  const airportCodes=[...new Set(flights.flatMap(f=>[f.from,f.to]).filter(Boolean))].sort();
  const set=(id,items,first)=>{const el=qs(id);if(!el)return;const old=el.value;el.innerHTML=`<option value="all">${first}</option>`;items.forEach(x=>el.insertAdjacentHTML("beforeend",`<option value="${x}">${x}</option>`));el.value=items.includes(old)?old:"all"};
  set("aircraft",types,"Todos"); set("airport",airportCodes,"Todos"); set("routeFilter",airportCodes,"Todos");
  qs("country").innerHTML='<option value="all">Todos</option><option value="Brasil">Brasil</option><option value="Internacional">Internacional</option>';
  set("mapAircraft",types,"Todos"); set("mapAirport",airportCodes,"Todos"); set("mapRoute",airportCodes,"Todos");
}

function clearSelectedRoute(){
  if(!map)return;
  selectedRouteLayers.forEach(layer=>{try{map.removeLayer(layer)}catch(_){}});
  selectedRouteLayers=[];
}
function rememberFlightPositions(arr){
  const now=Date.now();
  arr.forEach(f=>{
    const cs=String(f.callsign||"").trim().toUpperCase();
    const lat=Number(f.lat), lon=Number(f.lon);
    if(!cs || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const list=flightTrails.get(cs)||[];
    const last=list[list.length-1];
    if(!last || Math.abs(last[0]-lat)>0.00005 || Math.abs(last[1]-lon)>0.00005){
      list.push([lat,lon,now]);
      while(list.length>60) list.shift();
      flightTrails.set(cs,list);
    }
  });
}
function drawSelectedRoute(f){
  if(!map || !f || !f.selected || !routeVisible) return;
  clearSelectedRoute();
  const cs=String(f.callsign||"").trim().toUpperCase();
  const history=(flightTrails.get(cs)||[]).map(x=>[x[0],x[1]]);
  if(history.length>=2){
    selectedRouteLayers.push(L.polyline(history,{color:"#1677ff",weight:5,opacity:.88,lineCap:"round",lineJoin:"round",interactive:false}).addTo(map));
    selectedRouteLayers.push(L.polyline(history,{color:"#6d3cff",weight:2,opacity:.9,lineCap:"round",lineJoin:"round",interactive:false}).addTo(map));
  }
  const lat=Number(f.lat), lon=Number(f.lon);
  const olat=Number(f.fromLat), olon=Number(f.fromLon), dlat=Number(f.toLat), dlon=Number(f.toLon);
  if(Number.isFinite(olat)&&Number.isFinite(olon)&&Number.isFinite(lat)&&Number.isFinite(lon)){
    selectedRouteLayers.push(L.polyline([[olat,olon],[lat,lon]],{color:"#1b78ff",weight:4,opacity:.72,dashArray:"10 8",lineCap:"round",interactive:false}).addTo(map));
  }
  if(Number.isFinite(dlat)&&Number.isFinite(dlon)&&Number.isFinite(lat)&&Number.isFinite(lon)){
    selectedRouteLayers.push(L.polyline([[lat,lon],[dlat,dlon]],{color:"#7b42ff",weight:4,opacity:.82,dashArray:"10 8",lineCap:"round",interactive:false}).addTo(map));
  }
}
function renderDestinations(){
  const list=qs("destinationsList"), count=qs("destinationsCount");
  if(!list||!count)return;
  const mapDest=new Map();
  flights.forEach(f=>{
    const code=String(f.to||f.destination||"").trim().toUpperCase();
    if(!code)return;
    const name=String(f.toName||f.destinationName||"").trim();
    const item=mapDest.get(code)||{code,name,count:0};
    item.count++; if(!item.name&&name)item.name=name; mapDest.set(code,item);
  });
  const rows=[...mapDest.values()].sort((a,b)=>b.count-a.count||a.code.localeCompare(b.code));
  count.textContent=`${rows.length} destino${rows.length===1?"":"s"}`;
  if(!rows.length){list.innerHTML='<div class="destination-empty">Nenhum destino identificado nos dados atuais.</div>';return;}
  list.innerHTML=rows.slice(0,40).map(d=>`<button type="button" class="destination-chip" data-destination="${escHtml(d.code)}"><strong>${escHtml(d.code)}</strong><span>${escHtml(d.name||"Destino identificado")}</span><em>${d.count} voo${d.count===1?"":"s"}</em></button>`).join("");
  list.querySelectorAll("[data-destination]").forEach(btn=>btn.addEventListener("click",()=>{
    const code=btn.dataset.destination||"";
    const el=qs("routeFilter"); if(el){el.value=code; render();}
    document.querySelector('.topnav a[href="#radar"]')?.scrollIntoView?.({behavior:"smooth",block:"start"});
    qs("radar")?.scrollIntoView({behavior:"smooth",block:"start"});
  }));
}
function render(){
  if(!map)return;
  markers.forEach(m=>map.removeLayer(m));markers=[];
  const showLabels=map.getZoom()>=10;
  filtered().forEach(f=>{
    if(!Number.isFinite(Number(f.lat))||!Number.isFinite(Number(f.lon)))return;
    f.showLabels=showLabels||!!f.selected;
    const m=L.marker([f.lat,f.lon],{icon:planeIcon(f),zIndexOffset:f.selected?500:100,keyboard:false}).addTo(map);
    m._aeroFlight=f;
    m.on("click",()=>select(f));
    markers.push(m);
  });
  qs("count").textContent=filtered().length;
  drawSelectedRoute(selected);
  renderAirportsOnMap();
  renderFleet(filtered());
  renderRetired();
  renderDestinations();
}
function airlineLogoUrl(f){
  const cs=String(f?.callsign||"").trim().toUpperCase();
  const icao=(cs.match(/^[A-Z]{3}/)||[""])[0];
  return icao ? `https://www.flightradar24.com/static/images/data/operators/${encodeURIComponent(icao)}_logo0.png` : "";
}
function airlineLogoMarkup(f, airline){
  const url=airlineLogoUrl(f);
  const initials=String(airline||"AR").replace(/[^A-Za-zÀ-ÿ0-9 ]/g,"").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"AR";
  return `<div class="airline-logo-wrap">${url?`<img src="${url}" alt="Logo da companhia aérea" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('logo-fallback');this.remove()">`:""}<span class="airline-logo-fallback">${escHtml(initials)}</span></div>`;
}
function escHtml(v){return String(v??"").replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}

async function loadTopTracked(){
  const status=qs("topTrackedStatus"), list=qs("topTrackedList");
  if(!status||!list)return;
  status.textContent="Carregando ranking ao vivo...";
  list.innerHTML="";
  try{
    const r=await fetch(`${API}/api/fr24-most-tracked`,{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok || !Array.isArray(d.flights) || !d.flights.length) throw new Error(d.error||"Ranking indisponível");
    status.textContent=d.updatedAt?`Atualizado ${new Date(d.updatedAt).toLocaleTimeString("pt-BR")}`:"Ranking atual";
    list.innerHTML=d.flights.slice(0,10).map((x,i)=>{
      const clicks=Number(x.clicks);
      const people=Number.isFinite(clicks)?clicks.toLocaleString("pt-BR"):"—";
      const flight=escHtml(x.flight||x.callsign||"—");
      const callsign=escHtml(x.callsign||"");
      const fromCode=escHtml(x.from||"");
      const toCode=escHtml(x.to||"");
      const fromCity=escHtml(x.fromCity||"");
      const toCity=escHtml(x.toCity||"");
      const route=(fromCity||toCity)?`${fromCity||fromCode} <b>→</b> ${toCity||toCode}`:[fromCode,toCode].filter(Boolean).join(" → ")||"Rota não informada";
      const codes=(fromCode||toCode)?`${fromCode||"—"} → ${toCode||"—"}`:"";
      const model=escHtml(x.model||x.aircraft||"Aeronave");
      const url=x.url||`https://www.flightradar24.com/${encodeURIComponent(x.callsign||x.flight||"")}`;
      return `<a class="top-tracked-row" target="_blank" rel="noopener noreferrer" href="${escHtml(url)}"><b class="top-rank">${i+1}</b><div class="top-flight-main"><div class="top-flight-title"><strong>${flight}</strong>${callsign?`<span class="top-callsign">${callsign}</span>`:""}</div><span class="top-route">${route}</span><small>${codes}${codes&&model?" • ":""}${model}</small></div><div class="top-followers"><strong>👁 ${people}</strong><span>acompanhando</span></div></a>`;
    }).join("");
  }catch(e){
    status.innerHTML=`Não foi possível carregar o ranking automaticamente. <a target="_blank" rel="noopener noreferrer" href="https://www.flightradar24.com/flights/most-tracked">Abrir ranking no Flightradar24 ↗</a>`;
  }
}
function select(f){
  selected=f;
  flights.forEach(x=>x.selected=false); f.selected=true;
  const call=String(f.callsign||"SEM CALLSIGN").trim().toUpperCase();
  const reg=String(f.reg||f.registration||"—").trim().toUpperCase();
  const type=f.type||f.model||"Aeronave";
  const airline=f.operator||f.airline||f.originCountry||"Aeronave em voo";
  const operated=f.operator&&f.airline&&f.operator!==f.airline?f.operator:f.operator||"";
  const from=String(f.from||f.origin||"—").toUpperCase();
  const to=String(f.to||f.destination||"—").toUpperCase();
  const fromName=f.fromName||f.originName||"";
  const toName=f.toName||f.destinationName||"";
  const scheduledFrom=f.departureScheduled||f.scheduledDeparture||"";
  const actualFrom=f.departureActual||f.actualDeparture||"";
  const scheduledTo=f.arrivalScheduled||f.scheduledArrival||"";
  const estimatedTo=f.arrivalEstimated||f.estimatedArrival||"";
  const route=(from!=="—"&&to!=="—")?`${from} → ${to}`:"";
  const esc=v=>String(v??"").replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  qs("details").innerHTML=`
    <div class="fr24-head">
      <div class="fr24-head-main">
        <div class="flight-airline-head">
          ${airlineLogoMarkup(f, airline)}
          <div><div class="flight-callsign">${esc(call)}</div><div class="flight-airline">${esc(airline)}</div></div>
        </div>
        ${operated?`<div class="flight-operated">Operado por ${esc(operated)}</div>`:""}
      </div>
      <div class="fr24-head-icons"><span class="fr24-star">☆</span><button class="fr24-head-x" type="button" aria-label="Fechar">×</button></div>
    </div>
    <div class="flight-tags fr24-tags"><span>${esc(call.replace(/[^A-Z0-9]/g,""))}</span><span>${esc(type)}</span><span>ADS-B</span></div>
    <div class="flight-photo-wrap" id="flightPhotoWrap"><div class="flight-photo-loading">Carregando foto...</div></div>
    <div class="fr24-route-card">
      <div class="fr24-airport">
        <b>${esc(from)}</b><strong>${esc(fromName)}</strong><small>${esc(scheduledFrom?`Agendado ${scheduledFrom}`:"ORIGEM")}</small><em>${esc(actualFrom?`Real ${actualFrom}`:"—")}</em>
      </div>
      <div class="fr24-route-line"><span>✈</span></div>
      <div class="fr24-airport">
        <b>${esc(to)}</b><strong>${esc(toName)}</strong><small>${esc(scheduledTo?`Agendado ${scheduledTo}`:"DESTINO")}</small><em>${esc(estimatedTo?`Estimativa ${estimatedTo}:`:"—")}</em>
      </div>
    </div>
    <div class="flight-main-info fr24-extra-info">
      <div class="flight-stats"><div><small>ALTITUDE</small><b>${f.alt!=null?Number(f.alt).toLocaleString("pt-BR")+" ft":"—"}</b></div><div><small>VELOCIDADE</small><b>${f.speed!=null?f.speed+" kt":"—"}</b></div><div><small>PROA</small><b>${f.heading!=null?Math.round(f.heading)+"°":"—"}</b></div></div>
      <div class="aircraft-meta-grid" id="aircraftMeta">
        <div><small>REGISTRO</small><b>${esc(reg||"—")}</b></div>
        <div><small>PAÍS DE REGISTRO</small><b>Carregando...</b></div>
        <div><small>FABRICANTE</small><b>Carregando...</b></div>
        <div><small>PAÍS DE FABRICAÇÃO</small><b>Carregando...</b></div>
        <div><small>ANO DE FABRICAÇÃO</small><b>Carregando...</b></div>
        <div><small>IDADE</small><b>Carregando...</b></div>
      </div>
    </div>
    <a class="more-info fr24-more-info" target="_blank" rel="noopener noreferrer" href="https://www.planespotters.net/hex/${encodeURIComponent(reg)}">✈ Mais informações sobre ${esc(call)} <span>⌄</span></a>
    <div class="flight-actions fr24-actions"><button type="button" data-flight-action="3d"><span>◇</span><small>Modo 3D</small></button><button type="button" data-flight-action="route"><span>⌁</span><small>Rota</small></button><button type="button" data-flight-action="less"><span>⌄</span><small>Menos info</small></button><button type="button" data-flight-action="follow"><span>✧</span><small>Seguir</small></button><button type="button" data-flight-action="share"><span>↥</span><small>Comp.</small></button></div>`;
  qs("detailsPanel").classList.remove("hidden");
  qs("details").querySelector(".fr24-head-x")?.addEventListener("click",()=>qs("closeDetails")?.click());
  initFlightActions(f);
  loadPhoto(f.hex||f.icao24||f.modeS, f.reg||f.registration, f.callsign);
  loadRoute(f);
  loadAircraftMeta(f);
  render();
}

function initFlightActions(f){
  const root=qs("details");
  if(!root)return;
  root.querySelectorAll("[data-flight-action]").forEach(btn=>btn.addEventListener("click",async()=>{
    const action=btn.dataset.flightAction;
    if(action==="route") {
      routeVisible=!routeVisible;
      btn.classList.toggle("active",routeVisible);
      if(routeVisible){
        drawSelectedRoute(f);
        const pts=[];
        if(Number.isFinite(Number(f.fromLat))&&Number.isFinite(Number(f.fromLon)))pts.push([Number(f.fromLat),Number(f.fromLon)]);
        if(Number.isFinite(Number(f.lat))&&Number.isFinite(Number(f.lon)))pts.push([Number(f.lat),Number(f.lon)]);
        if(Number.isFinite(Number(f.toLat))&&Number.isFinite(Number(f.toLon)))pts.push([Number(f.toLat),Number(f.toLon)]);
        if(pts.length>=2) map.fitBounds(L.latLngBounds(pts),{padding:[60,60],maxZoom:10,animate:false});
        else loadRoute(f);
      } else clearSelectedRoute();
    } else if(action==="follow") {
      followingFlight=!followingFlight;
      btn.classList.toggle("active",followingFlight);
      if(followingFlight && Number.isFinite(Number(f.lat))&&Number.isFinite(Number(f.lon))) map.setView([Number(f.lat),Number(f.lon)],Math.max(map.getZoom(),9),{animate:false});
    } else if(action==="less") {
      const extra=root.querySelector(".fr24-extra-info");
      const more=root.querySelector(".fr24-more-info");
      const hide=extra?.classList.toggle("hidden");
      if(more)more.classList.toggle("hidden",!!hide);
      btn.classList.toggle("active",!!hide);
    } else if(action==="3d") {
      map.setView([Number(f.lat),Number(f.lon)],Math.max(map.getZoom(),12),{animate:true});
      btn.classList.add("active"); setTimeout(()=>btn.classList.remove("active"),800);
    } else if(action==="share") {
      const text=`AERO RADAR — ${String(f.callsign||"").trim()} ${f.from||""} → ${f.to||""}`;
      try { if(navigator.share) await navigator.share({title:"AERO RADAR",text,url:location.href}); else { await navigator.clipboard.writeText(text); btn.classList.add("active"); setTimeout(()=>btn.classList.remove("active"),1000); } } catch(_) {}
    }
  }));
  root.querySelector('[data-flight-action="route"]')?.classList.toggle("active",routeVisible);
  root.querySelector('[data-flight-action="follow"]')?.classList.toggle("active",followingFlight);
}

async function loadAircraftMeta(f){
  const box=qs("details")?.querySelector("#aircraftMeta");
  if(!box)return;
  const cells=box.querySelectorAll("div");
  const countryCell=cells[1]?.querySelector("b");
  const yearCell=cells[2]?.querySelector("b");
  const ageCell=cells[5]?.querySelector("b");
  const manufacturerCell=cells[2]?.querySelector("b");
  const manufacturerCountryCell=cells[3]?.querySelector("b");
  const hex=String(f?.hex||f?.icao24||f?.modeS||"").trim().toUpperCase();
  const registration=String(f?.reg||f?.registration||"").trim().toUpperCase();
  try{
    const callsign=String(f?.callsign||"").trim().toUpperCase();
    const r=await fetch(`${API}/api/aircraft-meta?hex=${encodeURIComponent(hex)}&registration=${encodeURIComponent(registration)}&callsign=${encodeURIComponent(callsign)}`,{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const d=await r.json();
    if(countryCell) countryCell.textContent=d.country || "Não disponível";
    if(manufacturerCell) manufacturerCell.textContent=d.manufacturer || "Não disponível";
    if(manufacturerCountryCell) manufacturerCountryCell.textContent=d.manufacturerCountry || "Não disponível";
    if(yearCell) yearCell.textContent=d.yearBuilt ? String(d.yearBuilt) : "Não disponível";
    if(ageCell) ageCell.textContent=Number.isFinite(Number(d.ageYears)) ? `${d.ageYears} anos` : "Não disponível";
    if(d.registration){
      const headReg=qs("details")?.querySelector(".flight-tags span");
      if(headReg && !registration) headReg.textContent=d.registration;
    }
    if(d.operator){
      const airlineEl=qs("details")?.querySelector(".flight-airline");
      if(airlineEl && (!f.operator || airlineEl.textContent===f.originCountry || airlineEl.textContent==="Aeronave em voo")) airlineEl.textContent=d.operator;
      f.operator=d.operator;
    }
  }catch(e){
    if(countryCell) countryCell.textContent="Não disponível";
    if(manufacturerCell) manufacturerCell.textContent="Não disponível";
    if(manufacturerCountryCell) manufacturerCountryCell.textContent="Não disponível";
    if(yearCell) yearCell.textContent="Não disponível";
    if(ageCell) ageCell.textContent="Não disponível";
  }
}

async function loadRoute(f){
  const cs=String(f?.callsign||"").trim().toUpperCase();
  const card=qs("details")?.querySelector(".fr24-route-card");
  if(!cs || !card) return;
  card.classList.add("route-loading");
  try{
    const hex=String(f?.hex||f?.icao24||f?.modeS||"").trim().toUpperCase();
    const registration=String(f?.reg||f?.registration||"").trim().toUpperCase();
    const r=await fetch(`${API}/api/route?callsign=${encodeURIComponent(cs)}&hex=${encodeURIComponent(hex)}&registration=${encodeURIComponent(registration)}`,{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    if(data.from || data.to){
      f.from=data.from||f.from||"—";
      f.to=data.to||f.to||"—";
      f.fromName=data.fromName||f.fromName||"";
      f.toName=data.toName||f.toName||"";
      f.fromLat=Number(data.fromLat); f.fromLon=Number(data.fromLon);
      f.toLat=Number(data.toLat); f.toLon=Number(data.toLon);
      const left=card.querySelectorAll(".fr24-airport")[0];
      const right=card.querySelectorAll(".fr24-airport")[1];
      if(left){
        left.querySelector("b").textContent=f.from||"—";
        left.querySelector("strong").textContent=f.fromName||"";
        left.querySelector("small").textContent="ORIGEM";
      }
      if(right){
        right.querySelector("b").textContent=f.to||"—";
        right.querySelector("strong").textContent=f.toName||"";
        right.querySelector("small").textContent="DESTINO";
      }
      drawSelectedRoute(f);
    }
  }catch(e){
    console.warn("Rota indisponível:",e.message);
    drawSelectedRoute(f);
  }finally{
    card.classList.remove("route-loading");
  }
}

async function loadPhoto(hex, registration, callsign){
  const wrap=qs("flightPhotoWrap");
  if(!wrap)return;
  const cleanHex=String(hex||"").trim().toUpperCase();
  const cleanReg=String(registration||"").trim().toUpperCase();
  const fallbackUrl=cleanHex ? `https://www.planespotters.net/hex/${encodeURIComponent(cleanHex)}` : (cleanReg ? `https://www.planespotters.net/photos/reg/${encodeURIComponent(cleanReg)}` : "https://www.planespotters.net/photos");
  if(!cleanHex && !cleanReg){ wrap.innerHTML=`<div class="fr24-photo-empty">Foto indisponível</div>`; return; }
  try{
    const endpoint=C.photoEndpoint||"/api/photos";
    const r=await fetch(`${API}${endpoint}?hex=${encodeURIComponent(cleanHex)}&registration=${encodeURIComponent(cleanReg)}${callsign?`&callsign=${encodeURIComponent(String(callsign).trim().toUpperCase())}`:""}`,{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    const ps=(Array.isArray(data.photos)?data.photos:[]).slice(0,3).map(p=>({...p,source:"Planespotters"}));
    const jp=(Array.isArray(data.jetPhotos)?data.jetPhotos:[]).slice(0,3).map(p=>({...p,source:"JetPhotos"}));
    const photos=[...ps,...jp];
    const registration=data.registration||"";
    const jetphotosUrl=data.jetphotosUrl || `https://www.jetphotos.com/photo/search?keywords=${encodeURIComponent(registration||cleanHex)}`;
    if(!photos.length){
      wrap.innerHTML=`<div class="fr24-photo-empty"><b>Foto indisponível</b><div class="photo-sources"><a href="${fallbackUrl}" target="_blank" rel="noopener noreferrer">📷 Planespotters</a><a href="${jetphotosUrl}" target="_blank" rel="noopener noreferrer">📷 JetPhotos</a></div></div>`;
      return;
    }
    let current=0;
    const renderGallery=()=>{
      const photo=photos[current];
      wrap.innerHTML=`
        <div class="fr24-photo-carousel">
          <button class="fr24-photo-arrow fr24-photo-prev" type="button" aria-label="Foto anterior">‹</button>
          <a class="fr24-photo-image" href="${photo.photoUrl||fallbackUrl}" target="_blank" rel="noopener noreferrer">
            <img src="${photo.thumbnailUrl||photo.photoUrl||""}" alt="${photo.source} — foto ${current+1}" referrerpolicy="no-referrer">
            <span class="fr24-photo-open">↗</span>
            ${photo.photographer?`<small>© ${escPhoto(photo.photographer)}</small>`:""}
          </a>
          <button class="fr24-photo-arrow fr24-photo-next" type="button" aria-label="Próxima foto">›</button>
          <div class="fr24-photo-dots">${photos.map((_,i)=>`<button type="button" class="${i===current?"active":""}" data-photo-index="${i}" aria-label="Foto ${i+1}"></button>`).join("")}</div>
        </div>`;
      wrap.querySelectorAll("[data-photo-index]").forEach(btn=>btn.addEventListener("click",()=>{current=Number(btn.dataset.photoIndex)||0;renderGallery();}));
      wrap.querySelector(".fr24-photo-prev")?.addEventListener("click",()=>{current=(current-1+photos.length)%photos.length;renderGallery();});
      wrap.querySelector(".fr24-photo-next")?.addEventListener("click",()=>{current=(current+1)%photos.length;renderGallery();});
    };
    renderGallery();
  }catch(e){
    console.warn("Falha ao carregar fotos:",e);
    const jetphotosUrl=`https://www.jetphotos.com/photo/search?keywords=${encodeURIComponent(cleanReg||cleanHex)}`;
    wrap.innerHTML=`<div class="fr24-photo-empty"><b>Foto indisponível</b><div class="photo-sources"><a href="${fallbackUrl}" target="_blank" rel="noopener noreferrer">📷 Planespotters</a><a href="${jetphotosUrl}" target="_blank" rel="noopener noreferrer">📷 JetPhotos</a></div></div>`;
  }
}
function escPhoto(v){return String(v??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function renderPopular(arr){
  const el=qs("popular");if(!el)return;
  el.innerHTML=arr.slice(0,6).map(f=>{
    const reg=f.reg||"";
    const url=reg?`https://www.planespotters.net/hex/${encodeURIComponent(reg)}`:"https://www.planespotters.net/";
    return `<div class="item photo-item"><b>${f.callsign||"SEM CALLSIGN"}</b><br>${f.model||f.type||"Aeronave"}<br>${reg||"—"}<br><a target="_blank" rel="noopener noreferrer" href="${url}">📷 Fotos no Planespotters</a></div>`;
  }).join("");
}
function renderFleet(arr){
  const el=qs("fleetList");if(!el)return;
  el.innerHTML=arr.slice(0,80).map(f=>`<div class="item"><b>${f.callsign||"SEM CALLSIGN"}</b><br>${f.model||f.type||"Aeronave"}<br>${f.reg||"—"}</div>`).join("");
}
function renderRetired(filter=""){
  const el=qs("retiredList");if(!el)return;
  const q=String(filter||"").trim().toLowerCase();
  const list=retired.filter(f=>!q || [f.type,f.model,f.manufacturer,f.operator,f.status].some(v=>String(v||"").toLowerCase().includes(q)));
  const count=qs("retiredCount"); if(count) count.textContent=list.length;
  el.innerHTML=list.map(f=>{
    const url=`https://www.planespotters.net/photos/search?keywords=${encodeURIComponent(f.model)}`;
    return `<article class="item retired-item"><div class="retired-item-top"><b>${f.model}</b><span class="status-retired">${f.status}</span></div><div class="retired-meta">${f.manufacturer} · ${f.type}</div><div class="retired-meta">${f.operator}</div><a target="_blank" rel="noopener noreferrer" href="${url}">📷 Ver fotos e histórico</a></article>`;
  }).join("") || `<div class="airport-empty">Nenhuma aeronave encontrada.</div>`;
}

function renderAirports(arr){
  const el=qs("airports");if(!el)return;
  el.innerHTML=airports.map(a=>`<div class="item"><b>${a.code}</b><br>${a.name}</div>`).join("");
}
function renderCameras(){
  const el=qs("cameraGrid");if(!el)return;
  el.innerHTML=cameras.map(c=>{
    const body=c.embed
      ? `<iframe loading="lazy" src="${c.embed}" title="${c.name}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<div class="camera-unavailable"><b>📹 ${c.name}</b><span>Fonte externa disponível para esta câmera.</span></div>`;
    return `<article class="camera-card"><div class="camera-head"><b>${c.icao}</b><span>● AO VIVO</span></div>${body}<div class="camera-foot"><small>${c.provider}</small><a href="${c.source}" target="_blank" rel="noopener noreferrer">Fonte</a></div></article>`;
  }).join("");
}
async function loadReal(){
  if(!map)return;
  const b=map.getBounds();
  const params=new URLSearchParams({lamin:b.getSouth().toFixed(3),lomin:b.getWest().toFixed(3),lamax:b.getNorth().toFixed(3),lomax:b.getEast().toFixed(3),zoom:String(map.getZoom())});
  try{
    const r=await fetch(`${API}/api/flights?${params}`,{cache:"no-store"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const data=await r.json();
    let real=Array.isArray(data.flights)?data.flights:[];
    flights=real.map(x=>({...x,source:"real",category:applyCategoryFromData(x)}));
    rememberFlightPositions(flights);
    if(selected){
      const fresh=flights.find(x=>String(x.callsign||"").trim().toUpperCase()===String(selected.callsign||"").trim().toUpperCase());
      if(fresh){ fresh.selected=true; selected=fresh; }
    }
    if(followingFlight && selected && Number.isFinite(Number(selected.lat)) && Number.isFinite(Number(selected.lon))){
      map.setView([Number(selected.lat), Number(selected.lon)], Math.max(map.getZoom(), 9), {animate:false});
    }
  }catch(e){
    // Nunca inserir aeronaves fictícias no radar. Mantém os últimos dados reais se houver.
    console.error("Falha ao atualizar OpenSky:",e);
  }
  lastFetch=Date.now(); updateFilters(); render();
}
function scheduleReal(){
  clearTimeout(fetchTimer);
  fetchTimer=setTimeout(()=>loadReal(),700);
}
function toggleTopTrackedPanel(){
  const wrap=document.querySelector(".below-map");
  if(!wrap)return;
  wrap.classList.remove("camera-visible","retired-visible");
  wrap.classList.toggle("toptracked-visible",true);
  document.getElementById("topvoos")?.scrollIntoView({behavior:"smooth",block:"start"});
  loadTopTracked();
}
function toggleCameraPanel(){
  const sec=qs("cameras"), wrap=document.querySelector(".below-map");
  if(!sec||!wrap)return;
  const on=qs("showCameras").checked;
  wrap.classList.toggle("camera-visible",on);
  wrap.classList.toggle("retired-visible",false);
  sec.classList.toggle("camera-focus",on);
}
function toggleRetiredPanel(){
  const wrap=document.querySelector(".below-map");
  if(!wrap)return;
  const on=qs("retired").checked;
  wrap.classList.toggle("retired-visible",on);
  wrap.classList.toggle("camera-visible",false);
}
const radios=[["SBCT","Curitiba"],["SBRF","Recife"],["SBBR","Brasília"],["SBFZ","Fortaleza"],["SBGR","Guarulhos"],["KJFK","New York JFK"],["KLAX","Los Angeles"],["EGLL","London Heathrow"],["LFPG","Paris CDG"],["OMDB","Dubai"],["RJTT","Tokyo Haneda"],["YSSY","Sydney"]];
const I18N={
"pt-PT":{"nav.map":"Mapa","nav.aircraft":"Aeronaves","nav.airports":"Aeroportos","nav.photos":"Fotografias","nav.destinations":"Destinos","nav.top":"Voos mais seguidos","nav.myflight":"O meu voo","nav.radio":"Rádio","nav.settings":"Definições","filters.title":"Filtros","filters.allAircraft":"Todas as aeronaves","filters.commercial":"Aeronaves comerciais","filters.executive":"Aeronaves executivas","filters.military":"Aeronaves militares","filters.airborne":"Aeronaves em voo","filters.ground":"Aeronaves em terra / porta","filters.retired":"Aeronaves retiradas","filters.airports":"Aeroportos","filters.routes":"Rotas","filters.cameras":"Câmaras ao vivo","filters.aircraftType":"Tipo de aeronave","filters.airport":"Aeroporto","filters.country":"País","filters.route":"Origem/Destino","search.placeholder":"Pesquisar voo, aeronave, aeroporto, matrícula...","map.all":"Todas","map.commercial":"Comerciais","map.executive":"Executivas","map.military":"Militares","map.airports":"Aeroportos","map.filters":"Filtros","map.total":"Total de aeronaves apresentadas","cards.allAircraft":"Todas as aeronaves","cards.airports":"Aeroportos","cards.photos":"Fotografias da aeronave","cards.destinations":"Destinos em tempo real","cards.topFlights":"Voos mais seguidos no mundo","cards.cameras":"Câmaras ao vivo","cards.settings":"Definições","auth.login":"Entrar / Registar","auth.logout":"Terminar sessão"},
"pt-BR":{"nav.map":"Mapa","nav.aircraft":"Aeronaves","nav.airports":"Aeroportos","nav.photos":"Fotos","nav.destinations":"Destinos","nav.top":"Top voos","nav.myflight":"Meu voo","nav.radio":"Rádio","nav.settings":"Configurações","filters.title":"Filtros","filters.allAircraft":"Todas as aeronaves","filters.commercial":"Aeronaves comerciais","filters.executive":"Aeronaves executivas","filters.military":"Aeronaves militares","filters.airborne":"Aeronaves em voo","filters.ground":"Aeronaves em solo / gate","filters.retired":"Aeronaves aposentadas","filters.airports":"Aeroportos","filters.routes":"Rotas","filters.cameras":"Câmeras ao vivo","filters.aircraftType":"Tipo de aeronave","filters.airport":"Aeroporto","filters.country":"País","filters.route":"Origem/Destino","search.placeholder":"Buscar voo, aeronave, aeroporto, matrícula...","map.all":"Todas","map.commercial":"Comerciais","map.executive":"Executivas","map.military":"Militares","map.airports":"Aeroportos","map.filters":"Filtros","map.total":"Total de aeronaves exibidas","cards.allAircraft":"Todas as aeronaves","cards.airports":"Aeroportos","cards.photos":"Fotos da aeronave","cards.destinations":"Destinos em tempo real","cards.topFlights":"Voos mais vistos no mundo","cards.cameras":"Câmeras ao vivo","cards.settings":"Configurações","auth.login":"Entrar / Cadastro","auth.logout":"Sair"},
"en":{"nav.map":"Map","nav.aircraft":"Aircraft","nav.airports":"Airports","nav.photos":"Photos","nav.destinations":"Destinations","nav.top":"Top flights","nav.myflight":"My flight","nav.radio":"Radio","nav.settings":"Settings","filters.title":"Filters","filters.allAircraft":"All aircraft","filters.commercial":"Commercial aircraft","filters.executive":"Business aircraft","filters.military":"Military aircraft","filters.airborne":"Aircraft in flight","filters.ground":"Aircraft on ground / gate","filters.retired":"Retired aircraft","filters.airports":"Airports","filters.routes":"Routes","filters.cameras":"Live cameras","filters.aircraftType":"Aircraft type","filters.airport":"Airport","filters.country":"Country","filters.route":"Origin/Destination","search.placeholder":"Search flight, aircraft, airport, registration...","map.all":"All","map.commercial":"Commercial","map.executive":"Business","map.military":"Military","map.airports":"Airports","map.filters":"Filters","map.total":"Total aircraft displayed","cards.allAircraft":"All aircraft","cards.airports":"Airports","cards.photos":"Aircraft photos","cards.destinations":"Real-time destinations","cards.topFlights":"Most tracked flights worldwide","cards.cameras":"Live cameras","cards.settings":"Settings","auth.login":"Login / Sign up","auth.logout":"Log out"},
"es":{"nav.map":"Mapa","nav.aircraft":"Aeronaves","nav.airports":"Aeropuertos","nav.photos":"Fotos","nav.destinations":"Destinos","nav.top":"Vuelos principales","nav.myflight":"Mi vuelo","nav.radio":"Radio","nav.settings":"Configuración","filters.title":"Filtros","filters.allAircraft":"Todas las aeronaves","filters.commercial":"Aeronaves comerciales","filters.executive":"Aeronaves ejecutivas","filters.military":"Aeronaves militares","filters.airborne":"Aeronaves en vuelo","filters.ground":"Aeronaves en tierra / puerta","filters.retired":"Aeronaves retiradas","filters.airports":"Aeropuertos","filters.routes":"Rutas","filters.cameras":"Cámaras en vivo","filters.aircraftType":"Tipo de aeronave","filters.airport":"Aeropuerto","filters.country":"País","filters.route":"Origen/Destino","search.placeholder":"Buscar vuelo, aeronave, aeropuerto, matrícula...","map.all":"Todas","map.commercial":"Comerciales","map.executive":"Ejecutivas","map.military":"Militares","map.airports":"Aeropuertos","map.filters":"Filtros","map.total":"Total de aeronaves mostradas","cards.allAircraft":"Todas las aeronaves","cards.airports":"Aeropuertos","cards.photos":"Fotos de aeronaves","cards.destinations":"Destinos en tiempo real","cards.topFlights":"Vuelos más seguidos del mundo","cards.cameras":"Cámaras en vivo","cards.settings":"Configuración","auth.login":"Entrar / Registrarse","auth.logout":"Salir"},
"fr":{"nav.map":"Carte","nav.aircraft":"Avions","nav.airports":"Aéroports","nav.photos":"Photos","nav.destinations":"Destinations","nav.top":"Vols populaires","nav.myflight":"Mon vol","nav.radio":"Radio","nav.settings":"Paramètres","filters.title":"Filtres","filters.allAircraft":"Tous les avions","filters.commercial":"Avions commerciaux","filters.executive":"Avions d'affaires","filters.military":"Avions militaires","filters.airborne":"Avions en vol","filters.ground":"Avions au sol / porte","filters.retired":"Avions retirés","filters.airports":"Aéroports","filters.routes":"Routes","filters.cameras":"Caméras en direct","filters.aircraftType":"Type d'avion","filters.airport":"Aéroport","filters.country":"Pays","filters.route":"Origine/Destination","search.placeholder":"Rechercher un vol, avion, aéroport, immatriculation...","map.all":"Tous","map.commercial":"Commerciaux","map.executive":"Affaires","map.military":"Militaires","map.airports":"Aéroports","map.filters":"Filtres","map.total":"Total des avions affichés","cards.allAircraft":"Tous les avions","cards.airports":"Aéroports","cards.photos":"Photos d'avions","cards.destinations":"Destinations en temps réel","cards.topFlights":"Vols les plus suivis au monde","cards.cameras":"Caméras en direct","cards.settings":"Paramètres","auth.login":"Connexion / Inscription","auth.logout":"Déconnexion"},
"de":{"nav.map":"Karte","nav.aircraft":"Flugzeuge","nav.airports":"Flughäfen","nav.photos":"Fotos","nav.destinations":"Ziele","nav.top":"Top-Flüge","nav.myflight":"Mein Flug","nav.radio":"Funk","nav.settings":"Einstellungen","filters.title":"Filter","filters.allAircraft":"Alle Flugzeuge","filters.commercial":"Verkehrsflugzeuge","filters.executive":"Geschäftsflugzeuge","filters.military":"Militärflugzeuge","filters.airborne":"Flugzeuge in der Luft","filters.ground":"Flugzeuge am Boden / Gate","filters.retired":"Ausgemusterte Flugzeuge","filters.airports":"Flughäfen","filters.routes":"Routen","filters.cameras":"Live-Kameras","filters.aircraftType":"Flugzeugtyp","filters.airport":"Flughafen","filters.country":"Land","filters.route":"Start/Ziel","search.placeholder":"Flug, Flugzeug, Flughafen, Registrierung suchen...","map.all":"Alle","map.commercial":"Verkehr","map.executive":"Geschäft","map.military":"Militär","map.airports":"Flughäfen","map.filters":"Filter","map.total":"Angezeigte Flugzeuge","cards.allAircraft":"Alle Flugzeuge","cards.airports":"Flughäfen","cards.photos":"Flugzeugfotos","cards.destinations":"Ziele in Echtzeit","cards.topFlights":"Meistverfolgte Flüge weltweit","cards.cameras":"Live-Kameras","cards.settings":"Einstellungen","auth.login":"Anmelden / Registrieren","auth.logout":"Abmelden"},
"it":{"nav.map":"Mappa","nav.aircraft":"Aerei","nav.airports":"Aeroporti","nav.photos":"Foto","nav.destinations":"Destinazioni","nav.top":"Voli principali","nav.myflight":"Il mio volo","nav.radio":"Radio","nav.settings":"Impostazioni","filters.title":"Filtri","filters.allAircraft":"Tutti gli aerei","filters.commercial":"Aerei commerciali","filters.executive":"Aerei business","filters.military":"Aerei militari","filters.airborne":"Aerei in volo","filters.ground":"Aerei a terra / gate","filters.retired":"Aerei ritirati","filters.airports":"Aeroporti","filters.routes":"Rotte","filters.cameras":"Telecamere live","filters.aircraftType":"Tipo di aereo","filters.airport":"Aeroporto","filters.country":"Paese","filters.route":"Origine/Destinazione","search.placeholder":"Cerca volo, aereo, aeroporto, registrazione...","map.all":"Tutti","map.commercial":"Commerciali","map.executive":"Business","map.military":"Militari","map.airports":"Aeroporti","map.filters":"Filtri","map.total":"Totale aerei visualizzati","cards.allAircraft":"Tutti gli aerei","cards.airports":"Aeroporti","cards.photos":"Foto degli aerei","cards.destinations":"Destinazioni in tempo reale","cards.topFlights":"Voli più seguiti nel mondo","cards.cameras":"Telecamere live","cards.settings":"Impostazioni","auth.login":"Accedi / Registrati","auth.logout":"Esci"},
"ja":{"nav.map":"マップ","nav.aircraft":"航空機","nav.airports":"空港","nav.photos":"写真","nav.destinations":"目的地","nav.top":"人気のフライト","nav.myflight":"マイフライト","nav.radio":"無線","nav.settings":"設定","filters.title":"フィルター","filters.allAircraft":"すべての航空機","filters.commercial":"旅客機","filters.executive":"ビジネス機","filters.military":"軍用機","filters.airborne":"飛行中","filters.ground":"地上 / ゲート","filters.retired":"退役機","filters.airports":"空港","filters.routes":"ルート","filters.cameras":"ライブカメラ","filters.aircraftType":"航空機タイプ","filters.airport":"空港","filters.country":"国","filters.route":"出発地/目的地","search.placeholder":"フライト、航空機、空港、登録番号を検索...","map.all":"すべて","map.commercial":"旅客機","map.executive":"ビジネス","map.military":"軍用","map.airports":"空港","map.filters":"フィルター","map.total":"表示中の航空機数","cards.allAircraft":"すべての航空機","cards.airports":"空港","cards.photos":"航空機写真","cards.destinations":"リアルタイム目的地","cards.topFlights":"世界で最も追跡されているフライト","cards.cameras":"ライブカメラ","cards.settings":"設定","auth.login":"ログイン / 登録","auth.logout":"ログアウト"},
"ko":{"nav.map":"지도","nav.aircraft":"항공기","nav.airports":"공항","nav.photos":"사진","nav.destinations":"목적지","nav.top":"인기 항공편","nav.myflight":"내 항공편","nav.radio":"라디오","nav.settings":"설정","filters.title":"필터","filters.allAircraft":"모든 항공기","filters.commercial":"상업용 항공기","filters.executive":"비즈니스 항공기","filters.military":"군용 항공기","filters.airborne":"비행 중","filters.ground":"지상 / 게이트","filters.retired":"퇴역 항공기","filters.airports":"공항","filters.routes":"노선","filters.cameras":"실시간 카메라","filters.aircraftType":"항공기 종류","filters.airport":"공항","filters.country":"국가","filters.route":"출발/도착","search.placeholder":"항공편, 항공기, 공항, 등록번호 검색...","map.all":"전체","map.commercial":"상업용","map.executive":"비즈니스","map.military":"군용","map.airports":"공항","map.filters":"필터","map.total":"표시된 항공기 수","cards.allAircraft":"모든 항공기","cards.airports":"공항","cards.photos":"항공기 사진","cards.destinations":"실시간 목적지","cards.topFlights":"세계 인기 추적 항공편","cards.cameras":"실시간 카메라","cards.settings":"설정","auth.login":"로그인 / 가입","auth.logout":"로그아웃"},
"ru":{"nav.map":"Карта","nav.aircraft":"Самолёты","nav.airports":"Аэропорты","nav.photos":"Фото","nav.destinations":"Направления","nav.top":"Популярные рейсы","nav.myflight":"Мой рейс","nav.radio":"Радио","nav.settings":"Настройки","filters.title":"Фильтры","filters.allAircraft":"Все воздушные суда","filters.commercial":"Гражданские самолёты","filters.executive":"Бизнес-авиация","filters.military":"Военные самолёты","filters.airborne":"В полёте","filters.ground":"На земле / у выхода","filters.retired":"Выведенные из эксплуатации","filters.airports":"Аэропорты","filters.routes":"Маршруты","filters.cameras":"Камеры в реальном времени","filters.aircraftType":"Тип самолёта","filters.airport":"Аэропорт","filters.country":"Страна","filters.route":"Откуда/Куда","search.placeholder":"Поиск рейса, самолёта, аэропорта, регистрации...","map.all":"Все","map.commercial":"Гражданские","map.executive":"Бизнес","map.military":"Военные","map.airports":"Аэропорты","map.filters":"Фильтры","map.total":"Всего отображаемых самолётов","cards.allAircraft":"Все воздушные суда","cards.airports":"Аэропорты","cards.photos":"Фото самолётов","cards.destinations":"Направления в реальном времени","cards.topFlights":"Самые отслеживаемые рейсы в мире","cards.cameras":"Камеры в реальном времени","cards.settings":"Настройки","auth.login":"Войти / Регистрация","auth.logout":"Выйти"},
"nl":{"nav.map":"Kaart","nav.aircraft":"Vliegtuigen","nav.airports":"Luchthavens","nav.photos":"Foto's","nav.destinations":"Bestemmingen","nav.top":"Topvluchten","nav.myflight":"Mijn vlucht","nav.radio":"Radio","nav.settings":"Instellingen","filters.title":"Filters","filters.allAircraft":"Alle vliegtuigen","filters.commercial":"Commerciële vliegtuigen","filters.executive":"Zakenvliegtuigen","filters.military":"Militaire vliegtuigen","filters.airborne":"Vliegtuigen in de lucht","filters.ground":"Vliegtuigen op de grond / gate","filters.retired":"Buiten dienst","filters.airports":"Luchthavens","filters.routes":"Routes","filters.cameras":"Livecamera's","filters.aircraftType":"Vliegtuigtype","filters.airport":"Luchthaven","filters.country":"Land","filters.route":"Herkomst/Bestemming","search.placeholder":"Zoek vlucht, vliegtuig, luchthaven, registratie...","map.all":"Alle","map.commercial":"Commercieel","map.executive":"Zakelijk","map.military":"Militair","map.airports":"Luchthavens","map.filters":"Filters","map.total":"Totaal weergegeven vliegtuigen","cards.allAircraft":"Alle vliegtuigen","cards.airports":"Luchthavens","cards.photos":"Vliegtuigfoto's","cards.destinations":"Bestemmingen in realtime","cards.topFlights":"Meest gevolgde vluchten wereldwijd","cards.cameras":"Livecamera's","cards.settings":"Instellingen","auth.login":"Inloggen / Registreren","auth.logout":"Uitloggen"},
"tr":{"nav.map":"Harita","nav.aircraft":"Uçaklar","nav.airports":"Havalimanları","nav.photos":"Fotoğraflar","nav.destinations":"Destinasyonlar","nav.top":"Popüler uçuşlar","nav.myflight":"Uçuşum","nav.radio":"Radyo","nav.settings":"Ayarlar","filters.title":"Filtreler","filters.allAircraft":"Tüm uçaklar","filters.commercial":"Ticari uçaklar","filters.executive":"İş jetleri","filters.military":"Askeri uçaklar","filters.airborne":"Havadaki uçaklar","filters.ground":"Yerde / kapıda","filters.retired":"Emekli uçaklar","filters.airports":"Havalimanları","filters.routes":"Rotalar","filters.cameras":"Canlı kameralar","filters.aircraftType":"Uçak tipi","filters.airport":"Havalimanı","filters.country":"Ülke","filters.route":"Kalkış/Varış","search.placeholder":"Uçuş, uçak, havalimanı, tescil ara...","map.all":"Tümü","map.commercial":"Ticari","map.executive":"İş jeti","map.military":"Askeri","map.airports":"Havalimanları","map.filters":"Filtreler","map.total":"Gösterilen toplam uçak","cards.allAircraft":"Tüm uçaklar","cards.airports":"Havalimanları","cards.photos":"Uçak fotoğrafları","cards.destinations":"Gerçek zamanlı destinasyonlar","cards.topFlights":"Dünyada en çok takip edilen uçuşlar","cards.cameras":"Canlı kameralar","cards.settings":"Ayarlar","auth.login":"Giriş / Kayıt","auth.logout":"Çıkış"},
"pl":{"nav.map":"Mapa","nav.aircraft":"Samoloty","nav.airports":"Lotniska","nav.photos":"Zdjęcia","nav.destinations":"Kierunki","nav.top":"Najpopularniejsze loty","nav.myflight":"Mój lot","nav.radio":"Radio","nav.settings":"Ustawienia","filters.title":"Filtry","filters.allAircraft":"Wszystkie samoloty","filters.commercial":"Samoloty pasażerskie","filters.executive":"Samoloty biznesowe","filters.military":"Samoloty wojskowe","filters.airborne":"Samoloty w locie","filters.ground":"Na ziemi / przy bramce","filters.retired":"Wycofane samoloty","filters.airports":"Lotniska","filters.routes":"Trasy","filters.cameras":"Kamery na żywo","filters.aircraftType":"Typ samolotu","filters.airport":"Lotnisko","filters.country":"Kraj","filters.route":"Początek/Cel","search.placeholder":"Szukaj lotu, samolotu, lotniska, rejestracji...","map.all":"Wszystkie","map.commercial":"Pasażerskie","map.executive":"Biznesowe","map.military":"Wojskowe","map.airports":"Lotniska","map.filters":"Filtry","map.total":"Łącznie wyświetlanych samolotów","cards.allAircraft":"Wszystkie samoloty","cards.airports":"Lotniska","cards.photos":"Zdjęcia samolotów","cards.destinations":"Kierunki w czasie rzeczywistym","cards.topFlights":"Najczęściej śledzone loty na świecie","cards.cameras":"Kamery na żywo","cards.settings":"Ustawienia","auth.login":"Zaloguj / Rejestracja","auth.logout":"Wyloguj"},
"uk":{"nav.map":"Карта","nav.aircraft":"Літаки","nav.airports":"Аеропорти","nav.photos":"Фото","nav.destinations":"Напрямки","nav.top":"Популярні рейси","nav.myflight":"Мій рейс","nav.radio":"Радіо","nav.settings":"Налаштування","filters.title":"Фільтри","filters.allAircraft":"Усі літаки","filters.commercial":"Цивільні літаки","filters.executive":"Бізнес-літаки","filters.military":"Військові літаки","filters.airborne":"У польоті","filters.ground":"На землі / біля виходу","filters.retired":"Виведені з експлуатації","filters.airports":"Аеропорти","filters.routes":"Маршрути","filters.cameras":"Камери наживо","filters.aircraftType":"Тип літака","filters.airport":"Аеропорт","filters.country":"Країна","filters.route":"Звідки/Куди","search.placeholder":"Пошук рейсу, літака, аеропорту, реєстрації...","map.all":"Усі","map.commercial":"Цивільні","map.executive":"Бізнес","map.military":"Військові","map.airports":"Аеропорти","map.filters":"Фільтри","map.total":"Усього показано літаків","cards.allAircraft":"Усі літаки","cards.airports":"Аеропорти","cards.photos":"Фото літаків","cards.destinations":"Напрямки в реальному часі","cards.topFlights":"Найпопулярніші рейси у світі","cards.cameras":"Камери наживо","cards.settings":"Налаштування","auth.login":"Увійти / Реєстрація","auth.logout":"Вийти"},
"ar":{"nav.map":"الخريطة","nav.aircraft":"الطائرات","nav.airports":"المطارات","nav.photos":"الصور","nav.destinations":"الوجهات","nav.top":"أهم الرحلات","nav.myflight":"رحلتي","nav.radio":"الراديو","nav.settings":"الإعدادات","filters.title":"الفلاتر","filters.allAircraft":"جميع الطائرات","filters.commercial":"الطائرات التجارية","filters.executive":"طائرات رجال الأعمال","filters.military":"الطائرات العسكرية","filters.airborne":"الطائرات في الجو","filters.ground":"على الأرض / البوابة","filters.retired":"الطائرات المتقاعدة","filters.airports":"المطارات","filters.routes":"المسارات","filters.cameras":"كاميرات مباشرة","filters.aircraftType":"نوع الطائرة","filters.airport":"المطار","filters.country":"الدولة","filters.route":"المغادرة/الوصول","search.placeholder":"ابحث عن رحلة أو طائرة أو مطار أو تسجيل...","map.all":"الكل","map.commercial":"تجارية","map.executive":"رجال أعمال","map.military":"عسكرية","map.airports":"المطارات","map.filters":"الفلاتر","map.total":"إجمالي الطائرات المعروضة","cards.allAircraft":"جميع الطائرات","cards.airports":"المطارات","cards.photos":"صور الطائرات","cards.destinations":"الوجهات في الوقت الفعلي","cards.topFlights":"الرحلات الأكثر تتبعًا عالميًا","cards.cameras":"كاميرات مباشرة","cards.settings":"الإعدادات","auth.login":"دخول / تسجيل","auth.logout":"تسجيل الخروج"},
"hi":{"nav.map":"मानचित्र","nav.aircraft":"विमान","nav.airports":"हवाई अड्डे","nav.photos":"तस्वीरें","nav.destinations":"गंतव्य","nav.top":"शीर्ष उड़ानें","nav.myflight":"मेरी उड़ान","nav.radio":"रेडियो","nav.settings":"सेटिंग्स","filters.title":"फ़िल्टर","filters.allAircraft":"सभी विमान","filters.commercial":"वाणिज्यिक विमान","filters.executive":"व्यावसायिक विमान","filters.military":"सैन्य विमान","filters.airborne":"उड़ान में विमान","filters.ground":"भूमि / गेट पर विमान","filters.retired":"सेवानिवृत्त विमान","filters.airports":"हवाई अड्डे","filters.routes":"मार्ग","filters.cameras":"लाइव कैमरे","filters.aircraftType":"विमान प्रकार","filters.airport":"हवाई अड्डा","filters.country":"देश","filters.route":"प्रस्थान/गंतव्य","search.placeholder":"उड़ान, विमान, हवाई अड्डा, पंजीकरण खोजें...","map.all":"सभी","map.commercial":"वाणिज्यिक","map.executive":"व्यावसायिक","map.military":"सैन्य","map.airports":"हवाई अड्डे","map.filters":"फ़िल्टर","map.total":"दिखाए गए कुल विमान","cards.allAircraft":"सभी विमान","cards.airports":"हवाई अड्डे","cards.photos":"विमान तस्वीरें","cards.destinations":"रीयल-टाइम गंतव्य","cards.topFlights":"दुनिया में सबसे अधिक ट्रैक की गई उड़ानें","cards.cameras":"लाइव कैमरे","cards.settings":"सेटिंग्स","auth.login":"लॉगिन / साइन अप","auth.logout":"लॉग आउट"}
};
function applyLanguage(lang){
  const dict=I18N[lang]||I18N["pt-BR"];
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const v=dict[el.dataset.i18n];if(v)el.textContent=v;});
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const v=dict[el.dataset.i18nPlaceholder];if(v)el.placeholder=v;});
  localStorage.setItem("aeroLanguage",lang);
}
function initLanguage(){
  const s=qs("languageSelect"); if(!s)return;
  const saved=localStorage.getItem("aeroLanguage")||"pt-BR";
  s.value=I18N[saved]?saved:"pt-BR";
  applyLanguage(s.value);
  s.addEventListener("change",()=>applyLanguage(s.value));
}
let authenticatedUser=null;
let appStarted=false;
function authUI(){
  const modal=qs("auth"); if(!modal)return;
  modal.classList.remove("hidden");
  qs("name").style.display=mode==="register"?"block":"none";
  qs("authTitle").textContent=mode==="register"?"Criar conta":"Entrar";
  qs("authMsg").textContent="";
  setTimeout(()=>qs(mode==="register"?"name":"email")?.focus(),50);
}
function setGate(open){
  const gate=qs("authGate");
  if(gate){gate.classList.toggle("hidden",!open);gate.setAttribute("aria-hidden",String(!open));}
  document.body.classList.toggle("login-required",open);
}
function updateAuthHeader(user){
  const account=qs("topAccount"), status=qs("topAccountStatus"), topBtn=qs("topLoginBtn"), topLogout=qs("topLogoutBtn"), box=qs("userBox"), login=qs("loginBtn"), logoutBtn=qs("logoutBtn");
  authenticatedUser=user||null;
  if(user){
    if(status)status.textContent=`👤 ${user.name}`;
    if(topBtn){topBtn.classList.add("hidden");topBtn.onclick=null;}
    topLogout?.classList.remove("hidden"); topLogout?.addEventListener("click",logout,{once:true});
    logoutBtn?.classList.remove("hidden");
    logoutBtn?.addEventListener("click",logout,{once:true});
    account?.classList.add("authenticated");
    if(box)box.textContent=`Olá, ${user.name}`;
    if(login){login.textContent="Sair";login.onclick=logout;}
    setGate(false);
  }else{
    if(status)status.textContent="🔒 Acesso restrito";
    if(topBtn){topBtn.classList.remove("hidden");topBtn.textContent="Entrar / Criar conta";topBtn.onclick=()=>{mode="login";authUI();};}
    topLogout?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
    account?.classList.remove("authenticated");
    if(box)box.textContent="Faça login para acessar";
    if(login){login.textContent="Entrar / Cadastro";login.onclick=()=>{mode="login";authUI();};}
    setGate(true);
  }
}
async function authSubmit(e){
  e.preventDefault();
  const body={email:qs("email").value.trim(),password:qs("password").value};
  if(mode==="register")body.name=qs("name").value.trim();
  qs("authMsg").textContent="Processando...";
  try{
    const r=await fetch(`${API}/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){qs("authMsg").textContent=d.message||d.error||"Não foi possível concluir.";return;}
    qs("auth").classList.add("hidden");
    await checkMe();
  }catch(e){qs("authMsg").textContent="Backend não conectado.";}
}
async function checkMe(){
  try{
    const r=await fetch(`${API}/api/auth/me`,{credentials:"include",cache:"no-store"});
    if(!r.ok){updateAuthHeader(null);return false;}
    const d=await r.json();
    if(!d.user){updateAuthHeader(null);return false;}
    updateAuthHeader(d.user);
    if(!appStarted)startApp();
    return true;
  }catch(e){
    updateAuthHeader(null);
    return false;
  }
}
async function logout(){
  try{await fetch(`${API}/api/auth/logout`,{method:"POST",credentials:"include"});}catch(_){}
  authenticatedUser=null;
  updateAuthHeader(null);
  mode="login";
  qs("authForm")?.reset();
  authUI();
}
function startApp(){
  if(appStarted)return;
  appStarted=true;
  initLanguage();
  initSettings();
  initAtc();
  initMyFlights();
  initMap(); updateFilters(); render(); renderCameras(); renderAirports(airports); loadReal(); loadWorldAirports();
  ["search","aircraft","airport","country","routeFilter"].forEach(id=>{const el=qs(id);if(el)el.addEventListener("input",render)});
  ["allAircraft","commercial","executive","military"].forEach(id=>{
    const el=qs(id);
    if(!el)return;
    el.addEventListener("change",()=>{
      if(id==="allAircraft" && el.checked){["commercial","executive","military"].forEach(x=>{if(qs(x))qs(x).checked=false;});}
      if(id!=="allAircraft" && el.checked){if(qs("allAircraft"))qs("allAircraft").checked=false;}
      const any=["commercial","executive","military"].some(x=>qs(x)?.checked);
      if(id!=="allAircraft" && !any && qs("allAircraft"))qs("allAircraft").checked=true;
      const active=qs("allAircraft")?.checked?"all":["commercial","executive","military"].find(x=>qs(x)?.checked)||"all";
      document.querySelectorAll(".map-filter[data-map-filter]").forEach(b=>b.classList.toggle("active",b.dataset.mapFilter===active));
      render();
    });
  });
  qs("retired").addEventListener("change",()=>{toggleRetiredPanel(); if(qs("settingsRetired")) qs("settingsRetired").checked=qs("retired").checked; render()});
  qs("retiredSearch")?.addEventListener("input",e=>renderRetired(e.target.value));
  qs("airborne")?.addEventListener("change",()=>{if(qs("settingsAirborne")) qs("settingsAirborne").checked=qs("airborne").checked; render()});
  qs("ground")?.addEventListener("change",()=>{if(qs("settingsGround")) qs("settingsGround").checked=qs("ground").checked; render()});
  qs("showAirports").addEventListener("change",renderAirportsOnMap);
  qs("showCameras").addEventListener("change",toggleCameraPanel);
  qs("mapShowAirports")?.addEventListener("change",e=>{qs("showAirports").checked=e.target.checked;renderAirportsOnMap();});
  qs("mapFilterMore")?.addEventListener("click",()=>qs("mapAdvancedFilters").classList.toggle("open"));
  qs("mapFilterClose")?.addEventListener("click",()=>qs("mapAdvancedFilters").classList.remove("open"));
  document.querySelectorAll(".map-filter[data-map-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    const cat=btn.dataset.mapFilter;
    if(cat==="airports"){const el=qs("mapShowAirports");el.checked=!el.checked;qs("showAirports").checked=el.checked;renderAirportsOnMap();return;}
    setCategoryFilter(cat);
  }));
  ["mapAircraft","mapAirport","mapCountry","mapRoute"].forEach(id=>qs(id)?.addEventListener("change",syncMapFilters));
  qs("locate").onclick=()=>navigator.geolocation?.getCurrentPosition(p=>map.setView([p.coords.latitude,p.coords.longitude],10));
  qs("closeDetails").onclick=()=>{qs("detailsPanel").classList.add("hidden");selected=null;followingFlight=false;routeVisible=false;flights.forEach(x=>x.selected=false);clearSelectedRoute();render();};
  document.querySelector('.topnav a[href="#config"]')?.addEventListener("click",e=>{e.preventDefault();openSettings();});
  document.querySelector('.topnav a[href="#topvoos"]')?.addEventListener("click",e=>{e.preventDefault();closeSettings();toggleTopTrackedPanel();});
  document.querySelector('.topnav a[href="#destinos"]')?.addEventListener("click",e=>{e.preventDefault();closeSettings();document.querySelector(".below-map")?.classList.remove("toptracked-visible","camera-visible","retired-visible");qs("destinos")?.scrollIntoView({behavior:"smooth",block:"start"});renderDestinations();});
  document.querySelectorAll('.topnav a:not([href="#config"]):not([href="#topvoos"])').forEach(a=>a.addEventListener("click",()=>{closeSettings();document.querySelector(".below-map")?.classList.remove("toptracked-visible");}));
  setTimeout(loadTopTracked,700);
  if(qs("mapCounter")) qs("mapCounter").classList.toggle("hidden",localStorage.getItem("aeroShowCounter")==="0");
  document.querySelector(".map-filter-bar")?.classList.toggle("hidden",localStorage.getItem("aeroQuickFilters")==="0");
  document.body.classList.toggle("reduced-motion",localStorage.getItem("aeroReducedMotion")==="1");
  updateDayNight();
  qs("radioBtn").onclick=radioSearch;qs("radioSearch").oninput=radioSearch;
  setInterval(()=>{ if(localStorage.getItem("aeroAutoRefresh")!=="0" && Date.now()-lastFetch>25000) loadReal(); },30000);
}
const atcPages={
  SBSP:"https://aeroescuta.com.br/",
  SBGR:"https://aeroescuta.com.br/",
  SBKP:"https://aeroescuta.com.br/",
  SBMT:"https://aeroescuta.com.br/",
  SBGL:"https://aeroescuta.com.br/sample-page/escuta-aerea-rio-de-janeiro/",
  SBRJ:"https://aeroescuta.com.br/sample-page/escuta-aerea-rio-de-janeiro/",
  SBBE:"https://aeroescuta.com.br/",
  SBCT:"https://aeroescuta.com.br/",
  SBBR:"https://aeroescuta.com.br/",
  SBJH:"https://aeroescuta.com.br/sample-page/aeroporto-catarina-sbjh-aeroescuta-com-br/"
};
function atcSourceUrl(provider,icao){
  if(provider==='aeroescuta') return atcPages[icao]||'https://aeroescuta.com.br/';
  return `https://www.liveatc.net/search/?icao=${encodeURIComponent(icao)}`;
}
function startAtc(){
  const provider=qs('atcProvider')?.value||'aeroescuta';
  const icao=qs('atcStation')?.value||'SBGR';
  const frame=qs('atcFrame'), status=qs('atcStatus');
  if(!frame||!status)return;
  frame.src=atcSourceUrl(provider,icao);
  frame.classList.remove('hidden');
  status.innerHTML=`<span class="atc-loading-dot"></span> Carregando ${provider==='aeroescuta'?'Aeroescuta':'LiveATC'} para <b>${icao}</b> dentro do AERO RADAR...`;
  localStorage.setItem('aeroAtcProvider',provider); localStorage.setItem('aeroAtcStation',icao);
}
function radioSearch(){const q=(qs('radioSearch').value||'').toLowerCase();qs('radioResults').innerHTML=radios.filter(x=>x.join(' ').toLowerCase().includes(q)).map(x=>`<div class="item"><b>${x[0]}</b> — ${x[1]} <button type="button" class="atc-inline-btn" data-atc-station="${x[0]}">Ouvir aqui</button></div>`).join('')||'Nenhum resultado.'}
function initAtc(){
  const provider=localStorage.getItem('aeroAtcProvider'); const station=localStorage.getItem('aeroAtcStation');
  if(provider&&qs('atcProvider'))qs('atcProvider').value=provider;
  if(station&&qs('atcStation'))qs('atcStation').value=station;
  qs('atcPlay')?.addEventListener('click',startAtc);
  qs('atcProvider')?.addEventListener('change',()=>{qs('atcFrame')?.classList.add('hidden');qs('atcStatus').innerHTML='Clique em <b>Ouvir ATC</b> para carregar a fonte selecionada.';});
  qs('atcStation')?.addEventListener('change',()=>{qs('atcFrame')?.classList.add('hidden');qs('atcStatus').innerHTML='Clique em <b>Ouvir ATC</b> para carregar a estação selecionada.';});
  qs('radioResults')?.addEventListener('click',e=>{const b=e.target.closest('[data-atc-station]');if(!b)return;const st=b.dataset.atcStation;if(qs('atcStation'))qs('atcStation').value=st;document.querySelector('#fonia')?.scrollIntoView({behavior:'smooth',block:'center'});startAtc();});
}

function syncMapFilters(){
  const pairs=[["mapAircraft","aircraft"],["mapAirport","airport"],["mapRoute","routeFilter"],["mapCountry","country"]];
  pairs.forEach(([from,to])=>{const a=qs(from),b=qs(to);if(a&&b)b.value=a.value;});
  const show=qs("mapShowAirports"), side=qs("showAirports");
  if(show&&side){side.checked=show.checked;renderAirportsOnMap();}
  render();
}
function setCategoryFilter(cat){
  const all=qs("allAircraft");
  const ids=["commercial","executive","military"];
  if(cat==="all"){
    if(all) all.checked=true;
    ids.forEach(id=>{const el=qs(id);if(el)el.checked=false;});
  }else{
    if(all) all.checked=false;
    ids.forEach(id=>{const el=qs(id);if(el)el.checked=(id===cat);});
  }
  document.querySelectorAll(".map-filter[data-map-filter]").forEach(b=>b.classList.toggle("active",b.dataset.mapFilter===cat));
  render();
}

function openSettings(){
  const modal=qs("settingsModal"); if(!modal)return;
  modal.classList.remove("hidden");
  const savedStyle=localStorage.getItem("aeroMapStyle")||mapStyle;
  const savedBrightness=Number(localStorage.getItem("aeroMapBrightness")||mapBrightness);
  const dn=localStorage.getItem("aeroDayNight")==="1";
  qs("mapBrightness").value=savedBrightness; qs("dayNightLine").checked=dn;
  document.querySelectorAll(".map-style-card").forEach(b=>b.classList.toggle("active",b.dataset.mapStyle===savedStyle));
  qs("settingsAirports").checked=qs("showAirports").checked;
  qs("settingsCounter").checked=localStorage.getItem("aeroShowCounter")!=="0"; qs("settingsQuickFilters").checked=localStorage.getItem("aeroQuickFilters")!=="0"; qs("settingsLabels").checked=localStorage.getItem("aeroShowLabels")!=="0"; qs("settingsAutoRefresh").checked=localStorage.getItem("aeroAutoRefresh")!=="0"; qs("settingsReducedMotion").checked=localStorage.getItem("aeroReducedMotion")==="1";
  qs("settingsAirborne").checked=qs("airborne")?.checked!==false; qs("settingsGround").checked=qs("ground")?.checked!==false; qs("settingsRetired").checked=qs("retired")?.checked===true;
}
function closeSettings(){qs("settingsModal")?.classList.add("hidden");}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSettings();});
function initSettings(){
  qs("closeSettings")?.addEventListener("click",closeSettings);
  qs("settingsModal")?.addEventListener("click",e=>{if(e.target===qs("settingsModal"))closeSettings();});
  document.querySelectorAll("[data-settings-tab]").forEach(btn=>btn.addEventListener("click",()=>{
    const tab=btn.dataset.settingsTab;
    document.querySelectorAll("[data-settings-tab]").forEach(x=>x.classList.toggle("active",x===btn));
    document.querySelectorAll("[data-settings-pane]").forEach(x=>x.classList.toggle("active",x.dataset.settingsPane===tab));
  }));
  document.querySelectorAll(".map-style-card").forEach(btn=>btn.addEventListener("click",()=>applyMapStyle(btn.dataset.mapStyle)));
  qs("mapBrightness")?.addEventListener("input",e=>applyMapBrightness(e.target.value));
  qs("dayNightLine")?.addEventListener("change",updateDayNight);
  qs("settingsAirports")?.addEventListener("change",e=>{qs("showAirports").checked=e.target.checked;renderAirportsOnMap();});
  qs("settingsCounter")?.addEventListener("change",e=>{localStorage.setItem("aeroShowCounter",e.target.checked?"1":"0");qs("mapCounter")?.classList.toggle("hidden",!e.target.checked);});
  qs("settingsQuickFilters")?.addEventListener("change",e=>{localStorage.setItem("aeroQuickFilters",e.target.checked?"1":"0");document.querySelector(".map-filter-bar")?.classList.toggle("hidden",!e.target.checked);});
  qs("settingsAutoRefresh")?.addEventListener("change",e=>localStorage.setItem("aeroAutoRefresh",e.target.checked?"1":"0"));
  qs("settingsReducedMotion")?.addEventListener("change",e=>{localStorage.setItem("aeroReducedMotion",e.target.checked?"1":"0");document.body.classList.toggle("reduced-motion",e.target.checked);});
  qs("settingsLabels")?.addEventListener("change",e=>{localStorage.setItem("aeroShowLabels",e.target.checked?"1":"0"); updatePlaneLabelMode();});
  qs("settingsAirborne")?.addEventListener("change",e=>{const el=qs("airborne"); if(el) el.checked=e.target.checked; render();});
  qs("settingsGround")?.addEventListener("change",e=>{const el=qs("ground"); if(el) el.checked=e.target.checked; render();});
  qs("settingsRetired")?.addEventListener("change",e=>{const el=qs("retired"); if(el) el.checked=e.target.checked; toggleRetiredPanel(); render();});
}

document.addEventListener("DOMContentLoaded",()=>{
  qs("topLoginBtn")?.addEventListener("click",()=>{mode="login";authUI();});
  qs("gateLoginBtn")?.addEventListener("click",()=>{mode="login";authUI();});
  qs("loginBtn")?.addEventListener("click",()=>{mode="login";authUI();});
  qs("closeAuth")?.addEventListener("click",()=>{if(authenticatedUser)qs("auth").classList.add("hidden");});
  qs("tabLogin")?.addEventListener("click",()=>{mode="login";authUI();});
  qs("tabRegister")?.addEventListener("click",()=>{mode="register";authUI();});
  qs("authForm")?.addEventListener("submit",authSubmit);
  checkMe();
});

/* AERO_RADAR_ZOOM_ICON_REFRESH */
if (typeof map !== "undefined" && map && map.on) {
  map.on("zoomend", () => {
    try {
      const z = map.getZoom();
      if (typeof markers !== "undefined" && Array.isArray(markers)) {
        markers.forEach(m => {
          const f = m && m._aeroFlight;
          if (f && m.setIcon) m.setIcon(planeIcon(f.heading, z));
        });
      }
    } catch (_) {}
  });
}

