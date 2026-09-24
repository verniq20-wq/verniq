import {
  Baby,
  Bicycle,
  Bird,
  Book,
  BowlFood,
  Bread,
  BugBeetle,
  Bus,
  Butterfly,
  Carrot,
  Cat,
  Circle,
  Clock,
  Cloud,
  CloudRain,
  Coins,
  Cow,
  Dog,
  Drop,
  Ear,
  Egg,
  Eye,
  Fish,
  Flower,
  Footprints,
  Hand,
  Heart,
  Horse,
  House,
  Leaf,
  Moon,
  Mountains,
  OrangeSlice,
  Pencil,
  Plant,
  Rabbit,
  SoccerBall,
  Square,
  Star,
  Sun,
  Tooth,
  Tree,
  Triangle,
  User,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';
import type { PictureKey } from '../../types';
import { cn } from '../../utils';

/** Each illustration gets its own colour so cards are easy to tell apart at a glance. */
const PICTURES: Record<PictureKey, { icon: Icon; color: string; bg: string }> = {
  dog: { icon: Dog, color: 'text-sun-600', bg: 'bg-sun-50' },
  cat: { icon: Cat, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  cow: { icon: Cow, color: 'text-ink-700', bg: 'bg-ink-100' },
  horse: { icon: Horse, color: 'text-sun-700', bg: 'bg-sun-50' },
  bird: { icon: Bird, color: 'text-aqua-600', bg: 'bg-aqua-50' },
  fish: { icon: Fish, color: 'text-ocean-500', bg: 'bg-ocean-50' },
  rabbit: { icon: Rabbit, color: 'text-rose-500', bg: 'bg-rose-50' },
  butterfly: { icon: Butterfly, color: 'text-aqua-600', bg: 'bg-aqua-50' },
  beetle: { icon: BugBeetle, color: 'text-leaf-600', bg: 'bg-leaf-50' },
  sun: { icon: Sun, color: 'text-sun-500', bg: 'bg-sun-50' },
  moon: { icon: Moon, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  tree: { icon: Tree, color: 'text-leaf-600', bg: 'bg-leaf-50' },
  flower: { icon: Flower, color: 'text-rose-500', bg: 'bg-rose-50' },
  leaf: { icon: Leaf, color: 'text-leaf-500', bg: 'bg-leaf-50' },
  star: { icon: Star, color: 'text-sun-500', bg: 'bg-sun-50' },
  cloud: { icon: Cloud, color: 'text-ocean-400', bg: 'bg-ocean-50' },
  rain: { icon: CloudRain, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  mountain: { icon: Mountains, color: 'text-leaf-700', bg: 'bg-leaf-50' },
  drop: { icon: Drop, color: 'text-aqua-600', bg: 'bg-aqua-50' },
  plant: { icon: Plant, color: 'text-leaf-600', bg: 'bg-leaf-50' },
  orange: { icon: OrangeSlice, color: 'text-sun-600', bg: 'bg-sun-50' },
  carrot: { icon: Carrot, color: 'text-sun-700', bg: 'bg-sun-50' },
  egg: { icon: Egg, color: 'text-sun-600', bg: 'bg-sun-50' },
  bread: { icon: Bread, color: 'text-sun-700', bg: 'bg-sun-50' },
  rice: { icon: BowlFood, color: 'text-ink-700', bg: 'bg-ink-100' },
  house: { icon: House, color: 'text-rose-500', bg: 'bg-rose-50' },
  book: { icon: Book, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  pencil: { icon: Pencil, color: 'text-sun-600', bg: 'bg-sun-50' },
  ball: { icon: SoccerBall, color: 'text-ink-700', bg: 'bg-ink-100' },
  bus: { icon: Bus, color: 'text-sun-600', bg: 'bg-sun-50' },
  bicycle: { icon: Bicycle, color: 'text-aqua-600', bg: 'bg-aqua-50' },
  clock: { icon: Clock, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  coins: { icon: Coins, color: 'text-sun-600', bg: 'bg-sun-50' },
  hand: { icon: Hand, color: 'text-rose-500', bg: 'bg-rose-50' },
  eye: { icon: Eye, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  ear: { icon: Ear, color: 'text-rose-500', bg: 'bg-rose-50' },
  foot: { icon: Footprints, color: 'text-ink-700', bg: 'bg-ink-100' },
  heart: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  tooth: { icon: Tooth, color: 'text-ocean-500', bg: 'bg-ocean-50' },
  baby: { icon: Baby, color: 'text-rose-500', bg: 'bg-rose-50' },
  person: { icon: User, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  family: { icon: UsersThree, color: 'text-aqua-600', bg: 'bg-aqua-50' },
  triangle: { icon: Triangle, color: 'text-sun-600', bg: 'bg-sun-50' },
  circle: { icon: Circle, color: 'text-ocean-600', bg: 'bg-ocean-50' },
  square: { icon: Square, color: 'text-leaf-600', bg: 'bg-leaf-50' },
};

interface PictureProps {
  picture: PictureKey;
  /** Icon size in px */
  size?: number;
  /** Draw the soft rounded tile behind the icon */
  tile?: boolean;
  className?: string;
  label?: string;
}

/** Modern duotone illustration used on flashcards and worksheets. */
export function Picture({ picture, size = 48, tile, className, label }: PictureProps) {
  const { icon: IconCmp, color, bg } = PICTURES[picture];
  const img = <IconCmp size={size} weight="duotone" className={color} aria-hidden={!label} aria-label={label} role={label ? 'img' : undefined} />;
  if (!tile) return <span className={cn('inline-flex', className)}>{img}</span>;
  return <span className={cn('inline-flex items-center justify-center rounded-[28%]', bg, className)}>{img}</span>;
}

/** A numeral with a ten-frame of dots, so children see the quantity as well as the symbol. */
export function NumberVisual({ value, size = 'lg' }: { value: number; size?: 'sm' | 'lg' }) {
  const dots = Array.from({ length: 10 }, (_, i) => i < value);
  if (value > 10) {
    return (
      <span className={cn('font-display font-extrabold leading-none text-ocean-600', size === 'lg' ? 'text-[88px]' : 'text-5xl')} role="img" aria-label={`${value}`}>
        {value}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col items-center gap-3" role="img" aria-label={`${value}`}>
      <span className={cn('font-display font-extrabold leading-none text-ocean-600', size === 'lg' ? 'text-[88px]' : 'text-5xl')} aria-hidden>
        {value}
      </span>
      <span className="grid grid-cols-5 gap-1.5 rounded-2xl bg-ocean-50 p-2.5" aria-hidden>
        {dots.map((on, i) => (
          <span
            key={i}
            className={cn('rounded-full', size === 'lg' ? 'h-4 w-4' : 'h-2.5 w-2.5', on ? 'bg-sun-400' : 'bg-surface ring-1 ring-inset ring-ocean-100')}
          />
        ))}
      </span>
    </span>
  );
}
