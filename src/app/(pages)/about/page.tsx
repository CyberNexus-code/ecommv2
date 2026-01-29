import Image from "next/image";
import Link from "next/link"

export default function About() {
  return (
    <div className="max-w-3xl mx-auto p-6 justify-center">
        <Image
          src="/about_us_2_2.png"
          alt="about us"
          width={400} // fixed width
          height={200} // auto-height maintained
          className="object-contain mx-auto"
        />
        <p>
          Hi, I’m Elize! I’m the proud owner of our little creative corner, where we
          turn ideas into memorable celebrations.

          Ever since I started this journey,
          my goal has been simple: to bring joy, beauty, and a personal touch to
          every occasion. Your satisfaction is at the heart of everything we do, and
          we love going the extra mile to make every experience special. Based in
          Amanzimtoti, KZN, we ship our creations nationwide with care and reliability.
        </p>
        <p>
          Our passion is creating customizable 3D cake toppers that truly make
          celebrations shine. Whether it’s a birthday, wedding, or graduation, each
          topper is designed to reflect your unique story. From names and ages to
          personal themes, we bring your vision to life—adding a little magic to
          every cake. From timeless classics to whimsical, fun designs, our toppers
          are all about creativity, thoughtfulness, and celebrating life’s special
          moments in style.
        </p>
        <p className="mb-10">
          Every topper we create carries a piece of our heart, and we hope it helps
          make your celebrations unforgettable.
        </p>
        <Link href="/products" aria-label="Shop now!" className="bg-rose-700 text-white rounded-xl py-3 px-6">Shop now!</Link>
    </div>
  );
}
