export default function AboutHero() {
  return (
    <section className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      {/* Left text */}
      <div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Mioto – <br /> Go with you on <br /> every journey
        </h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Every trip is a meaningful experience. Traveling is not only about
          moving, but also about discovering yourself, people, and the world
          around you.
        </p>

        <p className="text-gray-600 leading-relaxed">
          Mioto was created to connect people who need cars with trusted car
          owners. We aim to build a modern, transparent, and safe car-sharing
          community across the country.
        </p>
      </div>

      {/* Right images */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-3xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=500&fit=crop"
            alt="Travel map"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="rounded-3xl overflow-hidden shadow-lg mt-12">
          <img
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.GG6Ftue1Yo73Qy1jS2PT8gHaE8%3Fcb%3Ddefcachec2%26pid%3DApi&f=1&ipt=323cf963fe1be862b24982322c1a8733f651bd44364288303699a0e238353f00&ipo=images"
            alt="Car dashboard"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
