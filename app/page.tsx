import { siteName } from "./site";
import { TestimonialSlider } from "./testimonial-slider";
import { testimonials } from "./testimonials";

export default function Home() {
  return (
    <>
      <main>
        <h1 className="sr-only">Coding bootcamp student testimonials</h1>
        <TestimonialSlider testimonials={testimonials} />
      </main>
      <footer>
        <span className="site-name">{siteName}</span>.{" "}
        <span className="footer-part">Challenge by <a href="https://www.frontendmentor.io/challenges/coding-bootcamp-testimonials-slider-4FNyLA8JL">Frontend Mentor</a>.</span>{" "}
        <span className="footer-part">Built by <a href="https://royeradames.com">Royer Adames</a>.</span>
      </footer>
    </>
  );
}
