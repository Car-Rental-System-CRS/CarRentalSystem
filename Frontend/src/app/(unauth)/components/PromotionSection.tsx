'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Promo = {
  id: number;
  image: string;
  alt: string;
};

export default function PromotionsCarousel() {
  const promotions: Promo[] = [
    { id: 1, image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop", alt: "Giảm 20% cho thuê xe tự lái" },
    { id: 2, image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=500&fit=crop", alt: "Combo gia đình giảm 25%" },
    { id: 3, image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop", alt: "Thuê xe dài hạn giảm 15%" },
    { id: 4, image: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=800&h=500&fit=crop", alt: "Xe mới giảm 30%" },
    { id: 5, image: "https://images.unsplash.com/photo-1563720223488-8f2f62a6e71a?w=800&h=500&fit=crop", alt: "Ưu đãi sinh nhật đặc biệt" },
    { id: 6, image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop", alt: "Giờ vàng giảm giá" },
  ];

  const slidesToShow = 3;

  // clone for infinite loop
  const head = promotions.slice(0, slidesToShow);
  const tail = promotions.slice(-slidesToShow);
  const track = [...tail, ...promotions, ...head];

  const [index, setIndex] = useState(slidesToShow);
  const [enableTransition, setEnableTransition] = useState(true);
  const slidePercent = 100 / slidesToShow;

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);

  // auto slide
  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, []);

  // jump when hitting clones
  useEffect(() => {
    if (index === track.length - slidesToShow) {
      setTimeout(() => {
        setEnableTransition(false);
        setIndex(slidesToShow);
      }, 500);
    }

    if (index === 0) {
      setTimeout(() => {
        setEnableTransition(false);
        setIndex(promotions.length);
      }, 500);
    }
  }, [index, promotions.length, slidesToShow, track.length]);

  // re-enable animation after jump
  useEffect(() => {
    if (!enableTransition) {
      requestAnimationFrame(() => setEnableTransition(true));
    }
  }, [enableTransition]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Chương Trình Khuyến Mãi
          </h2>
          <p className="text-gray-600 text-lg">
            Nhận nhiều ưu đãi hấp dẫn
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">

          {/* Left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg z-10 rounded-full"
          >
            <ChevronLeft />
          </Button>

          {/* Right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg z-10 rounded-full"
          >
            <ChevronRight />
          </Button>

          {/* Track */}
          <div className="overflow-hidden">
            <div
              className="flex"
              style={{
                transform: `translateX(-${index * slidePercent}%)`,
                transition: enableTransition ? 'transform 0.5s ease' : 'none',
              }}
            >
              {track.map((promo, i) => (
                <div
                  key={`${promo.id}-${i}`}
                  className="px-2 flex-shrink-0"
                  style={{ width: `${slidePercent}%` }}
                >
                  <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group cursor-pointer">
                    <img
                      src={promo.image}
                      alt={promo.alt}
                      className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
