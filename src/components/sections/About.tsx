import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

export function About() {
  const values = [
    {
      title: "Freedom",
      description:
        "Move on your terms. No schedules, no waiting, no parking headaches. Just scan and go.",
      dotClass: "bg-rido-magenta",
    },
    {
      title: "Safety",
      description:
        "Beginner mode, tandem detection, brake checks, and real-time ride monitoring.",
      dotClass: "bg-rido-magenta-light",
    },
    {
      title: "Sustainability",
      description:
        "Zero emissions, swappable batteries, carbon-neutral operations, responsible recycling.",
      dotClass: "bg-rido-green",
    },
  ];

  return (
    <section id="about" aria-label="About Rido" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div>
              <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
                Our Story
              </p>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Born in{" "}
                <span className="text-gradient-brand">Spain</span>, Built for
                Spanish Cities
              </h2>
              <p className="text-white/50 leading-relaxed mb-6">
                Rido was founded with a simple belief: moving through your city
                should be easy, affordable, and clean. We saw empty bike lanes,
                crowded roads, and cities that deserve better air.
              </p>
              <p className="text-white/50 leading-relaxed">
                So we built a fleet of shared e-scooters and e-bikes designed for
                Spain&apos;s streets, Spain&apos;s weather, and Spain&apos;s people.
                Every vehicle is serviced in-house, every ride is insured, and
                every kilometre replaces a car trip.
              </p>
            </div>
          </ScrollReveal>

          <StaggerReveal className="grid grid-cols-1 gap-4" staggerDelay={0.15}>
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="glass rounded-2xl p-6 flex items-start gap-4">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 shrink-0 ${value.dotClass}`}
                  />
                  <div>
                    <h3 className="font-bold text-lg">{value.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}