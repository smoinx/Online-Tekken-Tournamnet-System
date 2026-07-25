import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Trophy, Users, Swords, Star, ChevronRight, Plus, Search, Edit2,
  Trash2, X, Shield, Award, Calendar,
  Globe, Menu, LogIn, LayoutDashboard, List, Layers,
  CheckCircle, Clock, XCircle, Eye, Gamepad2, Zap,
} from "lucide-react";

// --- API Configuration ---
const API_URL = "/api";

// --- Types ------------------------------------------------------------------

type Page = "home" | "players" | "tournaments" | "registrations" | "matches" | "leaderboard" | "dashboard" | "login";

interface Player { player_id: string; username: string; email: string; country: string; rank?: string; rank1?: string; user_id?: number; }
interface Tournament { tournament_id: string; tournament_name: string; start_date: string; end_date: string; prize_pool: number; status: "upcoming" | "ongoing" | "completed"; }
interface Registration { registration_id: string; player_id: string; tournament_id: string; registration_date: string; status: "application" | "confirmed" | "rejected" | "cancelled" | "pending"; }
interface Match { match_id: string; tournament_id: string; match_date: string; stage: string; player1_id: string; player2_id: string; character_used: string; rounds_won: string; result: "win" | "loss" | "pending"; }
interface LeaderboardEntry { lb_id: string; player_id: string; position: number; total_points: number; season: string; }
interface User { id: number; email: string; role: string; }

// --- Seed Data --------------------------------------------------------------

const INITIAL_PLAYERS: Player[] = [
  { player_id: "P001", username: "IronFist_Jin", email: "jin@tekken.gg", country: "Japan", rank1: "Tekken King" },
  { player_id: "P002", username: "DevilPunch_Kazuya", email: "kazuya@mishima.jp", country: "Japan", rank1: "Tekken God" },
  { player_id: "P003", username: "RoyalGuard_Nina", email: "nina.w@assassin.eu", country: "Ireland", rank1: "Bushin" },
  { player_id: "P004", username: "SpinKick_Hwoarang", email: "hwoarang@taekwondo.kr", country: "South Korea", rank1: "Fujin" },
  { player_id: "P005", username: "BearClaw_Kuma", email: "kuma@heihachi.jp", country: "Japan", rank1: "Warrior" },
  { player_id: "P006", username: "Dragunov_USSR", email: "sergei@military.ru", country: "Russia", rank1: "Tekken Emperor" },
  { player_id: "P007", username: "LawBreaker_Forest", email: "forest@marshalllaw.us", country: "USA", rank1: "Juggernaut" },
  { player_id: "P008", username: "ElectricWind_Paul", email: "paul.phoenix@usa.com", country: "USA", rank1: "Tekken King" },
];

const INITIAL_TOURNAMENTS: Tournament[] = [
  { tournament_id: "T001", tournament_name: "Iron Fist Championship 2026", start_date: "2026-07-01", end_date: "2026-07-07", prize_pool: 50000, status: "upcoming" },
  { tournament_id: "T002", tournament_name: "Mishima Zaibatsu Open", start_date: "2026-06-10", end_date: "2026-06-15", prize_pool: 25000, status: "ongoing" },
  { tournament_id: "T003", tournament_name: "G Corp World Series", start_date: "2026-05-01", end_date: "2026-05-05", prize_pool: 100000, status: "completed" },
  { tournament_id: "T004", tournament_name: "Tekken 8 Season Finals 2026", start_date: "2026-08-20", end_date: "2026-08-25", prize_pool: 200000, status: "upcoming" },
  { tournament_id: "T005", tournament_name: "Devil Gene Invitational", start_date: "2026-04-01", end_date: "2026-04-03", prize_pool: 15000, status: "completed" },
];

const INITIAL_REGISTRATIONS: Registration[] = [
  { registration_id: "R001", player_id: "P001", tournament_id: "T001", registration_date: "2026-06-01", status: "confirmed" },
  { registration_id: "R002", player_id: "P002", tournament_id: "T001", registration_date: "2026-06-02", status: "confirmed" },
  { registration_id: "R003", player_id: "P003", tournament_id: "T002", registration_date: "2026-06-05", status: "pending" },
  { registration_id: "R004", player_id: "P004", tournament_id: "T002", registration_date: "2026-06-06", status: "confirmed" },
  { registration_id: "R005", player_id: "P005", tournament_id: "T003", registration_date: "2026-04-20", status: "confirmed" },
  { registration_id: "R006", player_id: "P006", tournament_id: "T003", registration_date: "2026-04-21", status: "cancelled" },
  { registration_id: "R007", player_id: "P007", tournament_id: "T004", registration_date: "2026-07-01", status: "pending" },
  { registration_id: "R008", player_id: "P008", tournament_id: "T001", registration_date: "2026-06-03", status: "confirmed" },
];

const INITIAL_MATCHES: Match[] = [
  { match_id: "M001", tournament_id: "T003", match_date: "2026-05-01", stage: "Quarter-Final", player1_id: "P001", player2_id: "P004", character_used: "Jin Kazama", rounds_won: "3-1", result: "win" },   
  { match_id: "M002", tournament_id: "T003", match_date: "2026-05-02", stage: "Semi-Final", player1_id: "P002", player2_id: "P006", character_used: "Kazuya Mishima", rounds_won: "3-0", result: "win" },  
  { match_id: "M003", tournament_id: "T003", match_date: "2026-05-05", stage: "Grand Final", player1_id: "P001", player2_id: "P002", character_used: "Jin Kazama", rounds_won: "3-2", result: "win" },     
  { match_id: "M004", tournament_id: "T002", match_date: "2026-06-12", stage: "Group Stage", player1_id: "P003", player2_id: "P008", character_used: "Nina Williams", rounds_won: "2-3", result: "loss" }, 
  { match_id: "M005", tournament_id: "T002", match_date: "2026-06-14", stage: "Quarter-Final", player1_id: "P004", player2_id: "P007", character_used: "Hwoarang", rounds_won: "3-1", result: "win" },     
  { match_id: "M006", tournament_id: "T001", match_date: "2026-07-03", stage: "Group Stage", player1_id: "P001", player2_id: "P008", character_used: "Jin Kazama", rounds_won: "0-0", result: "pending" }, 
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { lb_id: "L001", player_id: "P002", position: 1, total_points: 9850, season: "Season 3" },
  { lb_id: "L002", player_id: "P001", position: 2, total_points: 9200, season: "Season 3" },
  { lb_id: "L003", player_id: "P004", position: 3, total_points: 7800, season: "Season 3" },
  { lb_id: "L004", player_id: "P006", position: 4, total_points: 6500, season: "Season 3" },
  { lb_id: "L005", player_id: "P003", position: 5, total_points: 5900, season: "Season 3" },
  { lb_id: "L006", player_id: "P008", position: 6, total_points: 5100, season: "Season 3" },
  { lb_id: "L007", player_id: "P007", position: 7, total_points: 4200, season: "Season 3" },
  { lb_id: "L008", player_id: "P005", position: 8, total_points: 2800, season: "Season 3" },
];
const ranks = ["Beginner", "Warrior", "Fighter", "Combatant", "Brawler", "Marauder", "Juggernaut", "Vanquisher", "Destroyer", "Eliminator", "Garyu", "Shinryu", "Tenryu", "Mighty Ruler", "Revered Ruler", "Divine Ruler", "Eternal Ruler", "Fujin", "Raijin", "Kishin", "Bushin", "Tekken King", "Tekken Emperor", "Tekken God", "Tekken God Supreme", "God of Destruction"];
const countries = ["Japan", "USA", "South Korea", "Russia", "Brazil", "Ireland", "Sweden", "China", "France", "Germany", "Mexico", "UK"];
const characters = ["Jin Kazama", "Kazuya Mishima", "Nina Williams", "Hwoarang", "Kuma", "Sergei Dragunov", "Forest Law", "Paul Phoenix", "King", "Marshall Law", "Yoshimitsu", "Xiaoyu", "Lars Alexandersson"];
const stages = ["Group Stage", "Round of 16", "Quarter-Final", "Semi-Final", "Third Place", "Grand Final"];

function genId(prefix: string, list: { [key: string]: string }[]): string {
  const nums = list.map(item => parseInt(Object.values(item)[0].replace(/\D/g, "")) || 0);
  return `${prefix}${String(Math.max(...nums, 0) + 1).padStart(3, "0")}`;
}
function fmt(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`; }
function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// â”€â”€â”€ Animated Fighting Background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FightingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base photo â€“ two glowing martial arts fighters */}
      <img
        src="https://images.unsplash.com/photo-1777877714074-853a0c2bfc8e?w=1600&h=900&fit=crop&auto=format"
        alt="Jin Kazama vs Kazuya Mishima"
        className="w-full h-full object-cover"
        style={{ opacity: 0.35, filter: "saturate(1.4) contrast(1.1)" }}
      />

      {/* Dark gradient overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #07070e 0%, rgba(7,7,14,0.55) 50%, rgba(7,7,14,0.85) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #07070e 0%, transparent 60%)" }} />

      {/* Scanline texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)"
      }} />

      {/* Jin's red energy orb â€“ left side */}
      <div className="absolute" style={{
        left: "18%", top: "35%", width: 320, height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(230,0,38,0.55) 0%, rgba(230,0,38,0.18) 45%, transparent 72%)",
        animation: "jinPulse 3.2s ease-in-out infinite",
        filter: "blur(2px)",
      }} />

      {/* Kazuya's blue/purple energy orb â€“ right side */}
      <div className="absolute" style={{
        right: "18%", top: "35%", width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(80,0,255,0.6) 0%, rgba(0,100,255,0.2) 45%, transparent 72%)",
        animation: "kazuyaPulse 2.8s ease-in-out infinite",
        filter: "blur(2px)",
      }} />

      {/* Central clash energy burst */}
      <div className="absolute left-1/2 top-1/2" style={{
        transform: "translate(-50%, -50%)",
        width: 180, height: 180,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(0,180,255,0.4) 30%, transparent 70%)",
        animation: "clashBurst 1.8s ease-in-out infinite alternate",
        filter: "blur(6px)",
      }} />

      {/* Diagonal energy beams */}
      <div className="absolute" style={{
        left: "20%", top: "50%", width: "28%", height: 3,
        background: "linear-gradient(to right, transparent, rgba(230,0,38,0.9), rgba(255,255,255,0.8))",
        transform: "rotate(-8deg)",
        animation: "beamFlash 2.1s ease-in-out infinite",
        filter: "blur(1px)",
      }} />
      <div className="absolute" style={{
        right: "20%", top: "52%", width: "28%", height: 3,
        background: "linear-gradient(to left, transparent, rgba(80,0,255,0.9), rgba(255,255,255,0.8))",
        transform: "rotate(-8deg)",
        animation: "beamFlash 2.1s ease-in-out infinite 0.4s",
        filter: "blur(1px)",
      }} />

      {/* Lightning sparks floating up */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${30 + i * 4.5}%`,
          bottom: `${20 + (i % 3) * 12}%`,
          width: i % 3 === 0 ? 4 : 2,
          height: i % 3 === 0 ? 4 : 2,
          background: i % 2 === 0 ? "#ff2244" : "#00b4ff",
          boxShadow: i % 2 === 0 ? "0 0 8px #ff2244" : "0 0 8px #00b4ff",
          animation: `sparkFloat ${1.5 + (i % 4) * 0.4}s ease-in-out infinite ${i * 0.25}s`,
        }} />
      ))}

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(230,0,38,0.7), rgba(0,180,255,0.7), transparent)" }} />

      <style>{`
        @keyframes jinPulse {
          0%, 100% { transform: scale(1) translateX(0); opacity: 0.85; }
          50% { transform: scale(1.12) translateX(-12px); opacity: 1; }
        }
        @keyframes kazuyaPulse {
          0%, 100% { transform: scale(1) translateX(0); opacity: 0.8; }
          50% { transform: scale(1.15) translateX(12px); opacity: 1; }
        }
        @keyframes clashBurst {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
        }
        @keyframes beamFlash {
          0%, 100% { opacity: 0.3; transform: rotate(-8deg) scaleX(0.85); }
          50% { opacity: 1; transform: rotate(-8deg) scaleX(1); }
        }
        @keyframes sparkFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) scale(0.2); opacity: 0; }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(230,0,38,0.6), 0 0 60px rgba(230,0,38,0.2); }
          50% { text-shadow: 0 0 30px rgba(230,0,38,0.9), 0 0 80px rgba(230,0,38,0.4), 0 0 120px rgba(230,0,38,0.15); }
        }
        @keyframes accentGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(0,180,255,0.6), 0 0 60px rgba(0,180,255,0.2); }
          50% { text-shadow: 0 0 30px rgba(0,180,255,0.9), 0 0 80px rgba(0,180,255,0.4); }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(230,0,38,0.4), inset 0 0 0 1px rgba(230,0,38,0.2); }
          50% { box-shadow: 0 0 20px rgba(230,0,38,0.3), 0 0 0 1px rgba(230,0,38,0.7), inset 0 0 0 1px rgba(230,0,38,0.4); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}

// â”€â”€â”€ UI Primitives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function GlowBorder({ children, color = "blue", className = "" }: { children: React.ReactNode; color?: "red" | "blue" | "gold"; className?: string }) {
  const shadows: Record<string, string> = {
    red: "0 0 0 1px rgba(230,0,38,0.35), inset 0 0 0 1px rgba(230,0,38,0.15)",
    gold: "0 0 0 1px rgba(255,180,0,0.4), inset 0 0 0 1px rgba(255,180,0,0.15)",
    blue: "0 0 0 1px rgba(0,180,255,0.2), inset 0 0 0 1px rgba(0,180,255,0.08)",
  };
  return (
    <div className={`relative ${className}`} style={{ boxShadow: shadows[color] }}>
      {children}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    application: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    confirmed: "text-green-400 bg-green-400/10 border-green-400/30",
    rejected: "text-red-400 bg-red-400/10 border-red-400/30",
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
    win: "text-green-400 bg-green-400/10 border-green-400/30",
    loss: "text-red-400 bg-red-400/10 border-red-400/30",
    upcoming: "text-[#00b4ff] bg-[#00b4ff]/10 border-[#00b4ff]/30",
    ongoing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    completed: "text-muted-foreground bg-muted/30 border-border",
  };
  const icon = status === "confirmed" || status === "win" ? <CheckCircle size={10} /> :
    status === "pending" || status === "ongoing" || status === "application" ? <Clock size={10} /> :
    status === "cancelled" || status === "loss" || status === "rejected" ? <XCircle size={10} /> : null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase tracking-wider ${map[status] || "text-muted-foreground bg-muted/30 border-border"}`}>
      {icon}{status}
    </span>
  );
}

function StatCard({ icon, label, value, sub, accent = false }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <GlowBorder color={accent ? "red" : "blue"} className="bg-card rounded-lg p-5 flex items-start gap-4 hover:bg-secondary/50 transition-colors">
      <div className={`p-2.5 rounded-lg ${accent ? "bg-primary/20 text-primary" : "bg-accent/10 text-accent"}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold font-['Orbitron'] text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </GlowBorder>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <GlowBorder color="blue" className="relative bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-['Orbitron'] font-bold text-foreground text-sm tracking-wider uppercase">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </GlowBorder>
    </div>
  );
}

function FInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <input {...props} className="bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors" />
    </div>
  );
}

function FSelect({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <select {...props} className="bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors appearance-none cursor-pointer">
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, type = "button", className = "" }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost" | "accent";
  onClick?: () => void; type?: "button" | "submit"; className?: string;
}) {
  const styles = {
    primary: "bg-primary text-white hover:bg-primary/80 border border-primary/50",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80 border border-border",
    danger: "bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/40",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent",
    accent: "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30",
  };
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-5 w-1 bg-primary rounded-full" />
        <h1 className="font-['Orbitron'] font-bold text-xl text-foreground tracking-wider uppercase">{title}</h1>
      </div>
      {sub && <p className="text-muted-foreground text-sm ml-4">{sub}</p>}
    </div>
  );
}

// â”€â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Footer() {
  return (
    <footer className="border-t border-border mt-16 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
            <Swords size={14} className="text-white" />
          </div>
          <div>
            <p className="font-['Orbitron'] text-xs font-bold text-foreground tracking-widest">ONLINE TEKKEN TOURNAMENTS 2026</p>
            <p className="text-muted-foreground text-[10px] font-mono mt-0.5">Tournament Database System</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="font-['Orbitron'] text-[11px] font-bold tracking-widest uppercase" style={{ color: "#00b4ff" }}>
            MANAGED AND DESIGNED BY
          </p>
          <p className="font-['Rajdhani'] font-bold text-lg text-foreground leading-tight">
            MOIN SHAH{" "}
            <span className="font-['Orbitron'] text-xs font-normal" style={{ color: "#e60026" }}>Esports.Co</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// â”€â”€â”€ Nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Gamepad2 size={16} /> },
  { id: "players", label: "Players", icon: <Users size={16} /> },
  { id: "tournaments", label: "Tournaments", icon: <Trophy size={16} /> },
  { id: "registrations", label: "Registrations", icon: <List size={16} /> },
  { id: "matches", label: "Matches", icon: <Swords size={16} /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Award size={16} /> },
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
];

function Nav({ page, setPage, user, onLogout }: { page: Page; setPage: (p: Page) => void; user: User | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-4 md:px-8 border-b border-border bg-card/95 backdrop-blur-md">
        <button onClick={() => setPage("home")} className="flex items-center gap-2.5 mr-8 shrink-0 group">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center" style={{ boxShadow: "0 0 12px rgba(230,0,38,0.5)" }}>
            <Swords size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-['Orbitron'] text-[9px] font-black text-foreground tracking-widest leading-none">ONLINE TEKKEN</p>
            <p className="font-['Orbitron'] text-[9px] font-bold tracking-widest leading-none" style={{ color: "#e60026" }}>TOURNAMENTS 2026</p>
          </div>
        </button>
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                page === item.id ? "text-accent bg-accent/10 border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-[9px] font-mono text-muted-foreground leading-none">SIGNED IN AS</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border leading-none uppercase select-none ${
                  user.role === 'admin' ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-slate-400 bg-slate-400/10 border-slate-400/20'
                }`}>
                  {user.role}
                </span>
                <p className="text-xs font-bold text-accent font-['Orbitron'] tracking-wider leading-none uppercase">{user.email.split('@')[0]}</p>
              </div>
            </div>
          )}
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all">
            <LogIn size={14} className="rotate-180" /> Logout
          </button>
          <button className="lg:hidden text-muted-foreground hover:text-foreground p-2" onClick={() => setOpen(!open)}>
            <Menu size={20} />
          </button>
        </div>
      </nav>
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-card border-l border-border p-4 flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setPage(item.id); setOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${
                  page === item.id ? "text-accent bg-accent/10 border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                {item.icon}{item.label}
              </button>
            ))}
            <button onClick={() => { onLogout(); setOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-400/10 mt-auto">
              <LogIn size={16} className="rotate-180" /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// â”€â”€â”€ Home Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function HomePage({ players, tournaments, matches, setPage, isAdmin }: {
  players: Player[]; tournaments: Tournament[]; matches: Match[]; setPage: (p: Page) => void; isAdmin?: boolean;
}) {
  const latest = tournaments.slice().reverse().slice(0, 3);
  const featured = players.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero with live fight animation */}
      <div className="relative overflow-hidden min-h-[92vh] flex items-center">
        <FightingBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 md:py-36 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border" style={{
            background: "rgba(230,0,38,0.1)",
            borderColor: "rgba(230,0,38,0.35)",
            animation: "borderPulse 3s ease-in-out infinite",
          }}>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-mono font-semibold tracking-wider uppercase">Season 3 â€” 2026 Active</span>
          </div>

          {/* Main title */}
          <h1 className="font-['Orbitron'] text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-4 tracking-tight">
            <span className="block text-foreground">ONLINE</span>
            <span className="block" style={{
              color: "#e60026",
              animation: "titleGlow 2.5s ease-in-out infinite",
            }}>TEKKEN</span>
            <span className="block text-foreground">TOURNAMENTS</span>
            <span className="block" style={{
              color: "#00b4ff",
              animation: "accentGlow 2.5s ease-in-out infinite 0.8s",
            }}>2026</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-xl mt-6 mb-10 leading-relaxed font-['Rajdhani'] text-lg">
            Manage players, tournaments, matches, rankings, and tournament statistics in one platform. The definitive Tekken 8 competitive hub.
          </p>

          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <>
                <button onClick={() => setPage("tournaments")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-white font-bold font-['Rajdhani'] text-base transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #e60026, #a0001a)",
                    boxShadow: "0 0 25px rgba(230,0,38,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                    border: "1px solid rgba(230,0,38,0.6)",
                  }}>
                  <Trophy size={18} /> Start Tournament
                </button>
                <button onClick={() => setPage("players")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-bold font-['Rajdhani'] text-base transition-all hover:scale-105"
                  style={{
                    background: "rgba(0,180,255,0.1)",
                    boxShadow: "0 0 20px rgba(0,180,255,0.2)",
                    border: "1px solid rgba(0,180,255,0.4)",
                    color: "#00b4ff",
                  }}>
                  <Users size={18} /> Register Player
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setPage("tournaments")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-white font-bold font-['Rajdhani'] text-base transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #00b4ff, #0c4a9a)",
                    boxShadow: "0 0 25px rgba(0,180,255,0.3)",
                    border: "1px solid rgba(0,180,255,0.5)",
                  }}>
                  <List size={18} /> View Tournaments
                </button>
                <button onClick={() => setPage("matches")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-bold font-['Rajdhani'] text-base transition-all hover:scale-105"
                  style={{
                    background: "rgba(230,0,38,0.1)",
                    boxShadow: "0 0 20px rgba(230,0,38,0.2)",
                    border: "1px solid rgba(230,0,38,0.4)",
                    color: "#e60026",
                  }}>
                  <Gamepad2 size={18} /> View Matches
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stat strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/70 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Players", value: players.length, icon: <Users size={14} /> },
              { label: "Tournaments", value: tournaments.length, icon: <Trophy size={14} /> },
              { label: "Matches Played", value: matches.filter(m => m.result !== "pending").length, icon: <Swords size={14} /> },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-accent">{s.icon}</span>
                <div>
                  <p className="font-['Orbitron'] font-bold text-foreground text-lg leading-none">{s.value}</p>
                  <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Tournaments */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 bg-primary rounded-full" />
            <h2 className="font-['Orbitron'] font-bold text-lg tracking-wider uppercase">Latest Tournaments</h2>
          </div>
          <button onClick={() => setPage("tournaments")} className="text-accent text-xs font-mono hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latest.map(t => (
            <GlowBorder key={t.tournament_id} color={t.status === "ongoing" ? "red" : "blue"} className="bg-card rounded-xl overflow-hidden hover:bg-secondary/30 transition-all group cursor-pointer">
              <div className={`h-1.5 ${t.status === "ongoing" ? "bg-primary" : t.status === "upcoming" ? "bg-accent" : "bg-muted"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-['Rajdhani'] font-bold text-foreground text-base leading-tight group-hover:text-accent transition-colors">{t.tournament_name}</h3>
                  <Badge status={t.status} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Calendar size={11} /> {t.start_date} â†’ {t.end_date}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Trophy size={11} className="text-yellow-400" />
                    <span className="font-['Orbitron'] font-bold text-yellow-400">{formatCurrency(t.prize_pool)}</span>
                    <span className="text-muted-foreground">prize pool</span>
                  </div>
                </div>
              </div>
            </GlowBorder>
          ))}
        </div>
      </div>

      {/* Featured Players */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 bg-accent rounded-full" />
            <h2 className="font-['Orbitron'] font-bold text-lg tracking-wider uppercase">Featured Players</h2>
          </div>
          <button onClick={() => setPage("players")} className="text-accent text-xs font-mono hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p, i) => (
            <GlowBorder key={p.player_id} color={i === 0 ? "gold" : "blue"} className="bg-card rounded-xl p-5 text-center hover:bg-secondary/30 transition-all group cursor-pointer">
              <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold font-['Orbitron'] ${
                i === 0 ? "bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400/40" : "bg-accent/10 text-accent border-2 border-accent/20"
              }`} style={{ animation: i === 0 ? "floatUp 3s ease-in-out infinite" : undefined }}>
                {p.username.charAt(0)}
              </div>
              <p className="font-['Rajdhani'] font-bold text-foreground text-sm group-hover:text-accent transition-colors truncate">{p.username}</p>
              <p className="text-muted-foreground text-[10px] font-mono mt-0.5">{p.country}</p>
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{p.rank1}</span>
              </div>
            </GlowBorder>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Players Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PlayersPage({ players, setPlayers, isAdmin, currentUserId }: { players: Player[]; setPlayers: (p: Player[]) => void; isAdmin?: boolean; currentUserId?: number }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState<Partial<Player>>({});
  const userPlayer = currentUserId ? players.find(p => p.user_id === currentUserId) : undefined;

  const filtered = useMemo(() =>
    players.filter(p =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      (p.rank1 || "").toLowerCase().includes(search.toLowerCase())
    ), [players, search]);

  function openAdd() { setForm({ country: "Japan", rank: "Warrior" }); setModal("add"); }
  function openEdit(p: Player) { setEditing(p); setForm({ ...p }); setModal("edit"); }
  function closeModal() { setModal(null); setEditing(null); setForm({}); }
  function save() {
    if (!form.username || !form.email) return;
    const playerToSave = {
      ...form,
      rank1: form.rank || "Beginner",
      player_id: modal === "add" ? genId("P", players as any) : editing?.player_id,
      user_id: !isAdmin ? currentUserId : form.user_id,
    } as Player;

    const method = modal === "add" ? "POST" : "PUT";
    const url = modal === "add"
      ? (!isAdmin ? API_URL + "/players/self" : API_URL + "/players")
      : API_URL + "/players/" + editing?.player_id;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerToSave)
    }).then(async res => {
      const text = await res.text();
      const data = text ? (() => {
        try { return JSON.parse(text); } catch { return { error: text }; }
      })() : {};
      if (!res.ok) throw new Error(data.error || text || `Request failed with status ${res.status}`);
      return data;
    }).then(data => {
      if(data.error) throw new Error(data.error);
      if(modal === "add") setPlayers([...players, playerToSave]);
      else setPlayers(players.map(p => p.player_id === editing?.player_id ? playerToSave : p));
      closeModal();
    }).catch(err => alert("Connection failed: " + err.message));
  }
  function del(id: string) {
    if(!window.confirm("Delete player?")) return;
    fetch(API_URL + "/players/" + id, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if(data.error) alert("Error: " + data.error);
        else setPlayers(players.filter(p => p.player_id !== id));
      }).catch(err => alert("Error: " + err));
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <SectionHeader title="Players" sub="Manage registered Tekken 8 competitors" />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username, country, rankâ€¦"
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors" />
        </div>
        {(isAdmin || (!isAdmin && !userPlayer && currentUserId)) && <Btn variant="primary" onClick={openAdd}><Plus size={16} /> {isAdmin ? "Add Player" : "Create My Player"}</Btn>}
      </div>
      <GlowBorder className="bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Player ID", "Username", "Email", "Country", "Rank", ...(isAdmin ? ["Actions"] : [])].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.player_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 ? "bg-secondary/20" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.player_id}</td>
                  <td className="px-4 py-3 font-['Rajdhani'] font-bold text-foreground text-sm">{p.username}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <span className="flex items-center gap-1.5"><Globe size={12} className="text-muted-foreground" />{p.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{p.rank1}</span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Btn variant="ghost" onClick={() => openEdit(p)} className="!px-2 !py-1 text-xs"><Edit2 size={12} /></Btn>
                        <Btn variant="danger" onClick={() => del(p.player_id)} className="!px-2 !py-1 text-xs"><Trash2 size={12} /></Btn>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-muted-foreground text-sm">No players found</td></tr>}
            </tbody>
          </table>
        </div>
      </GlowBorder>
      {modal && (
        <Modal title={modal === "add" ? "Add Player" : "Edit Player"} onClose={closeModal}>
          <div className="space-y-4">
            <FInput label="Username" value={form.username || ""} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. IronFist_Jin" />
            <FInput label="Email" type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="player@tekken.gg" />
            <FSelect label="Country" value={form.country || ""} onChange={e => setForm({ ...form, country: e.target.value })}>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </FSelect>
            <FSelect label="Rank" value={form.rank || ""} onChange={e => setForm({ ...form, rank: e.target.value })}>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </FSelect>
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" onClick={save} className="flex-1">{modal === "add" ? "Add Player" : "Save Changes"}</Btn>
              <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// â”€â”€â”€ Tournaments Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TournamentsPage({ tournaments, setTournaments, isAdmin }: { tournaments: Tournament[]; setTournaments: (t: Tournament[]) => void; isAdmin?: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");
  const [modal, setModal] = useState<null | "add" | "edit" | "view">(null);
  const [active, setActive] = useState<Tournament | null>(null);
  const [form, setForm] = useState<Partial<Tournament>>({});

  const filtered = useMemo(() =>
    tournaments.filter(t =>
      (filter === "all" || t.status === filter) &&
      t.tournament_name.toLowerCase().includes(search.toLowerCase())
    ), [tournaments, search, filter]);

  function openAdd() { setForm({ status: "upcoming" }); setModal("add"); }
  function openEdit(t: Tournament) { setActive(t); setForm({ ...t }); setModal("edit"); }
  function openView(t: Tournament) { setActive(t); setModal("view"); }
  function closeModal() { setModal(null); setActive(null); setForm({}); }
  function save() {
    if (!form.tournament_name) return;
    if (modal === "add") {
      const newT = { ...form, tournament_id: genId("T", tournaments as any) } as Tournament;
      fetch(API_URL + "/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newT)
      }).then(() => {
        setTournaments([...tournaments, newT]);
        closeModal();
      }).catch(err => alert("Error: " + err));
    } else if (active) {
      fetch(API_URL + "/tournaments/" + active.tournament_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      }).then(() => {
        setTournaments(tournaments.map(t => t.tournament_id === active.tournament_id ? { ...t, ...form } as Tournament : t));
        closeModal();
      }).catch(err => alert("Error: " + err));
    }
  }
  function del(id: string) {
    if(window.confirm("Delete tournament?")) {
      fetch(API_URL + "/tournaments/" + id, { method: "DELETE" })
        .then(() => setTournaments(tournaments.filter(t => t.tournament_id !== id)))
        .catch(err => alert("Error: " + err));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <SectionHeader title="Tournaments" sub="Create and manage Tekken 8 competitive events" />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tournamentsâ€¦"
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors" />
        </div>
        <div className="flex gap-1 bg-muted/30 border border-border rounded-lg p-1">
          {(["all", "upcoming", "ongoing", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wide transition-all ${filter === f ? "bg-accent/20 text-accent border border-accent/30" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
        {isAdmin && <Btn variant="primary" onClick={openAdd}><Plus size={16} /> Create</Btn>}
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(t => (
          <GlowBorder key={t.tournament_id} color={t.status === "ongoing" ? "red" : "blue"} className="bg-card rounded-xl overflow-hidden group">
            <div className={`h-1 ${t.status === "ongoing" ? "bg-primary" : t.status === "upcoming" ? "bg-accent" : "bg-muted-foreground/30"}`} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] text-muted-foreground">{t.tournament_id}</span>
                <Badge status={t.status} />
              </div>
              <h3 className="font-['Rajdhani'] font-bold text-foreground text-base mb-4 group-hover:text-accent transition-colors">{t.tournament_name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar size={11} className="shrink-0" /><span className="font-mono">{t.start_date} â€” {t.end_date}</span></div>
                <div className="flex items-center gap-2 text-xs"><Trophy size={11} className="text-yellow-400 shrink-0" /><span className="font-['Orbitron'] font-bold text-yellow-400 text-sm">{formatCurrency(t.prize_pool)}</span></div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                <Btn variant="ghost" onClick={() => openView(t)} className="!px-2 !py-1 text-xs flex-1 justify-center"><Eye size={12} /> View</Btn>
                {isAdmin && (
                  <>
                    <Btn variant="ghost" onClick={() => openEdit(t)} className="!px-2 !py-1 text-xs"><Edit2 size={12} /></Btn>
                    <Btn variant="danger" onClick={() => del(t.tournament_id)} className="!px-2 !py-1 text-xs"><Trash2 size={12} /></Btn>
                  </>
                )}
              </div>
            </div>
          </GlowBorder>
        ))}
      </div>
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Create Tournament" : "Update Tournament"} onClose={closeModal}>
          <div className="space-y-4">
            <FInput label="Tournament Name" value={form.tournament_name || ""} onChange={e => setForm({ ...form, tournament_name: e.target.value })} placeholder="e.g. Iron Fist Championship" />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Start Date" type="date" value={form.start_date || ""} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              <FInput label="End Date" type="date" value={form.end_date || ""} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <FInput label="Prize Pool ($)" type="number" value={form.prize_pool || ""} onChange={e => setForm({ ...form, prize_pool: Number(e.target.value) })} placeholder="50000" />
            <FSelect label="Status" value={form.status || ""} onChange={e => setForm({ ...form, status: e.target.value as any })}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </FSelect>
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" onClick={save} className="flex-1">{modal === "add" ? "Create Tournament" : "Save Changes"}</Btn>
              <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
      {modal === "view" && active && (
        <Modal title="Tournament Details" onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[{ l: "Tournament ID", v: active.tournament_id }, { l: "Status", v: <Badge status={active.status} /> }, { l: "Start Date", v: active.start_date }, { l: "End Date", v: active.end_date }].map(item => (
                <div key={item.l}><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{item.l}</p><p className="text-sm text-foreground">{item.v}</p></div>
              ))}
            </div>
            <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Prize Pool</p><p className="font-['Orbitron'] font-bold text-yellow-400 text-xl">{formatCurrency(active.prize_pool)}</p></div>
            <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Tournament Name</p><p className="font-['Rajdhani'] font-bold text-foreground text-base">{active.tournament_name}</p></div>
            <Btn variant="secondary" onClick={closeModal} className="w-full justify-center">Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// â”€â”€â”€ Registrations Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function RegistrationsPage({ registrations, setRegistrations, players, setPlayers, tournaments, isAdmin, currentUserId, currentUserEmail }: {
  registrations: Registration[]; setRegistrations: (r: Registration[]) => void;
  players: Player[]; setPlayers: (p: Player[]) => void; tournaments: Tournament[]; isAdmin?: boolean; currentUserId?: number; currentUserEmail?: string;
}) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Registration>>({ status: "application" });
  const currentPlayerId = currentUserId ? players.find(p => p.user_id === currentUserId)?.player_id : undefined;
  const playerName = (id: string) => players.find(p => p.player_id === id)?.username || id;
  const tournamentName = (id: string) => tournaments.find(t => t.tournament_id === id)?.tournament_name || id;

  async function save() {
    if (!form.tournament_id) return;
    const playerId = form.player_id || currentPlayerId;
    if (!playerId) {
      alert("Please select a player before applying.");
      return;
    }

    try {
      const newR = { ...form, player_id: playerId, registration_id: genId("R", registrations as any), registration_date: new Date().toISOString().split("T")[0], status: "application" } as Registration;
      const url = API_URL + "/registrations";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newR)
      });
      const text = await res.text();
      const data = text ? (() => {
        try { return JSON.parse(text); } catch { return { error: text }; }
      })() : {};
      if (!res.ok) throw new Error(data.error || text || `Request failed with status ${res.status}`);
      if (data.error) throw new Error(data.error);
      setRegistrations([...registrations, newR]);
      setModal(false);
      setForm({ status: "application" });
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }
  
  function updateStatus(id: string, newStatus: string) {
    fetch(API_URL + "/application-status/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    }).then(() => {
      setRegistrations(registrations.map(r => r.registration_id === id ? { ...r, status: newStatus as any } : r));
    }).catch(err => alert("Error: " + err));
  }
  
  function del(id: string) {
    if(window.confirm("Remove registration?")) {
      fetch(API_URL + "/registrations/" + id, { method: "DELETE" })
        .then(() => setRegistrations(registrations.filter(r => r.registration_id !== id)))
        .catch(err => alert("Error: " + err));
    }
  }

  const applicationRegs = registrations.filter(r => r.status === "application" || r.status === "pending");
  const confirmedRegs = registrations.filter(r => r.status === "confirmed");

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <SectionHeader title="Tournament Registrations" sub="Manage player tournament applications and enrollment" />
      
      {isAdmin && (
        <>
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-1 bg-yellow-400 rounded-full" />
                <h3 className="font-['Orbitron'] font-bold text-lg tracking-wider uppercase">Pending Applications</h3>
                <span className="text-xs font-mono bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/30">{applicationRegs.length}</span>
              </div>
            </div>
            <GlowBorder className="bg-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Reg ID", "Player", "Tournament", "Applied", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicationRegs.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No pending applications</td></tr>
                    ) : (
                      applicationRegs.map((r, i) => (
                        <tr key={r.registration_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 ? "bg-secondary/20" : ""}`}>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.registration_id}</td>
                          <td className="px-4 py-3 font-['Rajdhani'] font-bold text-foreground text-sm">{playerName(r.player_id)}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px] truncate">{tournamentName(r.tournament_id)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.registration_date}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Btn variant="primary" onClick={() => updateStatus(r.registration_id, "confirmed")} className="!px-2 !py-1 text-xs"><CheckCircle size={12} /> Approve</Btn>
                              <Btn variant="danger" onClick={() => updateStatus(r.registration_id, "rejected")} className="!px-2 !py-1 text-xs"><XCircle size={12} /> Reject</Btn>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlowBorder>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-1 bg-green-400 rounded-full" />
                <h3 className="font-['Orbitron'] font-bold text-lg tracking-wider uppercase">Confirmed Registrations</h3>
                <span className="text-xs font-mono bg-green-400/20 text-green-400 px-2 py-0.5 rounded border border-green-400/30">{confirmedRegs.length}</span>
              </div>
              <Btn variant="primary" onClick={() => setModal(true)}><Plus size={16} /> Register Player</Btn>
            </div>
            <GlowBorder className="bg-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Reg ID", "Player", "Tournament", "Date", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedRegs.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No confirmed registrations</td></tr>
                    ) : (
                      confirmedRegs.map((r, i) => (
                        <tr key={r.registration_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 ? "bg-secondary/20" : ""}`}>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.registration_id}</td>
                          <td className="px-4 py-3 font-['Rajdhani'] font-bold text-foreground text-sm">{playerName(r.player_id)}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px] truncate">{tournamentName(r.tournament_id)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.registration_date}</td>
                          <td className="px-4 py-3"><Badge status="confirmed" /></td>
                          <td className="px-4 py-3">
                            <Btn variant="danger" onClick={() => del(r.registration_id)} className="!px-2 !py-1 text-xs"><Trash2 size={12} /></Btn>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlowBorder>
          </div>
        </>
      )}

      {!isAdmin && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-1 bg-accent rounded-full" />
              <h3 className="font-['Orbitron'] font-bold text-lg tracking-wider uppercase">Available Tournaments</h3>
            </div>
            <Btn variant="primary" onClick={() => setModal(true)}><Plus size={16} /> Apply for Tournament</Btn>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {tournaments.filter(t => t.status !== "completed").map(t => {
              const userApp = currentPlayerId ? registrations.find(r => r.player_id === currentPlayerId && r.tournament_id === t.tournament_id) : undefined;
              return (
                <GlowBorder key={t.tournament_id} color="blue" className="bg-card rounded-xl p-4 flex flex-col">
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-['Rajdhani'] font-bold text-foreground text-sm flex-1">{t.tournament_name}</h3>
                      <Badge status={t.status} />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{t.start_date} → {t.end_date}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-4 mt-auto">
                    <Trophy size={12} className="text-yellow-400" />
                    <span className="font-['Orbitron'] font-bold text-yellow-400 text-xs">{formatCurrency(t.prize_pool)}</span>
                  </div>
                      {userApp ? (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge status={userApp.status} />
                      <span className="text-muted-foreground font-mono">Applied</span>
                    </div>
                  ) : (
                    <Btn variant="primary" onClick={() => { setForm({ tournament_id: t.tournament_id, status: "application" }); setModal(true); }} className="text-xs w-full justify-center">
                      <Plus size={12} /> Apply Now
                    </Btn>
                  )}
                </GlowBorder>
              );
            })}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-1 bg-accent rounded-full" />
              <h3 className="font-['Orbitron'] font-bold text-lg tracking-wider uppercase">My Applications</h3>
            </div>
            <GlowBorder className="bg-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Tournament", "Applied", "Status"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(!currentPlayerId || registrations.filter(r => r.player_id === currentPlayerId).length === 0) ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">No applications yet</td></tr>
                    ) : (
                      registrations.filter(r => r.player_id === currentPlayerId).map((r, i) => (
                        <tr key={r.registration_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 ? "bg-secondary/20" : ""}`}>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{tournamentName(r.tournament_id)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.registration_date}</td>
                          <td className="px-4 py-3"><Badge status={r.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlowBorder>
          </div>
        </div>
      )}

      {modal && (
        <Modal title={isAdmin ? "Register Player" : "Apply for Tournament"} onClose={() => { setModal(false); setForm({}); }}>
          <div className="space-y-4">
            <FSelect label="Player" value={form.player_id || currentPlayerId || ""} onChange={e => setForm({ ...form, player_id: e.target.value })}>
              <option value="">Select player…</option>
              {players
                .filter(p => isAdmin || (currentUserId ? p.user_id === currentUserId : false))
                .map(p => <option key={p.player_id} value={p.player_id}>{p.username}</option>)}
            </FSelect>
            <FSelect label="Tournament" value={form.tournament_id || ""} onChange={e => setForm({ ...form, tournament_id: e.target.value })}>
              <option value="">Select tournament…</option>
              {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.tournament_name}</option>)}
            </FSelect>
            {isAdmin && (
              <FSelect label="Status" value={form.status || "application"} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="application">Application</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </FSelect>
            )}
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" onClick={save} className="flex-1">{isAdmin ? "Register" : "Submit Application"}</Btn>
              <Btn variant="secondary" onClick={() => { setModal(false); setForm({}); }}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// â”€â”€â”€ Matches Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MatchesPage({ matches, setMatches, players, tournaments, isAdmin }: {
  matches: Match[]; setMatches: (m: Match[]) => void;
  players: Player[]; tournaments: Tournament[]; isAdmin?: boolean;
}) {
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [active, setActive] = useState<Match | null>(null);
  const [form, setForm] = useState<Partial<Match>>({ result: "pending" });
  const playerName = (id: string) => players.find(p => p.player_id === id)?.username || id;
  const tournamentName = (id: string) => tournaments.find(t => t.tournament_id === id)?.tournament_name || id;
  function openEdit(m: Match) { setActive(m); setForm({ ...m }); setModal("edit"); }
  function closeModal() { setModal(null); setActive(null); setForm({ result: "pending" }); }
  function save() {
    if (!form.tournament_id || !form.match_date) return;
    if (modal === "add") {
      const newM = { ...form, match_id: genId("M", matches as any) } as Match;
      fetch(API_URL + "/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newM)
      }).then(() => {
        setMatches([...matches, newM]);
        closeModal();
      }).catch(err => alert("Error: " + err));
    } else if (active) {
      fetch(API_URL + "/matches/" + active.match_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      }).then(() => {
        setMatches(matches.map(m => m.match_id === active.match_id ? { ...m, ...form } as Match : m));
        closeModal();
      }).catch(err => alert("Error: " + err));
    }
  }
  function del(id: string) {
    if(window.confirm("Delete match?")) {
      fetch(API_URL + "/matches/" + id, { method: "DELETE" })
        .then(() => setMatches(matches.filter(m => m.match_id !== id)))
        .catch(err => alert("Error: " + err));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <SectionHeader title="Matches" sub="Schedule and manage competitive match results" />
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <Btn variant="primary" onClick={() => setModal("add")}><Plus size={16} /> Schedule Match</Btn>
        </div>
      )}
      <GlowBorder className="bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Match ID", "Tournament", "Date", "Stage", "Players", "Character", "Score", "Result", ...(isAdmin ? ["Actions"] : [])].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={m.match_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 ? "bg-secondary/20" : ""}`}>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{m.match_id}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{tournamentName(m.tournament_id)}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{m.match_date}</td>
                  <td className="px-3 py-3 text-xs text-accent font-semibold whitespace-nowrap">{m.stage}</td>
                  <td className="px-3 py-3 text-xs text-foreground whitespace-nowrap">
                    {playerName(m.player1_id)} <span className="text-muted-foreground mx-1">vs</span> {playerName(m.player2_id)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{m.character_used}</td>
                  <td className="px-3 py-3 font-mono text-xs font-bold text-foreground">{m.rounds_won}</td>
                  <td className="px-3 py-3"><Badge status={m.result} /></td>
                  {isAdmin && (
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <Btn variant="ghost" onClick={() => openEdit(m)} className="!px-2 !py-1 text-xs"><Edit2 size={12} /></Btn>
                        <Btn variant="danger" onClick={() => del(m.match_id)} className="!px-2 !py-1 text-xs"><Trash2 size={12} /></Btn>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowBorder>
      {modal && (
        <Modal title={modal === "add" ? "Schedule Match" : "Update Match Result"} onClose={closeModal}>
          <div className="space-y-4">
            <FSelect label="Tournament" value={form.tournament_id || ""} onChange={e => setForm({ ...form, tournament_id: e.target.value })}>
              <option value="">Select tournamentâ€¦</option>
              {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.tournament_name}</option>)}
            </FSelect>
            <FInput label="Match Date" type="date" value={form.match_date || ""} onChange={e => setForm({ ...form, match_date: e.target.value })} />
            <FSelect label="Stage" value={form.stage || ""} onChange={e => setForm({ ...form, stage: e.target.value })}>
              <option value="">Select stageâ€¦</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </FSelect>
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Player 1" value={form.player1_id || ""} onChange={e => setForm({ ...form, player1_id: e.target.value })}>
                <option value="">Selectâ€¦</option>
                {players.map(p => <option key={p.player_id} value={p.player_id}>{p.username}</option>)}
              </FSelect>
              <FSelect label="Player 2" value={form.player2_id || ""} onChange={e => setForm({ ...form, player2_id: e.target.value })}>
                <option value="">Selectâ€¦</option>
                {players.map(p => <option key={p.player_id} value={p.player_id}>{p.username}</option>)}
              </FSelect>
            </div>
            <FSelect label="Character Used" value={form.character_used || ""} onChange={e => setForm({ ...form, character_used: e.target.value })}>
              <option value="">Select characterâ€¦</option>
              {characters.map(c => <option key={c} value={c}>{c}</option>)}
            </FSelect>
            <FInput label="Rounds Won (e.g. 3-1)" value={form.rounds_won || ""} onChange={e => setForm({ ...form, rounds_won: e.target.value })} placeholder="3-1" />
            <FSelect label="Result" value={form.result || "pending"} onChange={e => setForm({ ...form, result: e.target.value as any })}>
              <option value="pending">Pending</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
            </FSelect>
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" onClick={save} className="flex-1">{modal === "add" ? "Schedule" : "Update Result"}</Btn>
              <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// â”€â”€â”€ Leaderboard Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LeaderboardPage({ leaderboard, players }: { leaderboard: LeaderboardEntry[]; players: Player[] }) {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("2026");
  const playerName = (id: string) => players.find(p => p.player_id === id)?.username || id;
  const playerRank = (id: string) => players.find(p => p.player_id === id)?.rank || "";
  const playerCountry = (id: string) => players.find(p => p.player_id === id)?.country || "";
  const filtered = useMemo(() =>
    leaderboard.filter(e => e.season === season && playerName(e.player_id).toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.position - b.position),
    [leaderboard, season, search]);
  const podium = filtered.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <SectionHeader title="Leaderboard" sub="Global rankings and season standings" />
      {podium.length === 3 && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[podium[1], podium[0], podium[2]].map((e, idx) => {
            const pos = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const c = pos === 1 ? "text-yellow-400 border-yellow-400/50 bg-yellow-400/10" : pos === 2 ? "text-gray-300 border-gray-300/50 bg-gray-300/10" : "text-amber-600 border-amber-600/50 bg-amber-600/10";
            return (
              <GlowBorder key={e.lb_id} color={pos === 1 ? "gold" : "blue"} className={`bg-card rounded-xl p-5 text-center ${pos === 1 ? "relative -mt-4 shadow-lg shadow-yellow-400/10" : ""}`}>
                {pos === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center"><Star size={14} /></div>}
                <div className={`w-12 h-12 rounded-full border-2 mx-auto mb-3 flex items-center justify-center font-['Orbitron'] font-bold text-lg ${c}`}>#{pos}</div>
                <p className="font-['Rajdhani'] font-bold text-foreground text-sm">{playerName(e.player_id)}</p>
                <p className="text-muted-foreground text-[10px] font-mono mt-0.5">{playerCountry(e.player_id)}</p>
                <p className="font-['Orbitron'] font-bold text-foreground text-xl mt-2">{e.total_points.toLocaleString()}</p>
                <p className="text-muted-foreground text-[10px] font-mono">pts</p>
              </GlowBorder>
            );
          })}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search playersâ€¦"
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors" />
        </div>
        <FSelect label="" value={season} onChange={e => setSeason(e.target.value)}>
          <option value="2026">Season 2026</option>\n          <option value="2026">Season 2026</option><option value="Season 3">Season 3</option>
          <option value="Season 2">Season 2</option>
          <option value="Season 1">Season 1</option>
        </FSelect>
      </div>
      <GlowBorder className="bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Pos", "Player", "Country", "Rank", "Points", "Season"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.lb_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 ? "bg-secondary/20" : ""} ${e.position <= 3 ? "border-l-2 border-l-yellow-400/30" : ""}`}>
                  <td className="px-4 py-3"><span className={`font-['Orbitron'] font-bold text-sm ${e.position === 1 ? "text-yellow-400" : e.position === 2 ? "text-gray-300" : e.position === 3 ? "text-amber-600" : "text-muted-foreground"}`}>#{e.position}</span></td>
                  <td className="px-4 py-3 font-['Rajdhani'] font-bold text-foreground">{playerName(e.player_id)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><Globe size={11} />{playerCountry(e.player_id)}</span></td>
                  <td className="px-4 py-3"><span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{playerRank(e.player_id)}</span></td>
                  <td className="px-4 py-3 font-['Orbitron'] font-bold text-foreground">{e.total_points.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.season}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowBorder>
    </div>
  );
}

// â”€â”€â”€ Dashboard Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DashboardPage({ players, tournaments, matches, registrations, leaderboard }: {
  players: Player[]; tournaments: Tournament[]; matches: Match[]; registrations: Registration[]; leaderboard: LeaderboardEntry[];
}) {
  const playerPoints = leaderboard.slice(0, 6).map(e => ({
    name: players.find(p => p.player_id === e.player_id)?.username.split("_")[0] || e.player_id,
    points: e.total_points,
  }));
  const matchPerf = [
    { subject: "Wins", A: matches.filter(m => m.result === "win").length },
    { subject: "Losses", A: matches.filter(m => m.result === "loss").length },
    { subject: "Pending", A: matches.filter(m => m.result === "pending").length },
    { subject: "Finals", A: matches.filter(m => m.stage === "Grand Final").length },
    { subject: "QF", A: matches.filter(m => m.stage === "Quarter-Final").length },
    { subject: "SF", A: matches.filter(m => m.stage === "Semi-Final").length },
  ];
  const TT = { backgroundColor: "#0e0e1a", border: "1px solid rgba(0,180,255,0.2)", borderRadius: "6px", color: "#e8eaf0", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <SectionHeader title="Dashboard" sub="Tournament system analytics and statistics" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<Users size={18} />} label="Total Players" value={players.length} sub="registered" accent />
        <StatCard icon={<Trophy size={18} />} label="Tournaments" value={tournaments.length} sub="all time" />
        <StatCard icon={<Swords size={18} />} label="Total Matches" value={matches.length} sub={`${matches.filter(m => m.result !== "pending").length} completed`} />
        <StatCard icon={<Layers size={18} />} label="Registrations" value={registrations.length} sub={`${registrations.filter(r => r.status === "confirmed").length} confirmed`} accent />
      </div>
      <div className="grid lg:grid-cols-1 gap-6 mb-6">
        <GlowBorder className="bg-card rounded-xl p-5">
          <h3 className="font-['Orbitron'] font-bold text-sm text-foreground uppercase tracking-wider mb-4">Player Rankings â€” Season 3</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={playerPoints} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#7a7a9a", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#7a7a9a", fontSize: 9, fontFamily: "JetBrains Mono" }} width={70} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="points" fill="#00b4ff" radius={[0, 4, 4, 0]} name="Points" />
            </BarChart>
          </ResponsiveContainer>
        </GlowBorder>
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GlowBorder className="bg-card rounded-xl p-5">
          <h3 className="font-['Orbitron'] font-bold text-sm text-foreground uppercase tracking-wider mb-4">Match Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={matchPerf}>
              <PolarGrid stroke="rgba(0,180,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#7a7a9a", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <PolarRadiusAxis tick={{ fill: "#7a7a9a", fontSize: 8 }} />
              <Radar name="Count" dataKey="A" stroke="#00b4ff" fill="#00b4ff" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowBorder>
        <GlowBorder className="bg-card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-['Orbitron'] font-bold text-sm text-foreground uppercase tracking-wider mb-4">Recent Activity</h3>
          <div className="space-y-3 overflow-y-auto max-h-[200px] pr-1">
            {[...matches].reverse().slice(0, 6).map(m => (
              <div key={m.match_id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className={`w-1.5 h-8 rounded-full ${m.result === "win" ? "bg-green-400" : m.result === "loss" ? "bg-primary" : "bg-yellow-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground font-['Rajdhani'] truncate">{m.stage} â€” {m.character_used}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{m.match_date} Â· Score: {m.rounds_won}</p>
                </div>
                <Badge status={m.result} />
              </div>
            ))}
          </div>
        </GlowBorder>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {(["upcoming", "ongoing", "completed"] as const).map(s => {
          const count = tournaments.filter(t => t.status === s).length;
          const icon = s === "upcoming" ? <Clock size={16} /> : s === "ongoing" ? <Zap size={16} /> : <CheckCircle size={16} />;
          const color = s === "upcoming" ? "text-accent bg-accent/10 border-accent/20" : s === "ongoing" ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground bg-muted/30 border-border";
          return (
            <GlowBorder key={s} color={s === "ongoing" ? "red" : "blue"} className="bg-card rounded-xl p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg border ${color}`}>{icon}</div>
              <div>
                <p className="font-['Orbitron'] font-bold text-2xl text-foreground">{count}</p>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">{s} tournaments</p>
              </div>
            </GlowBorder>
          );
        })}
      </div>
    </div>
  );
}

// â”€â”€â”€ Tekken Wallpaper Background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TekkenWallpaperBackground() {
  const [bgSrc, setBgSrc] = useState("/login-bg.png");
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#07070e]">
      {!imgFailed ? (
        <img
          src={bgSrc}
          alt="Login portal wallpaper"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "25% center" }}
          onError={() => {
            if (bgSrc === "/login-bg.png") {
              setBgSrc("/login-bg.jpg");
            } else if (bgSrc === "/login-bg.jpg") {
              setBgSrc("/tekken-bg.png");
            } else {
              setImgFailed(true);
            }
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 25% 50%, rgba(230,0,38,0.35), transparent 45%), radial-gradient(circle at 75% 40%, rgba(124,58,237,0.3), transparent 40%), #07070e",
          }}
        />
      )}

      {/* Darken right side so login card stays readable and off the fighters */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(7,7,14,0.15) 35%, rgba(7,7,14,0.7) 55%, rgba(7,7,14,0.95) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(7,7,14,0.85) 0%, transparent 35%)" }}
      />

      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            right: `${8 + (i % 5) * 7}%`,
            top: `${12 + (i * 9) % 75}%`,
            width: i % 3 === 0 ? 4 : 2,
            height: i % 3 === 0 ? 4 : 2,
            background: i % 2 === 0 ? "#e60026" : "#a855f7",
            boxShadow: i % 2 === 0 ? "0 0 10px #e60026" : "0 0 10px #a855f7",
            opacity: 0.55,
            animation: `sparkFloat ${2.2 + (i % 4) * 0.4}s ease-in-out infinite ${i * 0.25}s`,
          }}
        />
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
        }}
      />

      <style>{`
        @keyframes sparkFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.55; }
          50% { transform: translateY(-28px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-55px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}


// â”€â”€â”€ Login Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€





function LoginPage({ setPage, setUser }: { setPage: (p: Page) => void; setUser: (u: User) => void }) {
  const [portal, setPortal] = useState<"user" | "admin">("user");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) return setError("Please fill all fields");
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const res = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      
      if (mode === "login") {
        // Enforce Admin Portal restriction: Must actually have admin role!
        if (portal === "admin" && data.user.role !== "admin") {
          throw new Error("Access Denied: Only Administrator accounts can log in here.");
        }
        
        setUser(data.user);
        setPage("home");
      } else {
        alert("Registration successful! Please login.");
        setMode("login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Accent styling color based on Portal
  const glowColor = portal === "admin" ? "red" : "blue";
  const borderLinearGradient = portal === "admin" 
    ? "linear-gradient(to right, #e60026, #a0001a, #e60026)" 
    : "linear-gradient(to right, #00b4ff, #e60026, #00b4ff)";

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-[#07070e] select-none">
      <TekkenWallpaperBackground />

      {/* Login panel on the FAR RIGHT — characters stay fully visible on the left */}
      <div className="relative z-10 min-h-screen flex items-center justify-end py-10 px-4 sm:px-6 lg:px-8 xl:pr-32 2xl:pr-48">
      <div className="w-full max-w-[380px] shrink-0">
        <GlowBorder color={glowColor} className="bg-card/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">

          <div className="h-1" style={{ background: borderLinearGradient }} />
          <div className="p-8">
            
            {/* Title / Logo header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center border transition-all duration-500 ${
                portal === "admin" ? "border-red-500/40" : "border-accent/40"
              }`} style={{ 
                background: portal === "admin" ? "linear-gradient(135deg, rgba(230,0,38,0.2), rgba(0,0,0,0.6))" : "linear-gradient(135deg, rgba(0,180,255,0.2), rgba(0,0,0,0.6))",
                boxShadow: portal === "admin" ? "0 0 20px rgba(230,0,38,0.3)" : "0 0 20px rgba(0,180,255,0.3)"
              }}>
                {portal === "admin" ? (
                  <Shield size={28} className="text-red-500 animate-pulse" />
                ) : (
                  <Swords size={28} className="text-[#00b4ff]" />
                )}
              </div>
              
              <h1 className="font-['Orbitron'] font-black text-xl text-foreground tracking-wider leading-tight">
                {portal === "admin" ? "ADMIN TERMINAL" : "ONLINE TEKKEN"}
              </h1>
              <p className="font-['Orbitron'] text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: portal === "admin" ? "#e60026" : "#00b4ff" }}>
                {portal === "admin" ? "LEVEL 1 SECURITY" : "TOURNAMENTS 2026"}
              </p>
              <p className="text-muted-foreground text-xs mt-2 font-['Rajdhani'] font-semibold tracking-wider">
                {portal === "admin" ? "Authorized Personnel Only" : "The Official Tournament Database"}
              </p>
            </div>

            {/* Portal Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-muted/40 border border-border/80 rounded-lg p-1 mb-6">
              <button onClick={() => { setPortal("user"); setMode("login"); setError(""); }}
                className={`py-2 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer font-bold ${
                  portal === "user" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                }`}>
                User Portal
              </button>
              <button onClick={() => { setPortal("admin"); setMode("login"); setError(""); }}
                className={`py-2 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer font-bold ${
                  portal === "admin" ? "bg-red-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}>
                Admin Portal
              </button>
            </div>

            {/* Sub-modes: Login / Register tabs (Only visible in User Portal) */}
            {portal === "user" && (
              <div className="flex gap-1 bg-muted/20 border border-border/50 rounded-lg p-0.5 mb-6">
                {(["login", "register"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); }}
                    className={`flex-1 py-1.5 rounded-md text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer font-semibold ${
                      mode === m ? "bg-secondary text-foreground border border-border/50" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Admin terminal secure visualizer */}
            {portal === "admin" && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-red-950/20 border border-red-900/40 mb-6 text-red-500 font-mono text-[9px] uppercase tracking-wider">
                <Shield size={13} className="animate-pulse shrink-0" />
                <span>SECURE SHELL PROTOCOL ENABLED</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {portal === "user" && mode === "register" && (
                <FInput label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="FightingGod_Jin" />
              )}
              
              <FInput 
                label={portal === "admin" ? "Admin Username/Email" : "Email"} 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder={portal === "admin" ? "admin@tekken.com" : "player@tekken.gg"} 
              />
              
              <FInput 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
              />
              
              {error && <p className="text-xs text-red-500 font-mono text-center leading-normal mt-2">{error}</p>}
              
              <button onClick={handleAuth} disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-bold font-['Rajdhani'] text-base transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ 
                  background: portal === "admin" ? "linear-gradient(135deg, #e60026, #a0001a)" : "linear-gradient(135deg, #00b4ff, #0077b3)", 
                  boxShadow: portal === "admin" ? "0 0 25px rgba(230,0,38,0.3)" : "0 0 25px rgba(0,180,255,0.3)", 
                  border: portal === "admin" ? "1px solid rgba(230,0,38,0.4)" : "1px solid rgba(0,180,255,0.4)" 
                }}>
                {loading ? "Connecting..." : (
                  portal === "admin" ? (
                    <><Shield size={18} /> Authenticate Admin</>
                  ) : (
                    mode === "login" ? <><LogIn size={18} /> Enter The Arena</> : <><Shield size={18} /> Create Account</>
                  )
                )}
              </button>
            </div>

            {/* Footer switcher text (Only visible in User Portal) */}
            {portal === "user" && (
              <p className="text-center text-[10px] text-muted-foreground mt-6 font-mono">
                {mode === "login" ? "No account? " : "Have an account? "}
                <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-accent hover:underline cursor-pointer font-bold">
                  {mode === "login" ? "Register here" : "Sign in"}
                </button>
              </p>
            )}

            {/* Admin Warning Disclaimer */}
            {portal === "admin" && (
              <p className="text-center text-[9px] text-red-500/60 mt-6 font-mono leading-normal">
                WARNING: Unauthorized login attempts will be logged.
              </p>
            )}

            {/* Credit inside card */}
            <div className="mt-6 pt-5 border-t border-border/60 text-center">
              <p className="font-['Orbitron'] text-[9px] tracking-widest text-muted-foreground/50 uppercase mb-1">Managed and Designed by</p>
              <p className="font-['Rajdhani'] font-bold text-foreground text-sm">
                MOIN SHAH{" "}
                <span className="font-['Orbitron'] text-[10px] font-normal" style={{ color: portal === "admin" ? "#e60026" : "#00b4ff" }}>Esports.Co</span>
              </p>
            </div>
          </div>
        </GlowBorder>
      </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("login");
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
    if (!user) return;
    const log = (name: string, data: unknown) => console.log(`Fetched ${name}:`, data);
    fetch(API_URL + "/players")
      .then(res => res.json())
      .then(data => {
        log("players", data);
        if (Array.isArray(data) && data.length > 0) setPlayers(data);
        else setPlayers(INITIAL_PLAYERS);
      })
      .catch(e => {
        console.error("Players fetch error:", e);
        setPlayers(INITIAL_PLAYERS);
      });
    fetch(API_URL + "/tournaments").then(res => res.json()).then(data => { if(Array.isArray(data)) setTournaments(data); });
    fetch(API_URL + "/registrations").then(res => res.json()).then(data => { if(Array.isArray(data)) setRegistrations(data); });
    fetch(API_URL + "/matches").then(res => res.json()).then(data => { if(Array.isArray(data)) setMatches(data); });
    fetch(API_URL + "/leaderboard").then(res => res.json()).then(data => { if(Array.isArray(data)) setLeaderboard(data); });
  }, [user]);

  // Logout function
  const logout = () => {
    setUser(null);
    setPage("login");
  };

  const isAdmin = user?.role === "admin";

  if (!user && page !== "login") {
    setPage("login");
  }

  return (
    <div className="min-h-screen bg-background font-['Inter'] text-foreground" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,180,255,0.2) transparent" }}>
      {user && <Nav page={page} setPage={setPage} user={user} onLogout={logout} />}
      {user && !isAdmin && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-blue-950/80 border-b border-blue-900/50 backdrop-blur-md py-2 px-4 flex items-center justify-center gap-2 text-sky-400 font-mono text-[9px] uppercase tracking-widest leading-none">
          <Shield size={10} className="animate-pulse text-sky-400" />
          <span>Read-Only Guest Mode Active â€” Database modification disabled</span>
        </div>
      )}
      <main className={user ? (!isAdmin ? "pt-24" : "pt-16") : ""}>
        {(!user || page === "login") ? (
          <LoginPage setPage={setPage} setUser={setUser} />
        ) : (
          <>
            {page === "home" && <HomePage players={players} tournaments={tournaments} matches={matches} setPage={setPage} isAdmin={isAdmin} />}
            {page === "players" && <PlayersPage players={players} setPlayers={setPlayers} isAdmin={isAdmin} currentUserId={user?.id} />}
            {page === "tournaments" && <TournamentsPage tournaments={tournaments} setTournaments={setTournaments} isAdmin={isAdmin} />}
            {page === "registrations" && <RegistrationsPage registrations={registrations} setRegistrations={setRegistrations} players={players} setPlayers={setPlayers} tournaments={tournaments} isAdmin={isAdmin} currentUserId={user?.id} currentUserEmail={user?.email} />}
            {page === "matches" && <MatchesPage matches={matches} setMatches={setMatches} players={players} tournaments={tournaments} isAdmin={isAdmin} />}
            {page === "leaderboard" && <LeaderboardPage leaderboard={leaderboard} players={players} />}
            {page === "dashboard" && <DashboardPage players={players} tournaments={tournaments} matches={matches} registrations={registrations} leaderboard={leaderboard} />}
          </>
        )}
      </main>
      {user && <Footer />}
    </div>
  );
}
