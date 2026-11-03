import {
  Mic, Calendar, Users, TrendingUp, GraduationCap, Building2, Gem, Star, Rocket, MessageSquare,
  Zap, Target, Handshake, ClipboardList, Settings, Trophy, Crown, Dumbbell, Music, Plane, BookOpen, Camera,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  mic: Mic, calendar: Calendar, users: Users, trending: TrendingUp, graduation: GraduationCap,
  building: Building2, gem: Gem, star: Star, rocket: Rocket, message: MessageSquare, zap: Zap,
  target: Target, handshake: Handshake, clipboard: ClipboardList, settings: Settings, trophy: Trophy,
  crown: Crown, dumbbell: Dumbbell, music: Music, plane: Plane, book: BookOpen, camera: Camera,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name] ?? Star;
  return <C className={className} strokeWidth={1.5} />;
}
