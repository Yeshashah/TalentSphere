import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Get started with basic features',
    features: [
      '5 candidate profile views/month',
      '2 active job postings',
      'Basic search filters',
      'Application tracking',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    desc: 'Everything you need to scale hiring',
    features: [
      'Unlimited candidate views',
      'Unlimited job postings',
      'Advanced search filters',
      'Direct messaging',
      'AI candidate matching',
      'Candidate recommendations',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">Simple, transparent pricing</h1>
          <p className="text-slate-500 mt-4 text-lg">Choose the plan that fits your hiring needs</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className={`p-8 h-full flex flex-col ${
                plan.highlighted
                  ? 'border-indigo-200 shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-100'
                  : ''
              }`}>
                {plan.highlighted && (
                  <div className="inline-flex self-start px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <p className="text-slate-500 mt-2">{plan.desc}</p>

                <div className="mt-8 space-y-3 flex-1">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`mt-8 h-12 rounded-xl w-full ${
                    plan.highlighted ? '' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                  variant={plan.highlighted ? 'default' : 'default'}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}