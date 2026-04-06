"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TestimonialData {
  id: string
  name: string
  role: string
  company: string
  image: string
  rating: number
  testimonial: string
}

const testimonials: TestimonialData[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "Creative Studios Inc",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    testimonial: "Outstanding print quality! Our business cards and brochures exceeded expectations. The attention to detail and vibrant colors made our marketing materials stand out. Highly recommend their services!"
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    role: "Owner",
    company: "Kumar Enterprises",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    testimonial: "Fast turnaround and excellent customer service. They printed our new catalogs in just 2 days with perfect color matching. The quality is professional-grade and our clients love the new design!"
  },
  {
    id: "3",
    name: "Priya Sharma",
    role: "Event Coordinator",
    company: "Elegant Events Chennai",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    testimonial: "They handled our wedding invitation printing beautifully. The paper quality was luxurious and the printing was flawless. Every detail was perfect and delivered on time!"
  },
  {
    id: "4",
    name: "David Thompson",
    role: "CEO",
    company: "Tech Solutions Chennai",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    testimonial: "Professional service from start to finish. Our corporate materials including letterheads, envelopes, and presentation folders look amazing. They truly understand business printing needs."
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      }, 5000)

      return () => clearInterval(timer)
    }
  }, [currentIndex, isHovered])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    })
  }

  const nextTestimonial = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  return (
    <section className="relative w-full py-16 px-4 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Customer Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by businesses in Chennai for exceptional printing quality and service
          </p>
        </motion.div>

        <div
          className="relative max-w-5xl mx-auto mb-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-[450px] md:h-[350px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                className="absolute inset-0"
              >
                <div className="relative h-full bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/20" />
                  
                  <div className="flex flex-col md:flex-row gap-6 h-full">
                    <div className="flex-shrink-0 text-center md:text-left">
                      <Avatar className="h-20 w-20 mx-auto md:mx-0 mb-4 border-2 border-primary/20">
                        <AvatarImage src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} />
                        <AvatarFallback>{testimonials[currentIndex].name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex gap-1 justify-center md:justify-start mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < testimonials[currentIndex].rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                            )}
                          />
                        ))}
                      </div>

                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {testimonials[currentIndex].name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {testimonials[currentIndex].role}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {testimonials[currentIndex].company}
                      </p>
                    </div>

                    <div className="flex-1 flex items-center">
                      <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                        &quot;{testimonials[currentIndex].testimonial}&quot;
                      </blockquote>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <motion.button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-card border border-border hover:bg-accent hover:border-primary/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/50"
                  )}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-card border border-border hover:bg-accent hover:border-primary/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "5000+", label: "Happy Clients" },
            { number: "50K+", label: "Projects Completed" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "24/7", label: "Support Available" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
