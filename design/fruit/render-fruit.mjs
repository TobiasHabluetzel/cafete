// Draws the fruit for the Fruity scene as painted illustrations with real volume, then renders
// them to transparent WebP. Light comes from the top left in every piece, as on the bottle.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT=path.join(here,"../../public/fruit");fs.mkdirSync(OUT,{recursive:true});
const INK="#2a0907";

const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const blur=(id,sd)=>`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
// Fine skin texture: tiny dark and light flecks, kept faint.
const grain=(id,freq,seed,alpha)=>`<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${alpha*-3} ${alpha*1.6}"/></filter>`;
// Large soft blotches, for the mottled colour of cranberries.
const mottle=(id,seed,color,alpha)=>`<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${color[0]/255}  0 0 0 0 ${color[1]/255}  0 0 0 0 ${color[2]/255}  ${alpha*4} 0 0 0 ${-alpha*1.7}"/><feGaussianBlur stdDeviation="3"/></filter>`;

function coffeeCherry(v){
  const body="M52 168 C50 94 116 44 202 44 C292 44 352 98 352 166 C352 238 290 288 200 288 C110 288 54 242 52 168 Z";
  return svg(420,330,`<defs>
    <radialGradient id="cb" cx="0.36" cy="0.3" r="0.82"><stop offset="0" stop-color="${v.hi}"/><stop offset="0.28" stop-color="${v.mid}"/><stop offset="0.66" stop-color="${v.deep}"/><stop offset="0.92" stop-color="#4a0408"/><stop offset="1" stop-color="#2e0205"/></radialGradient>
    <radialGradient id="glow" cx="0.66" cy="0.7" r="0.42"><stop offset="0" stop-color="#ff3b26" stop-opacity="0.55"/><stop offset="1" stop-color="#ff3b26" stop-opacity="0"/></radialGradient>
    <linearGradient id="stem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a8a3a"/><stop offset="0.5" stop-color="#5b5a22"/><stop offset="1" stop-color="#2f2a10"/></linearGradient>
    <radialGradient id="core" cx="0.34" cy="0.28" r="0.92"><stop offset="0" stop-color="#220003" stop-opacity="0"/><stop offset="0.5" stop-color="#220003" stop-opacity="0"/><stop offset="0.72" stop-color="#220003" stop-opacity="0.55"/><stop offset="0.86" stop-color="#220003" stop-opacity="0.3"/><stop offset="1" stop-color="#220003" stop-opacity="0"/></radialGradient>
    <clipPath id="clip"><path d="${body}"/></clipPath>
    <mask id="rim"><path d="${body}" fill="#fff"/><path d="${body}" transform="translate(-13 -11)" fill="#000"/></mask>
    ${blur("b2",2)}${blur("b6",6)}${blur("b10",10)}${blur("b1",1)}${grain("gr",0.85,v.seed,0.16)}
  </defs>
  <path d="M30 156 C38 152 50 154 58 160 L58 178 C50 182 38 182 30 178 Z" fill="url(#stem)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="31" cy="167" rx="5" ry="11" fill="#3b3412" stroke="${INK}" stroke-width="2"/>
  <path d="${body}" fill="url(#cb)"/>
  <g clip-path="url(#clip)">
    <path d="${body}" fill="url(#glow)"/>
    <path d="${body}" fill="url(#core)"/>
    <rect width="420" height="330" filter="url(#gr)"/>
    <path d="${body}" fill="#ff7a5c" opacity="0.6" mask="url(#rim)" filter="url(#b6)"/>
    <path d="M70 120 C110 70 170 54 230 58" stroke="#ffd2c4" stroke-width="10" fill="none" opacity="0.18" filter="url(#b6)"/>
  </g>
  <ellipse cx="132" cy="98" rx="62" ry="28" transform="rotate(-27 132 98)" fill="#fff" opacity="0.42" filter="url(#b10)"/>
  <path d="M96 118 C108 92 132 76 160 70" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.92" filter="url(#b2)"/>
  <circle cx="176" cy="66" r="4.5" fill="#fff" opacity="0.9" filter="url(#b1)"/>
  <rect x="112" y="80" width="30" height="18" rx="6" transform="rotate(-30 127 89)" fill="#fff" opacity="0.75" filter="url(#b1)"/>
  <ellipse cx="282" cy="242" rx="34" ry="9" transform="rotate(-38 282 242)" fill="#fff" opacity="0.2" filter="url(#b2)"/>
  <g transform="translate(350 166)">
    <ellipse rx="15" ry="19" fill="#5a1a10" stroke="${INK}" stroke-width="2.5"/>
    <ellipse rx="9" ry="12" fill="#2a0a06"/>
    <path d="M-6 -7 L0 0 L6 -7 M-7 6 L0 0 L7 6" stroke="#7a3a22" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="-5" cy="-9" rx="4" ry="2.5" fill="#c06a48" opacity="0.7"/>
  </g>
  <path d="${body}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`);
}

function cranberry(v){
  const body=v.body;
  return svg(300,300,`<defs>
    <radialGradient id="cb" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="${v.hi}"/><stop offset="0.34" stop-color="${v.mid}"/><stop offset="0.74" stop-color="${v.deep}"/><stop offset="1" stop-color="#3e0413"/></radialGradient>
    <radialGradient id="core" cx="0.34" cy="0.28" r="0.92"><stop offset="0" stop-color="#2a0010" stop-opacity="0"/><stop offset="0.5" stop-color="#2a0010" stop-opacity="0"/><stop offset="0.72" stop-color="#2a0010" stop-opacity="0.55"/><stop offset="0.86" stop-color="#2a0010" stop-opacity="0.3"/><stop offset="1" stop-color="#2a0010" stop-opacity="0"/></radialGradient>
    <clipPath id="clip"><path d="${body}"/></clipPath>
    <mask id="rim"><path d="${body}" fill="#fff"/><path d="${body}" transform="translate(-10 -9)" fill="#000"/></mask>
    ${blur("b2",1.6)}${blur("b5",5)}${blur("b8",8)}${mottle("mo",v.seed,[255,120,128],0.5)}${grain("gr",1.1,v.seed+3,0.12)}
  </defs>
  <path d="${body}" fill="url(#cb)"/>
  <g clip-path="url(#clip)">
    <rect width="300" height="300" filter="url(#mo)" opacity="0.32"/>
    <rect width="300" height="300" filter="url(#gr)"/>
    <path d="${body}" fill="url(#core)"/>
    <path d="${body}" fill="#ff5a70" opacity="0.55" mask="url(#rim)" filter="url(#b5)"/>
    <g fill="#ffd6dc" opacity="0.5">${v.dots.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4"/>`).join("")}</g>
  </g>
  <ellipse cx="108" cy="92" rx="44" ry="22" transform="rotate(-32 108 92)" fill="#fff" opacity="0.4" filter="url(#b8)"/>
  <path d="M84 112 C92 92 108 78 128 72" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.9" filter="url(#b2)"/>
  <circle cx="142" cy="70" r="3.2" fill="#fff" opacity="0.85"/>
  <rect x="96" y="96" width="20" height="13" rx="4" transform="rotate(-32 106 102)" fill="#fff" opacity="0.7"/>
  <g transform="translate(${v.navel[0]} ${v.navel[1]})">
    <ellipse rx="13" ry="6" fill="#4a0a16" stroke="${INK}" stroke-width="2"/>
    <path d="M-7 0 L7 0 M0 -3 L0 3 M-5 -2 L5 2" stroke="#9a4a3a" stroke-width="1.4" stroke-linecap="round"/>
  </g>
  <path d="${body}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`);
}

function elderberry(v){
  return svg(120,120,`<defs>
    <radialGradient id="eb" cx="0.36" cy="0.32" r="0.78"><stop offset="0" stop-color="${v.hi}"/><stop offset="0.3" stop-color="${v.mid}"/><stop offset="0.75" stop-color="#14061c"/><stop offset="1" stop-color="#07020b"/></radialGradient>
    <radialGradient id="core" cx="0.34" cy="0.28" r="0.92"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="0.72" stop-color="#000" stop-opacity="0.55"/><stop offset="0.86" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <clipPath id="clip"><circle cx="60" cy="62" r="44"/></clipPath>
    <mask id="rim"><circle cx="60" cy="62" r="44" fill="#fff"/><circle cx="55" cy="57" r="44" fill="#000"/></mask>
    ${blur("b1",1)}${blur("b3",3)}
  </defs>
  <circle cx="60" cy="62" r="44" fill="url(#eb)"/>
  <circle cx="60" cy="62" r="44" fill="url(#core)"/>
  <circle cx="60" cy="62" r="44" fill="#b07ad0" opacity="0.28" mask="url(#rim)" filter="url(#b3)" clip-path="url(#clip)"/>
  <ellipse cx="44" cy="44" rx="13" ry="8" transform="rotate(-35 44 44)" fill="#fff" opacity="0.35" filter="url(#b3)"/>
  <ellipse cx="42" cy="42" rx="6" ry="3.6" transform="rotate(-35 42 42)" fill="#fff" opacity="0.95" filter="url(#b1)"/>
  <g transform="translate(${v.crown[0]} ${v.crown[1]}) rotate(${v.rot})">
    <path d="M0 -7 L2 -2 L7 -2 L3 1.5 L4.5 7 L0 3.8 L-4.5 7 L-3 1.5 L-7 -2 L-2 -2 Z" fill="#1a0a12" stroke="#5a3a4a" stroke-width="1"/>
  </g>
  <circle cx="60" cy="62" r="44" fill="none" stroke="${INK}" stroke-width="2.5"/>`);
}

function lemonSlice(){
  const R=170,K=0.64,cx=210,cy=146,T=32;
  const P=(r,a)=>[(r*Math.cos(a*Math.PI/180)).toFixed(1),(r*Math.sin(a*Math.PI/180)).toFixed(1)];
  let wedges="";
  for(let i=0;i<10;i++){const a0=i*36+4.5,a1=(i+1)*36-4.5,m=(a0+a1)/2;const t=P(20,m),o0=P(136,a0),o1=P(136,a1);
    wedges+=`<path d="M${t[0]} ${t[1]} L${o0[0]} ${o0[1]} A136 136 0 0 1 ${o1[0]} ${o1[1]} Z" fill="url(#flesh)" stroke="url(#flesh)" stroke-width="4" stroke-linejoin="round"/><path d="M${t[0]} ${t[1]} L${o0[0]} ${o0[1]} A136 136 0 0 1 ${o1[0]} ${o1[1]} Z" fill="url(#dome)"/>`;
    const l0=P(40,m),l1=P(120,m);wedges+=`<path d="M${l0[0]} ${l0[1]} L${l1[0]} ${l1[1]}" stroke="#fff" stroke-width="3" opacity="0.35" stroke-linecap="round"/>`;}
  return svg(420,330,`<defs>
    <linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8c21a"/><stop offset="1" stop-color="#c88406"/></linearGradient>
    <radialGradient id="rind" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#ffe23a"/><stop offset="1" stop-color="#f5a800"/></radialGradient>
    <radialGradient id="dome" cx="0.38" cy="0.3" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.5"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#b87a00" stop-opacity="0.22"/></radialGradient>
    <radialGradient id="flesh" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="140"><stop offset="0" stop-color="#fff6b0"/><stop offset="0.5" stop-color="#ffe02e"/><stop offset="1" stop-color="#ffc300"/></radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="face"><circle r="134"/></clipPath>
    ${blur("b2",2)}${blur("b8",8)}${grain("juice",1.3,7,0.14)}
  </defs>
  <ellipse cx="${cx}" cy="${cy+T}" rx="${R}" ry="${R*K}" fill="url(#side)" stroke="${INK}" stroke-width="3.5"/>
  <path d="M${cx-R} ${cy} L${cx-R} ${cy+T} M${cx+R} ${cy} L${cx+R} ${cy+T}" stroke="${INK}" stroke-width="3.5"/>
  <rect x="${cx-R}" y="${cy}" width="${R*2}" height="${T}" fill="url(#side)"/>
  <ellipse cx="${cx}" cy="${cy+T}" rx="${R-1.5}" ry="${R*K-1.5}" fill="none" stroke="#e8a20a" stroke-width="2" opacity="0.6" clip-path="none"/>
  <g transform="translate(${cx} ${cy}) scale(1 ${K})">
    <circle r="${R}" fill="url(#rind)"/>
    <circle r="152" fill="#fff6d8"/>
    <circle r="151" fill="none" stroke="#a86e00" stroke-width="4" opacity="0.35"/>
    <circle r="141" fill="#fbeec0"/>
    ${wedges}
    <g clip-path="url(#face)"><rect x="-140" y="-140" width="280" height="280" filter="url(#juice)"/></g>
    <circle r="15" fill="#fff8e2"/>
    <circle r="${R}" fill="url(#sheen)"/>
  </g>
  <ellipse cx="${cx-70}" cy="${cy-50}" rx="60" ry="18" transform="rotate(-18 ${cx-70} ${cy-50})" fill="#fff" opacity="0.32" filter="url(#b8)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R*K}" fill="none" stroke="${INK}" stroke-width="3.5"/>`);
}

const dots=(seed)=>{const r=[];let s=seed;for(let i=0;i<14;i++){s=(s*9301+49297)%233280;const a=s/233280*6.28;s=(s*9301+49297)%233280;const d=40+s/233280*80;r.push([150+Math.cos(a)*d,155+Math.sin(a)*d])}return r};
const pieces={
  "coffee-cherry":coffeeCherry({hi:"#ff6b55",mid:"#e3261f",deep:"#a50e15",seed:3}),
  "coffee-cherry-2":coffeeCherry({hi:"#ff7a50",mid:"#dc2a1a",deep:"#9a1012",seed:8}),
  "cranberry-1":cranberry({hi:"#ff4058",mid:"#e20f30",deep:"#930421",seed:2,navel:[150,46],dots:dots(5),body:"M150 32 C222 30 270 82 270 152 C270 222 220 270 150 270 C80 270 30 222 30 150 C30 84 82 34 150 32 Z"}),
  "cranberry-2":cranberry({hi:"#ff4a50",mid:"#ea1428",deep:"#9c061c",seed:11,navel:[156,52],dots:dots(9),body:"M150 40 C214 36 262 86 262 152 C262 220 214 266 148 266 C84 266 38 220 38 154 C38 92 86 44 150 40 Z"}),
  "cranberry-3":cranberry({hi:"#f43050",mid:"#c80a2a",deep:"#7a031a",seed:17,navel:[146,42],dots:dots(13),body:"M146 30 C214 28 266 76 268 146 C270 222 222 272 152 272 C82 272 32 226 32 152 C32 80 80 32 146 30 Z"}),
  "elderberry-1":elderberry({hi:"#9a5ab8",mid:"#3a0f4e",crown:[60,22],rot:0}),
  "elderberry-2":elderberry({hi:"#8a4aa8",mid:"#320a46",crown:[66,24],rot:20}),
  "elderberry-3":elderberry({hi:"#a466c0",mid:"#40125a",crown:[56,21],rot:-15}),
  "lemon-slice":lemonSlice(),
};
(async()=>{
  for(const [name,code] of Object.entries(pieces)){
    fs.writeFileSync(path.join(here,name+".svg"),code);
    const w=name.startsWith("elder")?120:name.startsWith("cran")?300:420;
    await sharp(Buffer.from(code),{density:72*3}).resize({width:w*1.5}).trim({threshold:1}).webp({quality:90,alphaQuality:95}).toFile(path.join(OUT,name+".webp"));
    const m=await sharp(path.join(OUT,name+".webp")).metadata();console.log(name,m.width+"x"+m.height,Math.round(fs.statSync(path.join(OUT,name+".webp")).size/1024)+" KB");
  }
})().catch(e=>{console.error(e);process.exit(1)});
