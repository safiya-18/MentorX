import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const quotes = [
  "The secret of getting ahead is getting started.",
  "It's not whether you get knocked down, it's whether you get up.",
  "Your time is limited, so don't waste it living someone else's life.",
  "If you can dream it, you can do it.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "Believe you can and you're halfway there.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Act as if what you do makes a difference. It does.",
  "You miss 100% of the shots you don't take.",
  "The best way to predict the future is to create it.",
  "Whether you think you can or you think you can't, you're right.",
  "I have not failed. I've just found 10,000 ways that won't work.",
  "It always seems impossible until it's done.",
  "Start where you are. Use what you have. Do what you can.",
  "Fall seven times and stand up eight.",
  "Everything you've ever wanted is on the other side of fear.",
  "Hardships often prepare ordinary people for an extraordinary destiny.",
  "Dream big and dare to fail.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals."
];

const DailyMotivationCard = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('motivationDate');
    const storedQuoteIndex = localStorage.getItem('motivationQuoteIndex');

    if (storedDate === today && storedQuoteIndex !== null) {
      setQuote(quotes[parseInt(storedQuoteIndex, 10)]);
    } else {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      localStorage.setItem('motivationDate', today);
      localStorage.setItem('motivationQuoteIndex', randomIndex.toString());
      setQuote(quotes[randomIndex]);
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6 h-full flex flex-col justify-center items-center text-center relative overflow-hidden"
    >
      <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-yellow-100/30 blur-[40px] pointer-events-none" />
      
      <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center mb-4">
        <FiStar size={24} />
      </div>
      
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily Motivation</h3>
      <p className="text-lg font-medium text-slate-700 italic relative z-10">
        "{quote}"
      </p>
    </motion.div>
  );
};

export default DailyMotivationCard;
