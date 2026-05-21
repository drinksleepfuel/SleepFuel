import type {Route} from './+types/about';

export const meta: Route.MetaFunction = () => [
  {title: 'About SleepFuel'},
  {
    name: 'description',
    content:
      'SleepFuel is a doctor-formulated nightly drink mix engineered for deeper sleep and clearer mornings.',
  },
];

export default function About() {
  return (
    <>
      <Hero />
      <Mission />
      <Values />
      <Team />
      <Manifesto />
    </>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{background: 'var(--color-midnight)', color: '#fff'}}
    >
      <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
        <p
          className="text-sm font-semibold uppercase tracking-[0.3em]"
          style={{color: 'var(--color-awaking)'}}
        >
          About SleepFuel
        </p>
        <h1
          className="mt-6 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          style={{fontFamily: 'var(--font-display)'}}
        >
          Made for dreamers,
          <br />
          <span style={{color: 'var(--color-awaking)'}}>built for </span>
          <span style={{color: 'var(--color-golden)'}}>accuracy</span>.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg" style={{color: 'var(--color-jet)'}}>
          SleepFuel started in a sleep lab, not a marketing meeting. We&rsquo;re a small team of sleep researchers, formulators, and chronic insomniacs on a mission to make great sleep accessible to everyone.
        </p>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2
            className="text-4xl font-semibold sm:text-5xl"
            style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
          >
            Our mission
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-[color:var(--color-recovery)]">
          <p>
            We believe sleep is the most under-leveraged input to human performance. Better sleep doesn&rsquo;t just feel better — it makes you healthier, sharper, calmer, and more resilient.
          </p>
          <p>
            And yet most sleep products on the market are either useless (homeopathic doses, mystery blends) or addictive (prescription sedatives that wreck your sleep architecture). We built SleepFuel to fix that gap.
          </p>
          <p>
            Every ingredient in our formula is dosed at the level shown to actually work in peer-reviewed sleep research. Nothing more, nothing less.
          </p>
        </div>
      </div>
    </section>
  );
}

function Values() {
  const values = [
    {
      t: 'Science over story',
      d: 'Every claim we make has a citation. Every dose has a study behind it.',
    },
    {
      t: 'Transparency by default',
      d: 'No proprietary blends. Every ingredient and dose is on the label.',
    },
    {
      t: 'Habit, not hype',
      d: 'Better sleep is a nightly practice — not a one-time fix. We built SleepFuel for the long run.',
    },
    {
      t: 'Respect the body',
      d: 'No mega-doses, no dependency-forming ingredients. Your body should run the show.',
    },
  ];

  return (
    <section
      className="py-24"
      style={{background: 'var(--color-neutral)'}}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          className="text-4xl font-semibold sm:text-5xl"
          style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
        >
          What we stand for.
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.t} className="rounded-2xl bg-white p-6">
              <h3
                className="text-2xl font-semibold"
                style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
              >
                {v.t}
              </h3>
              <p className="mt-3 text-[color:var(--color-recovery)]">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  const team = [
    {n: 'Dr. Aisha Patel', r: 'Co-founder & Chief Science Officer'},
    {n: 'Marcus Holloway', r: 'Co-founder & CEO'},
    {n: 'Lin Chen', r: 'Head of Formulation'},
    {n: 'Sara Okafor', r: 'Head of Sleep Research'},
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <h2
        className="text-4xl font-semibold sm:text-5xl"
        style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
      >
        The team.
      </h2>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {team.map((m, i) => (
          <div key={m.n}>
            <div
              className="aspect-square w-full rounded-3xl"
              style={{
                background: [
                  'var(--color-sunset)',
                  'var(--color-golden)',
                  'var(--color-recovery)',
                  'var(--color-midnight)',
                ][i % 4],
              }}
              aria-hidden="true"
            />
            <div className="mt-4 font-semibold">{m.n}</div>
            <div className="text-sm text-[color:var(--color-recovery)]">{m.r}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section
      className="py-24"
      style={{background: 'var(--color-charcoal)', color: '#fff'}}
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p
          className="text-3xl font-light leading-snug sm:text-4xl"
          style={{fontFamily: 'var(--font-display)'}}
        >
          &ldquo;The world doesn&rsquo;t need more energy drinks.
          <br />
          It needs better rest.&rdquo;
        </p>
        <p className="mt-8 text-sm uppercase tracking-[0.3em]" style={{color: 'var(--color-awaking)'}}>
          — The SleepFuel team
        </p>
      </div>
    </section>
  );
}
