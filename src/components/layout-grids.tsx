import type { ConnectorGroup, Fuse, FuseBlock, RelayAssignment } from "@/data/harness/types";
import { parseWireColor } from "@/data/harness/wire-colors";

// Visual physical layouts — a suggested grid you can map onto the real part.
// Cavity numbering follows the position numbers; confirm orientation/keying
// against the part's datasheet before you commit.

export function BlockGrid({
  block,
  blockFuses,
  blockRelays,
}: {
  block: FuseBlock;
  blockFuses: Fuse[];
  blockRelays: RelayAssignment[];
}) {
  const fuseByPos = new Map(blockFuses.map((f) => [f.position, f]));
  const fusePositions = Array.from({ length: block.fuseWays }, (_, i) => i + 1);

  return (
    <div>
      {block.relayWays > 0 && (
        <>
          <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Relay positions</div>
          <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: `repeat(${block.grid.relayCols}, minmax(0,1fr))` }}>
            {Array.from({ length: block.relayWays }, (_, i) => {
              const r = blockRelays[i];
              return (
                <div
                  key={i}
                  className="rounded border p-1.5 text-[11px] min-h-[42px]"
                  style={{ background: r ? "#241c10" : "#0d1117", opacity: r ? 1 : 0.5 }}
                >
                  <div className="font-mono text-muted">R{i + 1}</div>
                  {r ? (
                    <div className="leading-tight">
                      {r.name.replace(/ relay.*/i, "")} <span className="text-muted">({r.type})</span>
                    </div>
                  ) : (
                    <div className="text-muted">spare</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Fuse positions</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${block.grid.fuseCols}, minmax(0,1fr))` }}>
        {fusePositions.map((pos) => {
          const f = fuseByPos.get(pos);
          const fitted = f && f.ratingA > 0;
          return (
            <div
              key={pos}
              className="rounded border p-1.5 text-[11px] min-h-[44px]"
              style={{ background: fitted ? "#13201a" : "#0d1117", opacity: fitted ? 1 : 0.5 }}
            >
              <div className="flex justify-between">
                <span className="font-mono text-muted">{pos}</span>
                <span className="font-mono font-semibold">{fitted ? `${f!.ratingA}A` : "—"}</span>
              </div>
              <div className="leading-tight">{f ? f.name : "empty"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConnectorGrid({ connector }: { connector: ConnectorGroup }) {
  const pinByNum = new Map(connector.pins.map((p) => [p.pin, p]));
  const cols = connector.ways / 2; // 12-way → two rows of 6
  return (
    <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {Array.from({ length: connector.ways }, (_, i) => {
        const pin = pinByNum.get(i + 1);
        const stroke = pin ? parseWireColor(pin.color) : null;
        // Colored thick border = the wire's insulation colour. Two-tone wires
        // get a base-coloured solid border; the stripe info still appears in
        // the diagram chip + tooltip.
        const borderStyle: React.CSSProperties = stroke
          ? { borderColor: stroke.base, borderWidth: 2, borderStyle: stroke.stripe ? "dashed" : "solid" }
          : {};
        return (
          <div
            key={i}
            className="rounded border p-1 text-center min-h-[40px] flex flex-col justify-center"
            style={{
              background: pin ? (pin.reserved ? "#0d1117" : "#141922") : "#0d1117",
              opacity: pin ? 1 : 0.45,
              ...borderStyle,
            }}
            title={pin ? `${pin.signal}${pin.color ? ` · ${pin.color}` : ""}` : undefined}
          >
            <div className="font-mono text-[10px] text-muted">{i + 1}</div>
            {pin ? <span className="label-chip text-[9px]">{pin.wireLabel}</span> : <span className="text-[10px] text-muted">—</span>}
          </div>
        );
      })}
    </div>
  );
}
