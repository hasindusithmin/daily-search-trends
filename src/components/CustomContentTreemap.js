
export default function CustomizedContent({ root, depth, x, y, width, height, index, payload, colors, rank, name }) {
    const isLeafNode = depth === 1;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: isLeafNode ? colors[Math.floor((index / root.children.length) * colors.length)] : '#ffffff00',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                    cursor: 'pointer'
                }}
            />
            {isLeafNode && (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
                    {name}
                </text>
            )}
            {isLeafNode && (
                <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
                    {index + 1}
                </text>
            )}
        </g>
    );
};