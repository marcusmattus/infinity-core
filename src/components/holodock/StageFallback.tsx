import holodockOverview from "@/assets/holodock-overview.webp";

/**
 * What renders before the 3D chunk arrives — and instead of it, on a device
 * with no WebGL. The product sheet still shows the layers, so nobody lands on
 * an empty frame.
 */
export function StageFallback({ unsupported = false }: { unsupported?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <figure className="max-w-3xl">
        <img
          src={holodockOverview}
          alt="HoloDock product overview showing the device, its callouts and an exploded view of the internal modules"
          width={1536}
          height={1024}
          className="hairline w-full opacity-70"
        />
        <figcaption className="label-mono mt-4 text-center text-steel">
          {unsupported
            ? "3D view needs WebGL — showing the product sheet instead"
            : "Loading the interactive device…"}
        </figcaption>
      </figure>
    </div>
  );
}
