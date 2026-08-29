const SIGNALS = [
  "volumetric light engine",
  "spatial anchors",
  "depth reconstruction",
  "gesture + voice fusion",
  "openware plugin sdk",
  "camera mcp server",
  "on-device agents",
  "trusted device pairing",
];

/**
 * The signal strip: a continuous readout of what the layer carries. The track is
 * duplicated so the translate(-50%) loop is seamless.
 */
export function Ticker() {
  return (
    <div className="flex overflow-hidden border-y border-border py-3" aria-hidden="true">
      <div className="marquee-track flex shrink-0">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {SIGNALS.map((signal) => (
              <span
                key={`${copy}-${signal}`}
                className="label-mono flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 text-steel"
              >
                {signal}
                <span className="text-electric">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
