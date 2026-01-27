import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="space-y-16">
      {/* ===== ABOUT MIOTO ===== */}
      <div className="bg-emerald-50 rounded-3xl px-6 py-16">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="https://www.mioto.vn/static/media/thue_xe_co_tai_xe_tphcm_gia_re.84f8483d.png"
              alt="About Mioto"
              className="w-full h-[380px] object-cover"
            />
            {/* cut corner effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rotate-45 translate-x-12 -translate-y-12" />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-bold mb-6 hover:underline cursor-pointer">
              Want to know more <br /> about Mioto?
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed max-w-xl">
              Mioto connects customers who need to rent cars with thousands of
              car owners in Ho Chi Minh City, Hanoi, and other provinces. Mioto
              aims to build a trustworthy and civilized car-sharing community in
              Vietnam.
            </p>
            <Link href="/about-us">
              <button className="bg-green-500 hover:bg-green-600 transition text-white px-8 py-3 rounded-xl font-semibold">
                Learn more
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
