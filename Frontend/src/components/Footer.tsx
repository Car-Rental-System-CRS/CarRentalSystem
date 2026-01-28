import { Facebook, Music2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="container mx-auto px-6 py-14">
        {/* ===== TOP GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ===== LOGO & CONTACT ===== */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-wide">MIOTO</h2>

            <div>
              <p className="font-semibold">1900 9217</p>
              <p className="text-gray-500 text-sm">Support: 7AM - 10PM</p>
            </div>

            <div>
              <p className="font-semibold">contact@mioto.vn</p>
              <p className="text-gray-500 text-sm">Send email to Mioto</p>
            </div>

            {/* Social icons */}
            <div className="flex gap-4 pt-2">
              <div className="w-10 h-10 border rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                <Facebook size={18} />
              </div>
              <div className="w-10 h-10 border rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                <Music2 size={18} />
              </div>
              <div className="w-10 h-10 border rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                <MessageCircle size={18} />
              </div>
            </div>
          </div>

          {/* ===== POLICY ===== */}
          <div>
            <h3 className="font-semibold mb-4">Policies</h3>
            <ul className="space-y-3 text-gray-600">
              <li>Terms & Conditions</li>
              <li>Operating Regulations</li>
              <li>Privacy Policy</li>
              <li>Complaint Resolution</li>
            </ul>
          </div>

          {/* ===== MORE INFO ===== */}
          <div>
            <h3 className="font-semibold mb-4">Learn More</h3>
            <ul className="space-y-3 text-gray-600">
              <li>General Guide</li>
              <li>Booking Guide</li>
              <li>Payment Guide</li>
              <li>FAQs</li>
              <li>About Mioto</li>
              <li>Mioto Blog</li>
              <li>Careers</li>
            </ul>
          </div>

          {/* ===== PARTNERS ===== */}
          <div>
            <h3 className="font-semibold mb-4">Partners</h3>
            <ul className="space-y-3 text-gray-600">
              <li>Register as Car Owner</li>
              <li>Register MITRACK GPS 4G</li>
              <li>Long-term Rental MICARRO</li>
            </ul>
          </div>
        </div>

        {/* ===== DIVIDER ===== */}
        <div className="border-t my-10" />

        {/* ===== COMPANY INFO ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-600 text-sm">
          <p>© Mioto Asia Joint Stock Company</p>

          <p>
            Business Reg No: 0317307544 — Issued: 24-05-22 <br />
            Issued by: HCMC Department of Planning & Investment
          </p>

          <p>
            Bank Account: CTCP MIOTO ASIA <br />
            No: 102-989-1989 — Vietcombank Tan Dinh Branch
          </p>
        </div>

        {/* ===== ADDRESS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 items-center">
          <p className="text-gray-600 text-sm">
            Address: Office 01, Floor 9, Pearl Plaza Building, 561A Dien Bien
            Phu, Thanh My Tay Ward, Ho Chi Minh City, Vietnam.
          </p>
        </div>
      </div>
    </footer>
  );
}
