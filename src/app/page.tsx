"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/context/ToastContext";
import {
  MessageSquare,
  Compass,
  Zap,
  Shield,
  MapPin,
  CheckCheck,
  Send,
  ArrowRight,
  Sparkles,
  Users,
  Moon,
  Lock,
  Mail,
  HelpCircle,
  Heart,
  Smile,
} from "lucide-react";

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast({
        title: "Please fill in all fields",
        description: "We need your name, email, and message to get back to you.",
        type: "info",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        title: "Message Received!",
        description: `Thanks ${contactName}! We'll reply to your email shortly.`,
        type: "success",
      });
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-brand selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-card-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3.5">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-dark via-brand to-purple-400 p-0.5 shadow-glow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-surface-300 rounded-[14px] flex items-center justify-center">
                <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-purple-200">
                  Y
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
                Yapster
                <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Chat & Meet Friends
              </span>
            </div>
          </Link>

          {/* User-friendly Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#overview" className="hover:text-white transition-colors">
              Why Yapster
            </a>
            <a href="#nearby" className="hover:text-white transition-colors">
              Find People
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact Us
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link
                href="/chat"
                className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all hover:scale-105"
              >
                <Avatar
                  src={user.profile_picture}
                  name={user.name}
                  size="xs"
                  ringColor="purple"
                  isOnline={true}
                />
                <span>Open Yapster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-2xl text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all hover:scale-105"
                >
                  <span>Join Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Soft background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-brand/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-700/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Friendly Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-100/90 border border-brand/40 text-brand-light text-xs font-semibold mb-6 shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A fresh, exciting way to chat and connect</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Chat with Friends.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-brand to-purple-300">
              Discover Who&apos;s Nearby.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Yapster is the sleek, private messaging app where you can talk
            effortlessly with your best friends and discover people hanging out
            right in your neighborhood, campus, or city.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={isAuthenticated ? "/chat" : "/register"}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold shadow-glow hover:scale-105 active:scale-95 transition-all"
            >
              <span>{isAuthenticated ? "Open Your Messages" : "Start Yapping Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-surface-100/90 hover:bg-surface-50 border border-card-border hover:border-brand/50 text-slate-200 hover:text-white text-sm font-medium transition-all"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Simple benefit pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-surface-100/60 px-3.5 py-1.5 rounded-full border border-card-border/60">
              <Zap className="w-3.5 h-3.5 text-brand-light" />
              Instant &amp; Smooth
            </span>
            <span className="flex items-center gap-1.5 bg-surface-100/60 px-3.5 py-1.5 rounded-full border border-card-border/60">
              <MapPin className="w-3.5 h-3.5 text-brand-light" />
              Find Friends in Your City
            </span>
            <span className="flex items-center gap-1.5 bg-surface-100/60 px-3.5 py-1.5 rounded-full border border-card-border/60">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Safe, Private &amp; Ad-Free
            </span>
          </div>

          {/* 3. HERO PRODUCT MOCKUP PREVIEW */}
          <div className="mt-16 relative max-w-4xl mx-auto rounded-3xl bg-card border border-card-border p-3 sm:p-5 shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-card-border pb-3 mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live on Yapster
              </div>
              <div className="text-[11px] text-brand-light font-medium bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
                Online
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[420px]">
              {/* Left pane: Active friends & conversations preview */}
              <div className="hidden md:flex md:col-span-5 flex-col bg-surface-200/90 rounded-2xl p-4 border border-card-border/70 overflow-hidden">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Currently Online</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                {/* Avatars rail */}
                <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-4 border-b border-card-border/60 scrollbar-none">
                  {["Harper", "Ethan", "Isabelle", "Alex"].map((name) => (
                    <div key={name} className="flex flex-col items-center gap-1 shrink-0">
                      <Avatar name={name} size="sm" isOnline={true} ringColor="purple" />
                      <span className="text-[10px] text-slate-300 font-medium">{name}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-semibold text-slate-400 mb-2">Recent Chats</div>
                <div className="space-y-2 overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-xl bg-card border border-brand/40 shadow-glow-sm flex items-center gap-3">
                    <Avatar name="Harper Smith" size="sm" isOnline={true} ringColor="cyan" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">Harper</span>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">
                        Are you at the coffee shop nearby?
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-100/50 flex items-center gap-3 text-slate-400">
                    <Avatar name="Ethan Miller" size="sm" isOnline={false} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-300">Ethan</span>
                        <span className="text-[10px]">10m ago</span>
                      </div>
                      <p className="text-[11px] truncate">Loved the photos from yesterday!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right pane: Chat Conversation preview */}
              <div className="md:col-span-7 flex flex-col bg-surface-300 rounded-2xl border border-card-border/70 overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-surface-200/90 border-b border-card-border/60">
                  <div className="flex items-center gap-2.5">
                    <Avatar name="Harper Smith" size="sm" isOnline={true} ringColor="cyan" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Harper</h4>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active • 1.2 km away
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-surface-100 px-2 py-1 rounded-full border border-card-border">
                    📍 Bandra
                  </span>
                </div>

                {/* Messages stream */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
                  <div className="flex justify-center">
                    <span className="px-2.5 py-0.5 text-[10px] bg-surface-100 text-slate-400 rounded-full border border-card-border">
                      Today
                    </span>
                  </div>

                  {/* Incoming bubble */}
                  <div className="flex items-end gap-2">
                    <Avatar name="Harper Smith" size="xs" />
                    <div className="bg-surface-100 text-slate-100 px-3.5 py-2 rounded-2xl rounded-bl-sm border border-card-border/60 max-w-[75%]">
                      Hey Alex! Are you at the local library? I see you&apos;re just down the road!
                      <div className="text-[9px] text-slate-400 mt-1">10:42 AM</div>
                    </div>
                  </div>

                  {/* Outgoing bubble in purple */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-brand to-brand-vibrant text-white px-3.5 py-2 rounded-2xl rounded-br-sm shadow-glow-sm max-w-[75%]">
                      Yes! Studying here with an iced latte. Come over, let&apos;s hang out!
                      <div className="text-[9px] text-purple-200 mt-1 flex items-center justify-end gap-1">
                        10:43 AM <CheckCheck className="w-3 h-3 text-cyan-300" />
                      </div>
                    </div>
                  </div>

                  {/* Typing animation */}
                  <div className="flex items-center gap-2 text-[10px] text-brand-light font-medium pl-6">
                    <span>Harper is typing...</span>
                  </div>
                </div>

                {/* Input mock */}
                <div className="p-3 bg-surface-200/90 border-t border-card-border/60 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Type a friendly message..."
                    className="flex-1 bg-surface-100 border border-card-border text-xs text-slate-200 px-3.5 py-2 rounded-full outline-none"
                  />
                  <div className="p-2 rounded-full bg-brand text-white shadow-glow-sm">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "WHY YAPSTER?" OVERVIEW SECTION */}
      <section id="overview" className="py-20 bg-surface-400 border-t border-card-border/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-light uppercase tracking-wider mb-2">
              Why You&apos;ll Love It
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              More Than Just Another Chat App
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Most messaging apps only let you text people whose phone numbers you
              already have. Yapster opens up your world—helping you chat with your
              closest friends while making it effortless to meet wonderful people right around you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-card-border rounded-3xl p-7 shadow-lg relative overflow-hidden group hover:border-brand/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-light mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Fast &amp; Natural
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No slow loading, no refreshing pages, no annoying lag. Messages
                arrive immediately, making your conversations feel as natural as
                talking across a table.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-3xl p-7 shadow-lg relative overflow-hidden group hover:border-brand/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Meet People Close By
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                New in town, on campus, or looking for a workout partner? See who is
                nearby and connect with friendly folks in your area.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-3xl p-7 shadow-lg relative overflow-hidden group hover:border-brand/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Your Space, Your Peace
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                You stay completely in charge. Accept or decline friend requests,
                keep your exact location private, and block anyone in a single tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FIND PEOPLE NEARBY SPOTLIGHT SECTION */}
      <section id="nearby" className="py-20 bg-surface-400 border-t border-card-border/70 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 text-brand-light border border-brand/30 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Local Friendships</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Never Miss Friends Hanging Out Close To You
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you just moved to a new neighborhood, are sitting in a
                campus cafeteria, or exploring a new city, Yapster helps you see
                who is around without ever revealing your exact address.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span>One-click location setup that detects your city area</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span>Adjust your distance slider from 1 km to 50 km</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span>Send a friend request and start talking once connected</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href={isAuthenticated ? "/chat" : "/register"}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Try Finding Friends Nearby</span>
                </Link>
              </div>
            </div>

            {/* Visual Cards */}
            <div className="lg:col-span-6">
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-card-border/60">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-brand" />
                    <span className="text-sm font-bold text-white">
                      People Close To You (5 km radius)
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    3 nearby
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 border border-card-border">
                    <div className="flex items-center gap-3">
                      <Avatar name="Sarah Jenkins" size="md" ringColor="yellow" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Sarah Jenkins</h4>
                        <p className="text-xs text-slate-400">@sarah_j • Mumbai</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/20 text-brand-light border border-brand/30">
                      0.8 km away
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 border border-card-border">
                    <div className="flex items-center gap-3">
                      <Avatar name="Leo Chen" size="md" ringColor="cyan" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Leo Chen</h4>
                        <p className="text-xs text-slate-400">@leo_c • Bandra</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/20 text-brand-light border border-brand/30">
                      2.4 km away
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 border border-card-border">
                    <div className="flex items-center gap-3">
                      <Avatar name="Maya Patel" size="md" ringColor="pink" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Maya Patel</h4>
                        <p className="text-xs text-slate-400">@maya_p • Andheri</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/20 text-brand-light border border-brand/30">
                      4.1 km away
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS 3-STEP WALKTHROUGH */}
      <section id="how-it-works" className="py-20 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-light uppercase tracking-wider mb-2">
              Simple &amp; Easy
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get Started In 3 Easy Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-card-border rounded-3xl p-7 text-center relative group hover:border-brand/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-glow">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Create Your Profile</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign up in 30 seconds with your name, a cool username, and a short bio.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-3xl p-7 text-center relative group hover:border-brand/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-glow">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Set Your City Area</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Allow location with one tap so Yapster can show you friends and
                people hanging out nearby.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-3xl p-7 text-center relative group hover:border-brand/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-glow">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Say Hello &amp; Yap</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with friends, start conversations, and enjoy instant,
                fun messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT US SECTION */}
      <section id="contact" className="py-20 bg-surface-400 border-t border-card-border/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 text-brand-light border border-brand/30 text-xs font-semibold">
                <Mail className="w-3.5 h-3.5" />
                <span>We&apos;re Here For You</span>
              </div>

              <h3 className="text-3xl font-extrabold text-white">
                Have a Question or Idea? We&apos;d Love to Hear From You.
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Whether you want to share feedback, suggest a new feature, or ask
                for assistance, our friendly team is here to help.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-card-border">
                  <Mail className="w-4 h-4 text-brand-light" />
                  <span>hello@yapster.app</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-card-border">
                  <HelpCircle className="w-4 h-4 text-brand-light" />
                  <span>We usually reply within a couple of hours</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleContactSubmit}
                className="bg-card border border-card-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Alex Taylor"
                      className="w-full px-4 py-2.5 rounded-2xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-2.5 rounded-2xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="General Question / Feedback"
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="mt-auto bg-surface-400 border-t border-card-border/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Yapster</span>
            <span>• Chat With Friends &amp; Meet People Nearby</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#overview" className="hover:text-white transition-colors">
              Why Yapster
            </a>
            <a href="#nearby" className="hover:text-white transition-colors">
              Find People
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          <div>&copy; {new Date().getFullYear()} Yapster. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
