type PricePoint = {
  price: number;
  recordedAt: Date | string;
};

type PriceHistoryChartProps = {
  points: PricePoint[];
  currentPrice: number;
};

export function PriceHistoryChart({ points, currentPrice }: PriceHistoryChartProps) {
  if (points.length < 2) return null;

  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // SVG dimensions
  const width = 300;
  const height = 60;
  const paddingX = 4;
  const paddingY = 4;

  // Map points to SVG coordinates
  const svgPoints = points.map((p, i) => {
    const x =
      paddingX + (i / (points.length - 1)) * (width - paddingX * 2);
    const y =
      priceRange === 0
        ? height / 2
        : paddingY +
          ((maxPrice - p.price) / priceRange) * (height - paddingY * 2);
    return `${x},${y}`;
  });

  const polyline = svgPoints.join(" ");

  // Last point dot
  const lastX = parseFloat(svgPoints[svgPoints.length - 1].split(",")[0]);
  const lastY = parseFloat(svgPoints[svgPoints.length - 1].split(",")[1]);

  const priceDrop = points.length >= 2 && currentPrice < points[points.length - 2].price;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            Prijsverloop
          </h3>
          <p className="text-xs text-text-light mt-0.5">Laatste 90 dagen</p>
        </div>
        {priceDrop && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Prijs gedaald
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-14"
        preserveAspectRatio="none"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--color-burgundy, #722F37)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={lastX} cy={lastY} r="3" fill="var(--color-burgundy, #722F37)" />
      </svg>

      <div className="flex justify-between mt-3 text-xs text-text-light">
        <div>
          <span className="block text-foreground font-semibold">
            €{minPrice.toFixed(2)}
          </span>
          laagst
        </div>
        <div className="text-center">
          <span className="block text-foreground font-semibold">
            €{currentPrice.toFixed(2)}
          </span>
          huidig
        </div>
        <div className="text-right">
          <span className="block text-foreground font-semibold">
            €{maxPrice.toFixed(2)}
          </span>
          hoogst
        </div>
      </div>
    </div>
  );
}
