'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import QuoteForm from '@/components/quotes/QuoteForm';
import { quotesService } from '@/services/quotesService';
import { Quote, QuoteItem } from '@/types';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quote, setQuote] = useState<(Quote & { items: QuoteItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    async function loadQuote() {
      try {
        const data = await quotesService.getQuoteById(id);
        if (data) {
          setQuote(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error cargando cotización:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [id]);

  const handleSubmit = async (
    quotePayload: Omit<Quote, 'id' | 'created_at' | 'updated_at'>,
    itemsPayload: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ) => {
    await quotesService.updateQuote(id, quotePayload, itemsPayload);
  };

  return (
    <AppLayout>
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          Cargando cotización...
        </div>
      ) : error || !quote ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          No se pudo encontrar la cotización solicitada.
        </div>
      ) : (
        <QuoteForm initialQuote={quote} onSubmit={handleSubmit} isEdit={true} />
      )}
    </AppLayout>
  );
}
