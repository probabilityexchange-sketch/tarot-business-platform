"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { candleCollection } from "@/lib/merch";

type CandleItem = (typeof candleCollection)[number];

export function MerchLightboxDialog({
  open,
  onClose,
  title,
  saying,
  description,
  jarImage,
  labelImage,
  orderHref,
  onPrev,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  saying: string;
  description?: string;
  jarImage: string;
  labelImage?: string;
  orderHref?: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [viewMode, setViewMode] = useState<"jar" | "label">("jar");

  useEffect(() => {
    setViewMode("jar");
  }, [jarImage]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);

    // Fallback for browsers without native <dialog closedby="any"> support
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isDialogContent) {
        dialog.close();
      }
    };

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      dialog.addEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && onPrev) {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onPrev, onNext]);

  const activeSrc = viewMode === "label" && labelImage ? labelImage : jarImage;

  return (
    <dialog
      ref={dialogRef}
      // @ts-expect-error closedby is a modern HTMLDialogElement attribute
      closedby="any"
      aria-label={`${title} larger preview`}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current.close();
        }
      }}
      className="m-auto max-h-[94vh] w-[min(94vw,56rem)] overflow-y-auto rounded-3xl border border-[#302731]/20 bg-[#fcf9f4] p-0 text-[#302731] shadow-2xl backdrop:bg-[#302731]/75 backdrop:backdrop-blur-xs"
    >
      <div className="p-4 sm:p-7">
        {/* Top bar: Title + View Toggle + Close button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#302731]/15 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[.18em] text-[#744b65]">
              The intention candle collection
            </p>
            <h3 className="mt-0.5 font-serif text-2xl sm:text-3xl">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {labelImage && (
              <div className="inline-flex rounded-full border border-[#302731]/20 bg-[#f5f0e8] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("jar")}
                  className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                    viewMode === "jar"
                      ? "bg-[#653c56] text-white"
                      : "text-[#302731] hover:text-[#653c56]"
                  }`}
                >
                  Amber Jar
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("label")}
                  className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                    viewMode === "label"
                      ? "bg-[#653c56] text-white"
                      : "text-[#302731] hover:text-[#653c56]"
                  }`}
                >
                  Label Close-Up
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close larger image"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#302731]/20 bg-white px-3.5 py-2 text-xs font-medium uppercase tracking-[.12em] text-[#302731] transition hover:border-[#653c56] hover:text-[#653c56]"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Main high-resolution image area */}
        <div className="relative mt-5 flex items-center justify-center overflow-hidden rounded-2xl bg-[#efe5d6]">
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous candle"
              className="absolute left-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#302731]/15 bg-[#fcf9f4]/90 text-[#302731] shadow-md transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <Image
            src={activeSrc}
            alt={`${title} — ${saying}`}
            width={viewMode === "label" ? 1350 : 1232}
            height={viewMode === "label" ? 938 : 1400}
            quality={95}
            unoptimized
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next candle"
              className="absolute right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#302731]/15 bg-[#fcf9f4]/90 text-[#302731] shadow-md transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Caption & action footer */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#302731]/15 pt-4">
          <div className="max-w-xl">
            <p className="font-serif text-lg italic text-[#302731]">“{saying}”</p>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-[#655b61]">{description}</p>
            )}
          </div>

          {orderHref && (
            <Link
              href={orderHref}
              className="inline-flex items-center rounded-full bg-[#653c56] px-6 py-3 text-xs font-medium uppercase tracking-[.14em] text-white transition hover:bg-[#4f3145]"
            >
              $28 · Choose scent &amp; order →
            </Link>
          )}
        </div>
      </div>
    </dialog>
  );
}

export function CandleGallery({ enabled }: { enabled: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeCandle: CandleItem | null =
    activeIndex !== null ? candleCollection[activeIndex] || null : null;

  return (
    <>
      <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {candleCollection.map((candle, index) => {
          const candleHref = `/shop/checkout?item=${candle.slug}-candle`;
          return (
            <article key={candle.slug}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View larger image of ${candle.name} candle`}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-t-[70px] bg-[#fcf9f4] text-left focus:outline-none focus:ring-2 focus:ring-[#653c56]"
              >
                <Image
                  src={`/images/merch/${candle.slug}-candle.webp`}
                  alt={`${candle.name} candle design concept: ${candle.saying}`}
                  width={800}
                  height={900}
                  className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <span className=" absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#302731]/15 bg-[#fcf9f4]/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[.14em] text-[#302731] shadow-xs transition group-hover:bg-[#653c56] group-hover:text-white">
                  <Maximize2 size={12} />
                  <span>Click to enlarge</span>
                </span>
              </button>

              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="font-serif text-3xl">{candle.name}</h3>
                {enabled ? (
                  <Link
                    href={candleHref}
                    className="shrink-0 text-[10px] uppercase tracking-[.15em] text-[#744b65] underline underline-offset-4"
                  >
                    $28 · Choose scent →
                  </Link>
                ) : (
                  <span className="shrink-0 text-[10px] uppercase tracking-[.15em] text-[#744b65]">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="mt-2 font-serif text-base italic text-[#302731]">“{candle.saying}”</p>
              <p className="mt-1 text-sm leading-relaxed text-[#655b61]">{candle.description}</p>
            </article>
          );
        })}
      </div>

      {activeCandle && (
        <MerchLightboxDialog
          open={activeIndex !== null}
          onClose={() => setActiveIndex(null)}
          title={activeCandle.name}
          saying={activeCandle.saying}
          description={activeCandle.description}
          jarImage={`/images/merch/${activeCandle.slug}-candle.webp`}
          labelImage={`/images/merch/${activeCandle.slug}-candle-label.webp`}
          orderHref={enabled ? `/shop/checkout?item=${activeCandle.slug}-candle` : undefined}
          onPrev={() =>
            setActiveIndex((current) =>
              current === null
                ? 0
                : (current - 1 + candleCollection.length) % candleCollection.length
            )
          }
          onNext={() =>
            setActiveIndex((current) =>
              current === null ? 0 : (current + 1) % candleCollection.length
            )
          }
        />
      )}
    </>
  );
}
