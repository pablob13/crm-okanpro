'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import QuoteForm from '@/components/quotes/QuoteForm';
import { quotesService } from '@/services/quotesService';
import { Quote, QuoteItem } from '@/types';

export default function NewQuotePage() {
  const handleSubmit = async (
    quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ) => {
    await quotesService.createQuote(quote, items);
  };

  return (
    <AppLayout>
      <QuoteForm onSubmit={handleSubmit} />
    </AppLayout>
  );
}
