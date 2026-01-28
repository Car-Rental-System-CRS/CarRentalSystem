export default function AboutMission() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left text */}
        <div>
          <h2 className="text-4xl font-bold mb-6">Drive. Explore. Inspire</h2>

          <p className="text-gray-600 mb-4">
            With the desire to build a civilized and trustworthy car-sharing
            community, we continuously improve service quality to bring the best
            experience to every trip.
          </p>

          <p className="text-gray-600">
            From city drives to long journeys, Mioto helps you explore freely
            and confidently with flexible rental options and strong support
            systems.
          </p>
        </div>

        {/* Right image */}
        <div className="rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=500&fit=crop"
            alt="Road trip"
            className="w-full h-[380px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
