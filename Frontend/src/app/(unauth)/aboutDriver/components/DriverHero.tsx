export default function DriverHero() {
  return (
    <section className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">
          Become a Driver & Earn with Car Rental System
        </h1>

        <p className="text-gray-600 mb-6">
          Drive customers, earn stable income, and work on your own schedule.
          Join our professional driver community today.
        </p>

        <button className="bg-black text-white w-full py-4 rounded-xl font-semibold hover:bg-gray-800 transition">
          Apply to be a Driver
        </button>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200"
          className="w-full h-[420px] object-cover"
          alt="Professional Driver"
        />
      </div>
    </section>
  );
}
