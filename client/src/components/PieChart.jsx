import { useState, useMemo, useEffect } from 'react';

// ── Paleta y orden de partidos ─────────────────────────────────────────────

const PARTY_COLORS = {
    MORENA: '#9D2C20',
    PAN:    '#0D47A1',
    PVEM:   '#4CAF50',
    PRI:    '#00924f',
    PT:     '#cc0000',
    MC:     '#ff8d00',
    SP:     '#9E9E9E',
};

const PARTY_ORDER = ['MORENA', 'PAN', 'PVEM', 'PRI', 'PT', 'MC', 'SP'];

const getTotal = (arr) => arr.reduce((s, { count }) => s + count, 0);

// ── Helpers SVG ────────────────────────────────────────────────────────────

function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeDonutArc(cx, cy, outerR, innerR, startAngle, endAngle) {
    const s  = startAngle - 90;
    const e  = endAngle   - 90;
    const os = polarToCartesian(cx, cy, outerR, e);
    const oe = polarToCartesian(cx, cy, outerR, s);
    const is = polarToCartesian(cx, cy, innerR, e);
    const ie = polarToCartesian(cx, cy, innerR, s);
    const large = e - s <= 180 ? '0' : '1';
    return [
        'M', os.x, os.y,
        'A', outerR, outerR, 0, large, 0, oe.x, oe.y,
        'L', ie.x,  ie.y,
        'A', innerR, innerR, 0, large, 1, is.x,  is.y,
        'Z',
    ].join(' ');
}

// ── Donut Chart ────────────────────────────────────────────────────────────

function DonutChart({ data, total, label, hoveredParty, onHover }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    const segments = useMemo(() => {
        if (total === 0) return [];
        let cum = 0;
        return data.map((item) => {
            const angle = (item.count / total) * 360;
            const start = cum;
            cum += angle;
            return {
                ...item,
                path: describeDonutArc(100, 100, 88, 56, start, start + angle),
                pct:  ((item.count / total) * 100).toFixed(1),
            };
        });
    }, [data, total]);

    const hov = segments.find((s) => s.party === hoveredParty) || null;

    return (
        <div className="flex flex-col items-center">
            {/* Label superior */}
            <div className="mb-5 text-center">
                <p className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em] mb-1">
                    {label}
                </p>
                <p className="text-4xl font-black text-gray-900 leading-none">{total}</p>
                <p className="text-[11px] text-gray-400 font-light mt-0.5">legisladores</p>
            </div>

            {/* SVG Donut */}
            <div className="w-44 h-44 sm:w-48 sm:h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    {/* Track ring */}
                    <circle
                        cx="100" cy="100" r="72"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="32"
                    />

                    {/* Segmentos */}
                    {segments.map((seg) => {
                        const isHov = hoveredParty === seg.party;
                        const isDim = hoveredParty && !isHov;
                        return (
                            <path
                                key={seg.party}
                                d={seg.path}
                                fill={PARTY_COLORS[seg.party] || PARTY_COLORS.SP}
                                style={{
                                    opacity: mounted ? (isDim ? 0.12 : 1) : 0,
                                    transform: isHov ? 'scale(1.05)' : 'scale(1)',
                                    transformOrigin: '100px 100px',
                                    transition: 'opacity 0.2s ease, transform 0.25s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={() => onHover(seg.party)}
                                onMouseLeave={() => onHover(null)}
                            />
                        );
                    })}

                    {/* Centro dinámico */}
                    {hov ? (
                        <>
                            <text
                                x="100" y="86"
                                textAnchor="middle"
                                fill={PARTY_COLORS[hov.party]}
                                fontSize="9"
                                fontWeight="900"
                                letterSpacing="2"
                                fontFamily="Montserrat, sans-serif"
                            >
                                {hov.party}
                            </text>
                            <text
                                x="100" y="105"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#111827"
                                fontSize="28"
                                fontWeight="900"
                                fontFamily="Montserrat, sans-serif"
                            >
                                {hov.count}
                            </text>
                            <text
                                x="100" y="120"
                                textAnchor="middle"
                                fill="#9ca3af"
                                fontSize="9"
                                fontFamily="Montserrat, sans-serif"
                            >
                                {hov.pct}%
                            </text>
                        </>
                    ) : (
                        <>
                            <text
                                x="100" y="99"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#111827"
                                fontSize="34"
                                fontWeight="900"
                                fontFamily="Montserrat, sans-serif"
                            >
                                {total}
                            </text>
                            <text
                                x="100" y="116"
                                textAnchor="middle"
                                fill="#9ca3af"
                                fontSize="9"
                                fontFamily="Montserrat, sans-serif"
                            >
                                total
                            </text>
                        </>
                    )}
                </svg>
            </div>
        </div>
    );
}

// ── Fila comparativa ───────────────────────────────────────────────────────

function PartyRow({ party, sen, dep, totalSen, totalDep, isHovered, onHover }) {
    const color  = PARTY_COLORS[party] || PARTY_COLORS.SP;
    const senPct = totalSen > 0 ? (sen / totalSen) * 100 : 0;
    const depPct = totalDep > 0 ? (dep / totalDep) * 100 : 0;

    return (
        <div
            className={`grid gap-3 sm:gap-4 items-center px-4 py-3 border-b border-gray-50 last:border-0 transition-colors duration-150 cursor-default ${
                isHovered ? 'bg-gray-50' : 'hover:bg-gray-50/70'
            }`}
            style={{ gridTemplateColumns: '5.5rem 1fr 1fr' }}
            onMouseEnter={() => onHover(party)}
            onMouseLeave={() => onHover(null)}
        >
            {/* Nombre del partido */}
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200"
                    style={{
                        backgroundColor: color,
                        transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                    }}
                />
                <span
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-150 truncate ${
                        isHovered ? 'text-gray-900' : 'text-gray-400'
                    }`}
                >
                    {party}
                </span>
            </div>

            {/* Senado */}
            <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-700 w-5 text-right tabular-nums flex-shrink-0">
                    {sen}
                </span>
                <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${senPct}%`,
                            backgroundColor: color,
                            opacity: isHovered ? 1 : 0.55,
                        }}
                    />
                </div>
                <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums flex-shrink-0">
                    {Math.round(senPct)}%
                </span>
            </div>

            {/* Diputados */}
            <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-700 w-6 text-right tabular-nums flex-shrink-0">
                    {dep}
                </span>
                <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${depPct}%`,
                            backgroundColor: color,
                            opacity: isHovered ? 1 : 0.55,
                        }}
                    />
                </div>
                <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums flex-shrink-0">
                    {Math.round(depPct)}%
                </span>
            </div>
        </div>
    );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function CongressCompositionChart({ senators = [], deputies = [] }) {
    const [hoveredParty, setHoveredParty] = useState(null);

    const totalSen = getTotal(senators);
    const totalDep = getTotal(deputies);

    const sortedSen = PARTY_ORDER
        .map((p) => senators.find((s) => s.party === p))
        .filter((s) => s && s.count > 0);

    const sortedDep = PARTY_ORDER
        .map((p) => deputies.find((d) => d.party === p))
        .filter((d) => d && d.count > 0);

    const allParties = PARTY_ORDER.filter((p) =>
        senators.some((s) => s.party === p && s.count > 0) ||
        deputies.some((d) => d.party === p && d.count > 0)
    );

    return (
        <div>
            {/* ── Donuts ── */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 md:gap-20 mb-10">
                <DonutChart
                    data={sortedSen}
                    total={totalSen}
                    label="Senado"
                    hoveredParty={hoveredParty}
                    onHover={setHoveredParty}
                />
                <DonutChart
                    data={sortedDep}
                    total={totalDep}
                    label="Cámara de Diputados"
                    hoveredParty={hoveredParty}
                    onHover={setHoveredParty}
                />
            </div>

            {/* ── Tabla comparativa ── */}
            <div className="border border-gray-100">
                {/* Header */}
                <div
                    className="grid gap-3 sm:gap-4 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100"
                    style={{ gridTemplateColumns: '5.5rem 1fr 1fr' }}
                >
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                        Partido
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                        Senado
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                        Diputados
                    </span>
                </div>

                {/* Filas */}
                {allParties.map((p) => {
                    const s = senators.find((x) => x.party === p)?.count || 0;
                    const d = deputies.find((x) => x.party === p)?.count || 0;
                    return (
                        <PartyRow
                            key={p}
                            party={p}
                            sen={s}
                            dep={d}
                            totalSen={totalSen}
                            totalDep={totalDep}
                            isHovered={hoveredParty === p}
                            onHover={setHoveredParty}
                        />
                    );
                })}
            </div>

            {/* Caption */}
            <p className="text-[10px] text-gray-400 font-light mt-3 text-right">
                Periodo legislativo actual · Pasa el cursor sobre el gráfico o la tabla para comparar
            </p>
        </div>
    );
}
