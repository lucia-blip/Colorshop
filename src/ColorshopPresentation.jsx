import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion';

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND = {
  red: '#E4002B',
  redDark: '#B5001F',
  redLight: '#FF3355',
  white: '#FFFFFF',
  offWhite: '#F8F8F8',
  darkGray: '#1A1A1A',
  midGray: '#4A4A4A',
  swatchBlue: '#3B82C4',
  swatchGreen: '#4CAF50',
  swatchYellow: '#F5C518',
  swatchOrange: '#F97316',
  swatchPurple: '#9333EA',
  swatchPink: '#EC4899',
  swatchTeal: '#14B8A6',
};

// ─── Animation helpers ────────────────────────────────────────────────────────
const fade = (f, s, e) =>
  interpolate(f, [s, e], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const fadeOut = (f, s, e) =>
  interpolate(f, [s, e], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const springIn = (f, delay = 0) =>
  spring({ frame: f - delay, fps: 30, config: { damping: 14, stiffness: 120, mass: 1 } });

// ─── Shared: Logo SVG ─────────────────────────────────────────────────────────
const Logo = ({ scale = 1, color = BRAND.white }) => (
  <svg width={200 * scale} height={60 * scale} viewBox="0 0 200 60">
    <circle cx={20} cy={30} r={14} fill={color} opacity={0.9} />
    <circle cx={38} cy={20} r={10} fill={color} opacity={0.7} />
    <circle cx={32} cy={42} r={8} fill={color} opacity={0.5} />
    <text
      x={58} y={38}
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize={28 * scale}
      fill={color}
      letterSpacing={-0.5}
    >
      COLORSHOP
    </text>
  </svg>
);

// ─── Scene 1 · Intro  (frames 0–179 inside the sequence) ─────────────────────
const IntroScene = () => {
  const f = useCurrentFrame();
  const opacity = fade(f, 0, 20) * fadeOut(f, 160, 179);
  const logoScale = springIn(f, 10);
  const subFade = fade(f, 30, 55);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${BRAND.red} 0%, ${BRAND.redDark} 100%)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      {/* decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 400, height: 400, borderRadius: '50%', background: BRAND.redLight, opacity: 0.2 }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 500, height: 500, borderRadius: '50%', background: BRAND.redDark, opacity: 0.3 }} />

      <div style={{ transform: `scale(${logoScale})` }}>
        <Logo scale={1.8} color={BRAND.white} />
      </div>

      <div style={{ opacity: subFade, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 36, color: BRAND.white, margin: 0, fontWeight: 300, letterSpacing: 4, textTransform: 'uppercase' }}>
          Tu mundo en color
        </p>
      </div>

      <div style={{ opacity: subFade, background: 'rgba(255,255,255,0.15)', borderRadius: 50, padding: '12px 36px', border: `2px solid rgba(255,255,255,0.35)` }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 26, color: BRAND.white, margin: 0, fontWeight: 600 }}>
          Concordia · Colón · Gualeguaychú
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2 · ¿Qué hacemos? ─────────────────────────────────────────────────
const WhatWeDoScene = () => {
  const f = useCurrentFrame();
  const opacity = fade(f, 0, 20) * fadeOut(f, 160, 179);
  const titleS = springIn(f, 8);
  const card1S = springIn(f, 20);
  const card2S = springIn(f, 30);
  const card3S = springIn(f, 40);
  const cardSprings = [card1S, card2S, card3S];

  const cards = [
    { icon: '🎨', title: 'Pinturas', desc: 'Las mejores marcas con respaldo Sinteplast', color: BRAND.red },
    { icon: '🏠', title: 'Decoración', desc: 'Accesorios y terminaciones para cada espacio', color: BRAND.swatchBlue },
    { icon: '🛡️', title: 'Protección', desc: 'Productos para reparar y proteger superficies', color: BRAND.swatchGreen },
  ];

  return (
    <AbsoluteFill
      style={{
        background: BRAND.offWhite,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 50px',
        gap: 44,
      }}
    >
      <div style={{ transform: `scale(${titleS})`, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, color: BRAND.red, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', margin: 0 }}>
          ¿QUÉ HACEMOS?
        </p>
        <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 60, color: BRAND.darkGray, fontWeight: 900, margin: '8px 0 0 0', lineHeight: 1.1 }}>
          Tu pinturería<br /><span style={{ color: BRAND.red }}>todo en uno</span>
        </h2>
      </div>

      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            transform: `translateY(${(1 - cardSprings[i]) * 60}px)`,
            opacity: cardSprings[i],
            width: '100%',
            background: BRAND.white,
            borderRadius: 24,
            padding: '30px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
            borderLeft: `8px solid ${card.color}`,
          }}
        >
          <span style={{ fontSize: 60 }}>{card.icon}</span>
          <div>
            <h3 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 38, fontWeight: 900, color: BRAND.darkGray, margin: 0 }}>{card.title}</h3>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 26, color: BRAND.midGray, margin: '6px 0 0 0', lineHeight: 1.4 }}>{card.desc}</p>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ─── Scene 3 · Paleta de 1.600 colores ───────────────────────────────────────
const PaletteScene = () => {
  const f = useCurrentFrame();
  const opacity = fade(f, 0, 20) * fadeOut(f, 160, 179);

  // All spring hooks at component top-level (no loops)
  const s0  = springIn(f, 15);
  const s1  = springIn(f, 19);
  const s2  = springIn(f, 23);
  const s3  = springIn(f, 27);
  const s4  = springIn(f, 31);
  const s5  = springIn(f, 35);
  const s6  = springIn(f, 39);
  const s7  = springIn(f, 43);
  const s8  = springIn(f, 47);
  const s9  = springIn(f, 51);
  const s10 = springIn(f, 55);
  const s11 = springIn(f, 59);
  const springs = [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11];

  const swatches = [
    BRAND.red,          BRAND.swatchBlue,   BRAND.swatchGreen,  BRAND.swatchYellow,
    BRAND.swatchOrange, BRAND.swatchPurple,  BRAND.swatchPink,   BRAND.swatchTeal,
    '#8B4513',          '#2C3E50',           '#F0E68C',          '#708090',
  ];

  return (
    <AbsoluteFill
      style={{
        background: BRAND.darkGray,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 50px',
        gap: 50,
      }}
    >
      {/* rainbow bar at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.swatchBlue}, ${BRAND.swatchGreen}, ${BRAND.swatchYellow}, ${BRAND.swatchPurple})` }} />

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, color: BRAND.red, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', margin: 0 }}>
          NUESTRA PALETA
        </p>
        <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 58, color: BRAND.white, fontWeight: 900, margin: '8px 0 0 0', lineHeight: 1.1 }}>
          +1.600 colores<br /><span style={{ color: BRAND.red }}>para elegir</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center', width: '100%' }}>
        {swatches.map((color, i) => (
          <div
            key={i}
            style={{
              width: 118,
              height: 118,
              borderRadius: 20,
              background: color,
              transform: `scale(${springs[i]})`,
              boxShadow: `0 8px 24px ${color}66`,
            }}
          />
        ))}
      </div>

      <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 28, color: 'rgba(255,255,255,0.75)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        Colección <strong style={{ color: BRAND.white }}>Selección & Combinaciones</strong> de Sinteplast.<br />
        Las últimas tendencias en tu hogar.
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 4 · Servicios ──────────────────────────────────────────────────────
const ServicesScene = () => {
  const f = useCurrentFrame();
  const opacity = fade(f, 0, 20) * fadeOut(f, 160, 179);

  const s0 = springIn(f, 15);
  const s1 = springIn(f, 25);
  const s2 = springIn(f, 35);
  const s3 = springIn(f, 45);
  const s4 = springIn(f, 55);
  const s5 = springIn(f, 65);

  const services = [
    { icon: '📐', label: 'Asesoramiento\npersonalizado', s: s0 },
    { icon: '🏡', label: 'Visita a\ndomicilio gratis', s: s1 },
    { icon: '🚚', label: 'Entrega a\ndomicilio', s: s2 },
    { icon: '🎓', label: 'Cursos y\nworkshops', s: s3 },
    { icon: '🧰', label: 'Accesorios y\nherramientas', s: s4 },
    { icon: '🌈', label: 'Espacio de\nprueba de colores', s: s5 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${BRAND.red} 0%, ${BRAND.redDark} 100%)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 50px',
        gap: 44,
      }}
    >
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', margin: 0 }}>
          NUESTROS SERVICIOS
        </p>
        <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 62, color: BRAND.white, fontWeight: 900, margin: '8px 0 0 0', lineHeight: 1.1 }}>
          Todo lo que<br />necesitás
        </h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', width: '100%' }}>
        {services.map((svc, i) => (
          <div
            key={i}
            style={{
              width: 268,
              padding: '26px 18px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              transform: `scale(${svc.s})`,
            }}
          >
            <span style={{ fontSize: 50 }}>{svc.icon}</span>
            <p style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 25, fontWeight: 800, color: BRAND.white, margin: 0, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {svc.label}
            </p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5 · CTA Final ──────────────────────────────────────────────────────
const CTAScene = () => {
  const f = useCurrentFrame();
  const opacity = fade(f, 0, 20);
  const logoS = springIn(f, 10);
  const textFade = fade(f, 25, 50);
  const ctaFade = fade(f, 55, 80);
  const pulse = interpolate(Math.sin((f / 30) * Math.PI * 2), [-1, 1], [0.97, 1.03]);

  return (
    <AbsoluteFill
      style={{
        background: BRAND.darkGray,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 50px',
        gap: 44,
      }}
    >
      {/* rainbow stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.swatchOrange}, ${BRAND.swatchYellow}, ${BRAND.swatchGreen}, ${BRAND.swatchBlue}, ${BRAND.swatchPurple})` }} />

      <div style={{ transform: `scale(${logoS})` }}>
        <Logo scale={1.6} color={BRAND.white} />
      </div>

      <div style={{ opacity: textFade, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 56, color: BRAND.white, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
          Dale color a tu<br /><span style={{ color: BRAND.red }}>hogar o negocio</span>
        </h2>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 28, color: 'rgba(255,255,255,0.7)', margin: '22px 0 0 0', lineHeight: 1.5 }}>
          Personal capacitado listo para ayudarte.<br />
          Visitá tu Colorshop más cercano.
        </p>
      </div>

      {/* Location list */}
      <div style={{ opacity: ctaFade, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { city: 'Concordia', address: 'Urquiza 839 · San Lorenzo E.21' },
          { city: 'Gualeguaychú', address: 'San Martín 1181' },
          { city: 'Colón', address: 'Av. Perón 345' },
        ].map((loc, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 30, color: BRAND.red, fontWeight: 900 }}>{loc.city}</span>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>{loc.address}</span>
          </div>
        ))}
      </div>

      {/* Instagram handle */}
      <div style={{ opacity: ctaFade, transform: `scale(${pulse})`, background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.redDark})`, borderRadius: 60, padding: '22px 60px', boxShadow: `0 12px 40px ${BRAND.red}55` }}>
        <p style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 32, color: BRAND.white, margin: 0, fontWeight: 900, letterSpacing: 1 }}>
          @colorshop.entrerios
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const ColorshopPresentation = () => {
  return (
    <AbsoluteFill style={{ background: BRAND.offWhite }}>
      <Sequence from={0}   durationInFrames={180}><IntroScene /></Sequence>
      <Sequence from={180} durationInFrames={180}><WhatWeDoScene /></Sequence>
      <Sequence from={360} durationInFrames={180}><PaletteScene /></Sequence>
      <Sequence from={540} durationInFrames={180}><ServicesScene /></Sequence>
      <Sequence from={720} durationInFrames={180}><CTAScene /></Sequence>
    </AbsoluteFill>
  );
};
