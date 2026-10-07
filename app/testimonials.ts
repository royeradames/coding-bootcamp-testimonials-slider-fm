export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  photo: string;
  alt: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "tanya",
    quote: "I’ve been interested in coding for a while but never taken the jump, until now. I couldn’t recommend this course enough. I’m now in the job of my dreams and so excited about the future.",
    name: "Tanya Sinclair",
    role: "UX Engineer",
    photo: "/images/image-tanya.jpg",
    alt: "Tanya Sinclair, with curly hair and a red scarf, against a white wall.",
  },
  {
    id: "john",
    quote: "If you want to lay the best foundation possible I’d recommend taking this course. The depth the instructors go into is incredible. I now feel so confident about starting up as a professional developer.",
    name: "John Tarkpor",
    role: "Junior Front-end Developer",
    photo: "/images/image-john.jpg",
    alt: "John Tarkpor smiling with his arms crossed in front of a brick wall.",
  },
];
