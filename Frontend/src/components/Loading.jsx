import React from "react";
import logo from "../assets/image/logo.png";

const LoadingPage = () => {
  const dots = [
    {
      color: "bg-red-500",
      delay: "0s",
      position: "translate-y-1",
    },
    {
      color: "bg-yellow-400",
      delay: "0.2s",
      position: "-translate-y-1",
    },
    {
      color: "bg-green-500",
      delay: "0.4s",
      position: "-translate-y-3",
    },
    {
      color: "bg-blue-500",
      delay: "0.6s",
      position: "-translate-y-1",
    },
    {
      color: "bg-black",
      delay: "0.8s",
      position: "translate-y-1",
    },
  ];

  return (
    <div className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <div className="flex flex-col items-center">
        {/* Brand */}
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="DevLab"
            className="h-14 w-14 rounded-xl object-contain"
          />

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-light">
            Edu<span className="text-primary-500">Tech</span>
          </h1>

          {/* Tagline */}
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-[0.22em] text-ink-light/70">
            <span>Learn</span>
            <span className="text-primary-500">•</span>

            <span>Practice</span>
            <span className="text-primary-500">•</span>

            <span>Test</span>
            <span className="text-primary-500">•</span>

            <span>Earn</span>
          </div>
        </div>

        {/* Wave Loader */}
        <div className="mt-14 flex h-12 items-center justify-center gap-3">
          {dots.map((dot, index) => (
            <span
              key={index}
              className={`h-3.5 w-3.5 rounded-full ${dot.color} ${dot.position} shadow-sm animate-devlab-wave`}
              style={{
                animationDelay: dot.delay,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <p className="mt-5 text-xs font-medium tracking-wide text-primary-500">
          Loading...
        </p>
      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes devlab-wave {
            0%,
            100% {
              transform: translateY(10px);
            }

            50% {
              transform: translateY(-10px);
            }
          }

          .animate-devlab-wave {
            animation: devlab-wave 0.9s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingPage;
