"use client";

import React, { useState } from "react";
import Button from "@/components/Button";

interface PricingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plan: any) => void;
}

export default function AddPricingPlanModal({ isOpen, onClose, onAdd }: PricingPlanModalProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, duration, price, payment_method: paymentMethod, description }),
      });
      if (!res.ok) throw new Error("Failed to add pricing plan");
      const data = await res.json();
      onAdd(data.plan);
      onClose();
      setName(""); setDuration(0); setPrice(0); setPaymentMethod(""); setDescription("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add plan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Add Pricing Plan</h3>

        <div className="flex flex-col gap-3">
          <input className="border p-2 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="border p-2 rounded" type="number" placeholder="Duration (days)" value={duration} onChange={e => setDuration(Number(e.target.value))} />
          <input className="border p-2 rounded" type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} />
          <input className="border p-2 rounded" placeholder="Payment Method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} />
          <textarea className="border p-2 rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Add</Button>
        </div>
      </div>
    </div>
  );
}
