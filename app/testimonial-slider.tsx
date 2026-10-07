"use client";

/* Native images keep the supplied 540px portraits at their intrinsic size and avoid an image optimizer for two files. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Testimonial } from "./testimonials";

const SWIPE_DISTANCE = 40;

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden="true" focusable="false" width="13" height="18" viewBox="0 0 13 18">
      <path fill="none" stroke="currentColor" strokeWidth="3" d={direction === "previous" ? "M11 1L3 9l8 8" : "M2 1l8 8-8 8"} />
    </svg>
  );
}

export function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const swipeStart = useRef<number | null>(null);
  const count = testimonials.length;

  const show = (index: number) => {
    const next = (index + count) % count;
    const testimonial = testimonials[next];
    setActive(next);
    setAnnouncement(`Testimonial ${next + 1} of ${count}: ${testimonial.name}, ${testimonial.role}`);
  };
  const previous = () => show(active - 1);
  const next = () => show(active + 1);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
    if (event.key === "ArrowRight") { event.preventDefault(); next(); }
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (distance <= -SWIPE_DISTANCE) next();
    if (distance >= SWIPE_DISTANCE) previous();
  };

  return (
    <section
      className="slider"
      aria-roledescription="carousel"
      aria-label="Student testimonials"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { swipeStart.current = null; }}
    >
      <div className="quotes">
        {testimonials.map((testimonial, index) => (
          <figure
            key={testimonial.id}
            id={`slide-${testimonial.id}`}
            className="slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            data-active={index === active}
            aria-hidden={index !== active}
            inert={index !== active}
          >
            <blockquote><p>“ {testimonial.quote} ”</p></blockquote>
            <figcaption><span className="name">{testimonial.name}</span> <span className="role">{testimonial.role}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="stage">
        <div className="photo-frame">
          {testimonials.map((testimonial, index) => (
            <img
              key={testimonial.id}
              className="photo"
              src={testimonial.photo}
              width="540"
              height="540"
              alt={index === active ? testimonial.alt : ""}
              aria-hidden={index !== active}
              data-active={index === active}
              fetchPriority={index === 0 ? "high" : undefined}
            />
          ))}
        </div>
        <div className="controls" role="group" aria-label="Choose testimonial">
          <button type="button" aria-label="Previous testimonial" aria-controls={testimonials.map(t => `slide-${t.id}`).join(" ")} onClick={previous}><Chevron direction="previous" /></button>
          <button type="button" aria-label="Next testimonial" aria-controls={testimonials.map(t => `slide-${t.id}`).join(" ")} onClick={next}><Chevron direction="next" /></button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </section>
  );
}
