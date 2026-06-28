"use client";

import React, { useState } from "react";
import { X, Mail, Copy, Check, GraduationCap, Code } from "lucide-react";
import "../styles/creator.css";

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorModal({ isOpen, onClose }: CreatorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const email = "sinanmssk@gmail.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
    >
      <div className="relative w-full max-w-sm bg-zinc-950/90 border border-[#e6a700]/25 rounded-3xl p-6 shadow-2xl backdrop-blur-md creator-modal-animate overflow-hidden">
        {/* Golden glow backing effect */}
        <div className="gold-glow-behind" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4.5 right-4.5 text-zinc-400 hover:text-[#ffcc66] hover:bg-zinc-900/80 p-1.5 rounded-full transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Available Collaboration indicator */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#e6a700]/10 border border-[#e6a700]/20 px-3.5 py-1 rounded-full text-[10px] text-[#ffcc66] font-bold uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Available for Collaboration
          </div>
        </div>

        {/* Profile Card details */}
        <div className="text-center space-y-5">
          {/* Avatar Monogram */}
          <div className="w-16 h-16 mx-auto bg-[#e6a700]/10 border border-[#e6a700]/25 rounded-2xl flex items-center justify-center text-[#ffcc66] font-black text-2xl shadow-inner">
            TR
          </div>

          {/* Details sections */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <Code className="w-3 h-3 text-[#e6a700]/70" /> Creator
              </div>
              <h3 className="text-base font-bold text-zinc-100 mt-1">
                Sinan Muhammed Shaman S K
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <GraduationCap className="w-3 h-3 text-[#e6a700]/70" /> Education
              </div>
              <p className="text-sm text-zinc-300 font-semibold mt-1">
                Computer Science Student
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <Mail className="w-3 h-3 text-[#e6a700]/70" /> Contact
              </div>
              <p className="text-sm text-zinc-300 font-mono font-medium mt-1">
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold bg-zinc-900/80 border border-zinc-800 rounded-xl py-3 hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Email</span>
              </>
            )}
          </button>

          {/* Contact client mailto link */}
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-center gap-1.5 w-full text-xs font-extrabold bg-gradient-to-r from-[#e6a700] to-[#ffcc66] hover:from-[#ffcc66] hover:to-[#e6a700] rounded-xl py-3 text-zinc-950 transition-colors cursor-pointer shadow-md shadow-[#e6a700]/10 text-center"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Me</span>
          </a>
        </div>
      </div>
    </div>
  );
}
