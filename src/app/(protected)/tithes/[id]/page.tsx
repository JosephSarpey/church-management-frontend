"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { tithesApi } from '@/lib/api';
import type { Tithe as ApiTithe } from '@/lib/api/tithes/types';
import { 
  ArrowLeft, 
  Download, 
  Receipt, 
  User, 
  Calendar, 
  CreditCard, 
  Tag, 
  Hash, 
  FileText,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const TitheDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [tithe, setTithe] = useState<ApiTithe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await tithesApi.getTithe(id);
        setTithe(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const downloadReceipt = () => {
    if (!tithe) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Logo/Church Name
    doc.setFontSize(22);
    doc.setTextColor(191, 155, 48); // Gold color
    doc.text("ZION CHAPEL", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Official Tithe & Offering Receipt", pageWidth / 2, 28, { align: 'center' });
    
    // Header Line
    doc.setDrawColor(191, 155, 48);
    doc.setLineWidth(0.5);
    doc.line(20, 35, pageWidth - 20, 35);

    // Receipt Information
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Receipt ID: ${tithe.id.substring(0, 8).toUpperCase()}`, 20, 45);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, pageWidth - 20, 45, { align: 'right' });

    // Main Details Box
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 55, pageWidth - 40, 80, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 55, pageWidth - 40, 80, 'D');

    let y = 70;
    const drawRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 30, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 80, y);
      y += 12;
    };

    drawRow("Member Name:", tithe.memberName || "Unknown Member");
    drawRow("Payment Type:", tithe.paymentType);
    drawRow("Amount:", `GHS ${tithe.amount.toFixed(2)}`);
    drawRow("Payment Date:", format(new Date(tithe.paymentDate), 'PPP'));
    drawRow("Payment Method:", tithe.paymentMethod);

    // Reference & Notes
    if (tithe.reference) {
      drawRow("Reference:", tithe.reference);
    }

    // Amount in Words Placeholder or emphasis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL AMOUNT: GHS ${tithe.amount.toFixed(2)}`, pageWidth / 2, 125, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your faithful giving. God bless you!", pageWidth / 2, 150, { align: 'center' });

    doc.setDrawColor(191, 155, 48);
    doc.line(pageWidth / 2 - 30, 180, pageWidth / 2 + 30, 180);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Authorized Signature", pageWidth / 2, 185, { align: 'center' });

    // Save
    doc.save(`Receipt_${tithe.memberName?.replace(/\s+/g, '_')}_${format(new Date(tithe.paymentDate), 'yyyyMMdd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!tithe) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Record Not Found</h2>
          <p className="text-muted-foreground mb-6">The tithe or offering record you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button onClick={() => router.push('/tithes')}>Back to Tithes</Button>
        </div>
      </div>
    );
  }

  const detailItems = [
    { label: 'Member Name', value: tithe.memberName, icon: User },
    { label: 'Payment Type', value: tithe.paymentType, icon: Tag },
    { label: 'Amount', value: `₵${tithe.amount.toFixed(2)}`, icon: Receipt, className: 'text-2xl font-bold text-primary' },
    { label: 'Payment Date', value: format(new Date(tithe.paymentDate), 'PPP'), icon: Calendar },
    { label: 'Payment Method', value: tithe.paymentMethod, icon: CreditCard },
    { label: 'Reference', value: tithe.reference || 'None', icon: Hash },
    { label: 'Notes', value: tithe.notes || 'No notes provided', icon: FileText },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/tithes')}
          className="group text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Tithes
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={downloadReceipt} 
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white shadow-lg transition-all hover:scale-105"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline" onClick={() => router.push(`/tithes/${id}/edit`)}>
            Edit Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
              <Receipt size={120} />
            </div>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Payment Confirmation</CardTitle>
                  <p className="text-sm text-muted-foreground">Detailed record of the transaction</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {detailItems.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </div>
                    <p className={item.className || "text-lg md:text-xl font-semibold text-foreground"}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t space-y-6">
                {detailItems.slice(4).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </div>
                    <p className="text-base text-foreground bg-muted/10 p-3 rounded-lg border border-muted/50">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl overflow-hidden relative bg-gradient-to-br from-amber-600/90 to-amber-700/90 dark:from-amber-900/40 dark:to-background dark:border dark:border-amber-500/20 text-white dark:text-amber-100">
            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/10 dark:bg-amber-500/5 rounded-full blur-2xl" />
            <div className="absolute -top-6 -left-6 h-24 w-24 bg-white/10 dark:bg-amber-500/5 rounded-full blur-xl" />
            <CardContent className="p-8 text-center space-y-4 relative z-10">
              <div className="h-16 w-16 bg-white/20 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 dark:border-amber-500/30 backdrop-blur-sm">
                <Receipt size={32} className="text-white dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold">Thank You!</h3>
              <p className="text-white/80 dark:text-amber-100/70 text-sm leading-relaxed">
                Giving is an act of worship and a way to support the work of God&apos;s house. Your contribution helps us reach more people and change lives.
              </p>
              <div className="pt-4 border-t border-white/10 dark:border-amber-500/10">
                <blockquote className="italic text-xs opacity-70">
                  &quot;Give, and it will be given to you. A good measure, pressed down, shaken together and running over...&quot;
                  <footer className="mt-1 font-bold not-italic font-sans">— Luke 6:38</footer>
                </blockquote>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">System Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Record ID:</span>
                <span className="font-mono text-[10px] break-all max-w-[140px] text-right text-foreground">{id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created At:</span>
                <span className="text-foreground">{tithe ? format(new Date(tithe.createdAt), 'PPP p') : '-'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TitheDetailPage;
