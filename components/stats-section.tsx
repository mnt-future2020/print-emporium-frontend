"use client";

import * as React from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";
import { Users, Briefcase, Calendar, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const fontSize = 40;
const padding = 10;
const height = fontSize + padding;

interface CounterProps {
  start?: number;
  end: number;
  duration?: number;
  className?: string;
  fontSize?: number;
}

const Counter = ({
  start = 0,
  end,
  duration = end,
  className,
  fontSize = 30,
  ...rest
}: CounterProps) => {
  const [value, setValue] = React.useState(start);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (value < end) {
        setValue((prev) => prev + 1);
      }
    }, (duration / (end - start)) * 1000);

    return () => clearInterval(interval);
  }, [value, end, start, duration]);

  return (
    <div
      style={{ fontSize }}
      {...rest}
      className={cn(`flex overflow-hidden rounded px-2 leading-none text-primary font-bold`, className)}
    >
      {value >= 100000 && <Digit place={100000} value={value} />}
      {value >= 10000 && <Digit place={10000} value={value} />}
      {value >= 1000 && <Digit place={1000} value={value} />}
      {value >= 100 && <Digit place={100} value={value} />}
      {value >= 10 && <Digit place={10} value={value} />}
      <Digit place={1} value={value} />
    </div>
  );
};

function Digit({ place, value }: { place: number; value: number }) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace);

  React.useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10)].map((_, i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }: { mv: MotionValue; number: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

const StatCard = ({ icon, value, label, suffix = "", delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="p-4 rounded-full bg-white/10 text-primary-200"
          >
            {icon}
          </motion.div>
          
          <div className="flex items-baseline justify-center">
            <Counter end={value} duration={2} fontSize={48} className="text-white" />
            {suffix && (
              <span className="text-4xl font-bold text-white ml-1">{suffix}</span>
            )}
          </div>
          
          <p className="text-sm font-medium text-primary-200/80 uppercase tracking-wider">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function StatsSection() {
  const stats = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      value: 2500,
      suffix: "+",
      label: "Projects Completed",
      delay: 0,
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: 5000,
      suffix: "+",
      label: "Satisfied Customers",
      delay: 0.1,
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      value: 15,
      suffix: "+",
      label: "Years in Business",
      delay: 0.2,
    },
    {
      icon: <Award className="w-8 h-8" />,
      value: 50,
      suffix: "+",
      label: "Team Members",
      delay: 0.3,
    },
  ];

  return (
    <section className="w-full py-24 px-4 bg-primary-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-900/40 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-900/40 rounded-full blur-3xl mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-primary-200/80 max-w-2xl mx-auto">
            Delivering excellence and building lasting relationships with our clients in Chennai
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={stat.delay}
            />
          ))}
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
