"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Offering = {
  id: string;
  title: string;
  duration: string;
  price: string;
  description: string;
  features: string[];
};

type Props = {
  offerings: Offering[];
};

export default function BookingOfferings({ offerings }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBooking = async (offering: Offering) => {
    setLoading(offering.id);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId: offering.id,
          offeringName: offering.title,
          price: offering.price,
          duration: offering.duration,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {offerings.map((offering) => (
        <Card key={offering.id} elevation="high" className="flex flex-col h-full border-none p-8 lg:p-12 hover:bg-surface-container-highest transition-all duration-300 ease-in-out group hover:shadow-2xl">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-4xl font-display text-on-surface mb-2 italic group-hover:text-primary transition-colors">{offering.title}</h3>
              <span className="font-label text-sm uppercase tracking-widest text-secondary">{offering.duration}</span>
            </div>
            <div className="text-3xl font-display text-on-surface">{offering.price}</div>
          </div>

          <p className="text-lg text-on-surface/70 font-body leading-relaxed mb-12 flex-grow">
            {offering.description}
          </p>

          <div className="space-y-6 mb-12">
            {offering.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-on-surface/50 font-label text-xs uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_#98da27]" aria-hidden="true" />
                {feature}
              </div>
            ))}
          </div>

          <Button 
            variant="primary" 
            className="w-full py-6 text-lg transition-all hover:scale-[1.02]"
            onClick={() => handleBooking(offering)}
            disabled={loading === offering.id}
            aria-label={`Initiate booking for ${offering.title}`}
          >
            {loading === offering.id ? "Preparing Ritual..." : "Initiate Booking"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
