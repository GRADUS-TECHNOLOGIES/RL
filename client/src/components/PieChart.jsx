import { useState, useMemo, useEffect } from 'react';

// 🎨 Colores por partido
const PARTY_COLORS = {
    MORENA: '#9D2C20',
    PAN: '#0D47A1',
    PRI: '#00924f',
    MC: '#ff8d00',
    PT: '#ff0000',
    PVEM: '#4CAF50',
    SP: '#9E9E9E',
};

const getTotal = (arr) => arr.reduce((sum, { count }) => sum + count, 0);

export default function CongressCompositionChart({
    senators = [
        { party: 'MORENA', count: 0 },
        { party: 'PAN', count: 0 },
        { party: 'PRI', count: 0 },
        { party: 'MC', count: 0 },
        { party: 'PT', count: 0 },
        { party: 'PVEM', count: 0 },
    ],
    deputies = [
        { party: 'MORENA', count: 0 },
        { party: 'PAN', count: 0 },
        { party: 'PRI', count: 0 },
        { party: 'MC', count: 0 },
        { party: 'PT', count: 0 },
        { party: 'PVEM', count: 0 },
    ],
    title = 'x',
}) {
    const totalSenators = getTotal(senators);
    const totalDeputies = getTotal(deputies);

    const [hovered, setHovered] = useState({ chamber: null, party: null });
    const [selectedParty, setSelectedParty] = useState(null);

    const handlePartyClick = (party) =>
        setSelectedParty((prev) => (prev === party ? null : party));

    return (
        <section className="py-5 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10">
                    {title}
                </h1>

                <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">
                    <ChartCard
                        label="Senadores"
                        total={totalSenators}
                        data={senators}
                        colors={PARTY_COLORS}
                        selectedParty={selectedParty}
                        onHover={(party) => setHovered({ chamber: 'senate', party })}
                        chamber="senate"
                    />
                    <ChartCard
                        label="Diputados"
                        total={totalDeputies}
                        data={deputies}
                        colors={PARTY_COLORS}
                        selectedParty={selectedParty}
                        onHover={(party) => setHovered({ chamber: 'deputy', party })}
                        chamber="deputy"
                    />
                </div>

                {/* 🧭 Tooltip */}
                {hovered.party && (
                    <div className="mt-10 p-4 bg-gray-50 rounded-lg max-w-md mx-auto text-center shadow">
                        <h4 className="font-bold text-gray-800">
                            {hovered.chamber === 'senate' ? 'Senado' : 'Cámara de Diputados'}
                        </h4>
                        <p className="text-gray-600 mt-1">
                            Partido:{' '}
                            <span className="font-medium uppercase">{hovered.party}</span> —{' '}
                            <span className="font-bold">
                                {hovered.chamber === 'senate'
                                    ? senators.find((s) => s.party === hovered.party)?.count
                                    : deputies.find((d) => d.party === hovered.party)?.count}
                            </span>{' '}
                            legisladores
                        </p>
                    </div>
                )}

                {/* 🏷️ Leyenda */}
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 max-w-4xl mx-auto">
                    {Object.entries(PARTY_COLORS).map(([party, color]) => (
                        <button
                            key={party}
                            onClick={() => handlePartyClick(party)}
                            className={`flex items-center gap-2 p-1 rounded transition-all duration-200 ${selectedParty === party
                                    ? 'bg-gray-200 scale-105 border border-gray-400'
                                    : 'hover:bg-gray-50'
                                }`}
                            aria-label={`Seleccionar partido ${party}`}
                        >
                            <div
                                className="w-4 h-4 rounded-sm border border-gray-300"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs font-medium text-gray-700">{party}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* 📊 Tarjeta */
function ChartCard({ label, total, data, colors, onHover, selectedParty, chamber }) {
    return (
        <div className="w-full max-w-xs">
            <h3 className="text-xl font-semibold text-center mb-4 text-black">
                {label} ({total})
            </h3>
            <PieChart
                data={data}
                total={total}
                colors={colors}
                onHover={onHover}
                selectedParty={selectedParty}
                chamber={chamber}
            />
        </div>
    );
}

/* 📈 PieChart con animación */
function PieChart({ data, total, colors, onHover, selectedParty, chamber }) {
    const segments = useMemo(() => {
        if (total === 0) return [];
        let cumulativeAngle = 0;

        return data.map((item) => {
            const percent = item.count / total;
            const angle = percent * 360;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;
            cumulativeAngle += angle;

            return {
                ...item,
                percent,
                path: describeArc(100, 100, 90, startAngle, endAngle),
            };
        });
    }, [data, total]);

    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        setAnimated(true);
    }, []);

    if (total === 0) return <div className="text-center">Sin datos</div>;

    return (
        <div className="relative w-64 h-64 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="90" fill="#f9fafb" />

                {segments.map((segment, i) => {
                    const isSelected = selectedParty === segment.party;

                    return (
                        <path
                            key={segment.party}
                            d={segment.path}
                            fill={colors[segment.party] || colors.SP}
                            stroke={isSelected ? '#000' : '#fff'}
                            strokeWidth={isSelected ? '3' : '2'}
                            className="cursor-pointer"
                            onMouseEnter={() => onHover(segment.party)}
                            onMouseLeave={() => onHover(null)}
                            style={{
                                opacity: animated ? 1 : 0,
                                transformOrigin: 'center',
                                transition: `opacity 0.3s ease ${i * 0.1}s, transform 0.3s ease`,
                                transform: animated ? 'scale(1)' : 'scale(0.8)',
                            }}
                        />
                    );
                })}

                <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#000"
                    fontSize="35"
                    fontWeight="bold"
                >
                    {total}
                </text>
                <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#000"
                    fontSize="15"
                >
                    Total
                </text>
            </svg>
        </div>
    );
}

// 🎯 Helpers
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const adjustedStart = startAngle - 90;
    const adjustedEnd = endAngle - 90;

    const start = polarToCartesian(x, y, radius, adjustedEnd);
    const end = polarToCartesian(x, y, radius, adjustedStart);

    const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? '0' : '1';

    return [
        'M',
        x,
        y,
        'L',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        'L',
        x,
        y,
        'Z',
    ].join(' ');
}

