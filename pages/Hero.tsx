import React from "react";

const Hero = () => {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pt-24">
        <p className="mb-5 text-xs font-bold uppercase tracking-[.18em] text-[#487159]">
          An independent publication
        </p>
        <div className="max-w-3xl">
          <h1 className="font-['Newsreader'] text-[48px] leading-[.97] tracking-[-.055em] text-[#20221e] sm:text-[72px]">
            Notes on the things that shape a life.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#63665d]">
            Commonplace is a home for observant writing on culture, place, and
            the everyday ideas worth carrying forward.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Hero;
