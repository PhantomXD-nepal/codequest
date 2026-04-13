'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className={cn(
        'group border-outline-variant/20 rounded-2xl border overflow-hidden',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'bg-surface-container-low shadow-lg' : 'bg-surface-container-lowest hover:bg-surface-container-low/50',
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5"
      >
        <h3
          className={cn(
            'text-left text-base font-headline font-bold transition-colors duration-200',
            'text-on-surface/80',
            isOpen && 'text-primary',
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className={cn(
            'shrink-0 rounded-full p-1 bg-surface-container-high',
            'transition-colors duration-200',
            isOpen ? 'text-primary' : 'text-on-surface-variant',
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.1,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: 'easeInOut',
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
          >
            <div className="border-outline-variant/10 border-t px-6 pt-4 pb-6">
              <motion.p
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
                className="text-on-surface-variant text-sm leading-relaxed font-body"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const faqs: Omit<FAQItemProps, 'index'>[] = [
    {
      question: 'Is CodeQuest really free for everyone in Nepal?',
      answer:
        "Yes, absolutely! CodeQuest is 100% free for all students in Nepal. Our mission is to bridge the digital divide and ensure every child has the opportunity to learn coding, regardless of their background or location.",
    },
    {
      question: 'What age group is CodeQuest designed for?',
      answer:
        'Our curriculum is tailored for young explorers aged 8 to 18. We have different paths ranging from visual block-based coding for beginners to professional Python and Web Development for older students.',
    },
    {
      question: 'Do I need a powerful computer to use the platform?',
      answer:
        'Not at all! CodeQuest is designed to run smoothly in any modern web browser. Since the code execution happens directly in your browser or on our servers, even basic laptops or tablets can be used for your coding adventures.',
    },
    {
      question: 'Can I learn in Nepali language?',
      answer:
        'We are currently working on full Nepali localization! While the coding languages themselves use English keywords (as per industry standards), our instructions, hints, and mascot guidance are being translated to make learning as accessible as possible.',
    },
    {
      question: 'What programming languages can I learn?',
      answer:
        'You can start with Python, which is the world\'s most popular language for beginners and AI. We also offer Web Development (HTML/CSS/JS) and are planning to add mobile app development quests soon!',
    },
    {
      question: 'How do I earn certificates and rewards?',
      answer:
        'As you complete lessons and chapters, you earn XP and unlock achievements. Once you master a full course path, you\'ll receive a digital "Explorer Certificate" that you can share with your school and friends!',
    },
  ];

  return (
    <section id="faq" className="bg-background relative w-full overflow-hidden py-24">
      {/* Decorative elements */}
      <div className="bg-primary/5 absolute top-20 -left-20 h-96 w-96 rounded-full blur-[100px]" />
      <div className="bg-tertiary/5 absolute -right-20 bottom-20 h-96 w-96 rounded-full blur-[100px]" />

      <div className="relative container mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
            <MessageCircle className="w-3 h-3" />
            Common Questions
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-on-surface mb-6 font-headline tracking-tight">
            Got <span className="text-primary">Questions?</span> We have Answers.
          </h2>
          <p className="text-on-surface-variant text-lg font-medium">
            Everything you need to know about starting your coding journey in Nepal.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn('mx-auto mt-20 max-w-md rounded-3xl p-8 text-center bg-surface-container-low border border-outline-variant/20 shadow-xl')}
        >
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center justify-center rounded-2xl p-4">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-on-surface mb-2 text-lg font-bold font-headline">
            Still have questions?
          </p>
          <p className="text-on-surface-variant mb-8 text-sm font-medium">
            Our team of mentors is here to help you every step of the way.
          </p>
          <button
            type="button"
            className={cn(
              'w-full rounded-xl px-8 py-4 text-base font-black font-headline',
              'bg-primary text-white',
              'hover:bg-primary-dim hover:scale-[1.02]',
              'transition-all duration-300 shadow-lg shadow-primary/20',
            )}
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
}
