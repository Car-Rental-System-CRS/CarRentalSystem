import Link from 'next/link';

// components/servicesSection.tsx
export default function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center mb-16">Mioto Services</h2>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Card Container */}
          <div className="relative transform md:-rotate-3">
            {/* Card with skew effect */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl transform md:skew-y-1 md:-rotate-1 hover:shadow-2xl transition-shadow duration-300">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop"
                alt="Self-drive car rental"
                className="w-full h-[400px] object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-3xl font-bold mb-3">
                  Your car is ready.
                  <br />
                  Start your journey now!
                </h3>

                <p className="text-lg text-white/90 mb-6 max-w-md">
                  Drive your favorite car yourself and enjoy an exciting trip.
                </p>

                <Link href="/self-drive" className="inline-block">
                  <button className="bg-green-500 hover:bg-green-600 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-xl w-fit hover:scale-105 active:scale-95">
                    Rent a self-drive car
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Card Container */}
          <div className="relative transform md:rotate-3">
            {/* Card with skew effect */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl transform md:-skew-y-1 md:rotate-1 hover:shadow-2xl transition-shadow duration-300">
              <img
                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.0w9Ot94P5KyfeNvkvkUEjwHaE8%3Fpid%3DApi&f=1&ipt=58b068ba86e6c54d24abf98a6ea9aaacb1daf118347680c86de05ae2b8027cc0&ipo=images"
                alt="Car rental with driver"
                className="w-full h-[400px] object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-3xl font-bold mb-3">
                  Your driver has arrived!
                </h3>

                <p className="text-lg text-white/90 mb-6 max-w-md">
                  Enjoy your trip with our 5★ drivers on Mioto.
                </p>
                <Link href="/with-driver" className="inline-block">
                  <button className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-xl w-fit hover:scale-105 active:scale-95">
                    Rent a car with driver
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
