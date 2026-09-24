import React, { useState } from 'react';
import { X, Bell, CheckCircle2, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ROUTES_DATA } from '../../data/mockData';

interface FareAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRouteId?: string;
  initialRouteId?: string;
  language?: string;
  onAlertCreated?: (routeLabel: string, targetPrice: number) => void;
}

export const FareAlertModal: React.FC<FareAlertModalProps> = ({
  isOpen,
  onClose,
  defaultRouteId,
  initialRouteId = 'DEL-BOM',
  onAlertCreated,
}) => {
  const activeInitialRoute = initialRouteId || defaultRouteId || 'DEL-BOM';
  const [selectedRoute, setSelectedRoute] = useState(activeInitialRoute);
  const [targetPrice, setTargetPrice] = useState('4200');
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('whatsapp');
  const [contactValue, setContactValue] = useState('+91 98765 43210');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentRouteData = ROUTES_DATA.find((r) => r.id === selectedRoute) || ROUTES_DATA[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1769E0', '#2F80ED', '#10B981', '#EAF3FF'],
      });
    } catch {
      // fallback
    }

    setIsSuccess(true);
    if (onAlertCreated) {
      onAlertCreated(`${currentRouteData.originCode} → ${currentRouteData.destinationCode}`, Number(targetPrice));
    }

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0B1F3A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1769E0]/30 border border-[#1769E0]/40">
              <Bell className="w-5 h-5 text-[#93C5FD]" />
            </div>
            <div>
              <h3 className="text-base font-bold">Configure Fare Shock Alert</h3>
              <p className="text-xs text-[#9FB3C8]">Get notified instantly when price dips or surges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9FB3C8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-[#102A43]">Fare Alert Activated!</h4>
            <p className="text-xs text-[#627D98]">
              We will alert you via {contactMethod.toUpperCase()} as soon as {currentRouteData.originCode}–{currentRouteData.destinationCode} fare reaches ₹{targetPrice}.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#1769E0] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AirPrice APIx Real-Time Monitor Active</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Route selection */}
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                Target Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1769E0] font-medium text-[#102A43]"
              >
                {ROUTES_DATA.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.originCity} ({r.originCode}) → {r.destinationCity} ({r.destinationCode}) — Current: ₹{r.currentFare}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Price Reference */}
            <div className="bg-[#F6F9FC] p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#627D98] block">Current Live Fare</span>
                <span className="font-mono font-bold text-sm text-[#102A43]">
                  ₹{currentRouteData.currentFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#627D98] block">30D Historical Avg</span>
                <span className="font-mono font-bold text-sm text-[#1769E0]">
                  ₹{currentRouteData.avg30DFare.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                Alert Trigger Price (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-[#627D98] font-bold">₹</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  min="1000"
                  max="50000"
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#1769E0] font-mono font-bold text-[#102A43]"
                />
              </div>
              <p className="text-[11px] text-[#627D98] mt-1">
                Recommendation: ₹{currentRouteData.normalFare} or below for optimal booking.
              </p>
            </div>

            {/* Contact Method */}
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                Notification Channel
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setContactMethod('whatsapp')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                    contactMethod === 'whatsapp'
                      ? 'bg-[#EAF3FF] border-[#1769E0] text-[#1769E0] font-bold'
                      : 'border-[#CBD5E1] text-[#627D98]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp / SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('email')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                    contactMethod === 'email'
                      ? 'bg-[#EAF3FF] border-[#1769E0] text-[#1769E0] font-bold'
                      : 'border-[#CBD5E1] text-[#627D98]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Digest</span>
                </button>
              </div>
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={contactMethod === 'whatsapp' ? '+91 XXXXX XXXXX' : 'user@example.com'}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#1769E0]"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1769E0] hover:bg-[#1253B3] text-white font-bold rounded-xl text-sm shadow-md shadow-[#1769E0]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Activate Real-Time Alert</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
