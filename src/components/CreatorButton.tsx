"use client";

import React from "react";
import "../styles/creator.css";

interface CreatorButtonProps {
  onClick: () => void;
}

export default function CreatorButton({ onClick }: CreatorButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="creator-button-glow cursor-pointer bg-zinc-900/60 hover:bg-zinc-900/90 border border-[#e6a700]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[#ffcc66] flex items-center gap-1.5 transition-all duration-300 backdrop-blur-sm"
    >
      <span>Built by Sinan Muhammed Shaman S K</span>
      <span className="text-[10px] animate-pulse">✨</span>
    </button>
  );
}
