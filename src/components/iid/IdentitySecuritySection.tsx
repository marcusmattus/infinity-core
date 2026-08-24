const states = [
  {
    name: "Trusted",
    detail: "Identity and device pair verified.",
    tone: "bg-emerald-400",
  },
  {
    name: "Permission Required",
    detail: "Context shift detected. Confirm agent scope.",
    tone: "bg-amber-400",
  },
  {
    name: "Agent Active",
    detail: "Encrypted actions executing within policy.",
    tone: "bg-primary",
  },
  {
    name: "Access Denied",
    detail: "Zero-trust boundary blocked unauthorized request.",
    tone: "bg-red-400",
  },
];

export function IdentitySecuritySection() {
  return (
    <section id="security" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <p className="mono-label text-muted-foreground">07 — Identity &amp; Security</p>
        <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Your identity. <br className="hidden sm:block" />
          Your context. <br className="hidden sm:block" />
          Your control.
        </h2>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_1.05fr]">
          <div className="relative mx-auto flex size-72 items-center justify-center sm:size-80">
            <span className="absolute inset-0 rounded-full border border-primary/55 orbit-slow" />
            <span className="absolute inset-[14%] rounded-full border border-violet/45 orbit-rev" />
            <span className="absolute inset-[28%] rounded-full border border-border" />
            <span className="absolute inset-[36%] rounded-full gradient-fill opacity-20 blur-xl soft-pulse" />
            <div className="glass relative rounded-full px-6 py-3 text-center">
              <p className="mono-label text-primary">Identity ring</p>
              <p className="mt-2 text-sm text-muted-foreground">Pairing · Encryption · Policy</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-surface/35">
            {states.map((state) => (
              <div key={state.name} className="border-b border-border/70 px-6 py-5 last:border-b-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">{state.name}</p>
                  <span className={`size-2 rounded-full ${state.tone} soft-pulse`} />
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{state.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
