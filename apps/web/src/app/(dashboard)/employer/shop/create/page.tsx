'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiAuth, api } from '@/lib/api';
import {
  ArrowLeft, Upload, Save, Loader2, Cpu, Package, Wrench,
} from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    listingType: 'digital',
    categoryId: '',
    subcategoryId: '',
    pricingType: 'per_unit',
    price: '',
    currency: 'NGN',
    priceUnit: '',
    minQuantity: 1,
    priceMayVary: false,
    isWorkRelatedConfirmed: false,
  });

  const [digitalFile, setDigitalFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/shop/categories');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setForm(prev => ({ ...prev, categoryId: catId, subcategoryId: '' }));
    const cat = categories.find(c => c.id === catId);
    setSubcategories(cat?.subcategories || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isWorkRelatedConfirmed) {
      alert('You must confirm this product is work-related.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const payload = {
        ...form,
        price: form.pricingType === 'per_unit' ? Number(form.price) : undefined,
      };

      // 1. Create product
      const res = await apiAuth.withToken(token).post('/shop/products', payload);
      const product = res.data?.data;

      // 2. Upload digital file if needed
      if (form.listingType === 'digital' && digitalFile && product?.id) {
        const formData = new FormData();
        formData.append('file', digitalFile);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/shop/products/${product.id}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      }

      router.push('/employer/shop');
    } catch (e) {
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link href="/employer/shop" className="inline-flex items-center gap-2 text-sm hover:text-green mb-6 font-bold transition-colors" style={{ color: 'var(--c-400)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="dcard mb-6">
        <div className="dcard__header">
          <div>
            <h1 className="dcard__title">Create New Listing</h1>
            <p className="dcard__sub">Add a new template, tool, or professional service.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dcard space-y-8">
        
        {/* Type Selection */}
        <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <label className="form-label mb-3">Listing Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, listingType: 'digital' }))}
              className={`p-4 rounded-xl border text-left transition-all ${form.listingType === 'digital' ? 'border-c100 ring-1 ring-c100' : 'border-c700 hover:border-c500'}`}
              style={{ backgroundColor: form.listingType === 'digital' ? 'var(--c-800)' : 'transparent' }}
            >
              <Cpu className="w-6 h-6 mb-2" style={{ color: form.listingType === 'digital' ? 'var(--blue-l)' : 'var(--c-400)' }} />
              <h3 className="font-bold mb-1" style={{ color: 'var(--c-100)' }}>Digital</h3>
              <p className="text-xs" style={{ color: 'var(--c-400)' }}>Files, templates, scripts</p>
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, listingType: 'physical' }))}
              className={`p-4 rounded-xl border text-left transition-all ${form.listingType === 'physical' ? 'border-c100 ring-1 ring-c100' : 'border-c700 hover:border-c500'}`}
              style={{ backgroundColor: form.listingType === 'physical' ? 'var(--c-800)' : 'transparent' }}
            >
              <Package className="w-6 h-6 mb-2" style={{ color: form.listingType === 'physical' ? 'var(--green)' : 'var(--c-400)' }} />
              <h3 className="font-bold mb-1" style={{ color: 'var(--c-100)' }}>Physical</h3>
              <p className="text-xs" style={{ color: 'var(--c-400)' }}>Books, hardware, merch</p>
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, listingType: 'service' }))}
              className={`p-4 rounded-xl border text-left transition-all ${form.listingType === 'service' ? 'border-c100 ring-1 ring-c100' : 'border-c700 hover:border-c500'}`}
              style={{ backgroundColor: form.listingType === 'service' ? 'var(--c-800)' : 'transparent' }}
            >
              <Wrench className="w-6 h-6 mb-2" style={{ color: form.listingType === 'service' ? 'var(--gold)' : 'var(--c-400)' }} />
              <h3 className="font-bold mb-1" style={{ color: 'var(--c-100)' }}>Service</h3>
              <p className="text-xs" style={{ color: 'var(--c-400)' }}>Consulting, design, review</p>
            </button>
          </div>
        </div>

        <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="form-field">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              required
              maxLength={100}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              className="form-input"
              required
              minLength={20}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 form-field">
            <div>
              <label className="form-label">Category</label>
              <select
                value={form.categoryId}
                onChange={handleCategoryChange}
                className="form-input"
                required
              >
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Subcategory</label>
              <select
                value={form.subcategoryId}
                onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                className="form-input"
                required
                disabled={!form.categoryId}
              >
                <option value="">Select...</option>
                {subcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <label className="form-section__title">Pricing</label>

          <div className="flex gap-4 mb-6 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--c-100)' }}>
              <input
                type="radio"
                checked={form.pricingType === 'per_unit'}
                onChange={() => setForm({ ...form, pricingType: 'per_unit' })}
                style={{ accentColor: 'var(--green)' }}
              /> Fixed Price
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--c-100)' }}>
              <input
                type="radio"
                checked={form.pricingType === 'request_quote'}
                onChange={() => setForm({ ...form, pricingType: 'request_quote' })}
                style={{ accentColor: 'var(--green)' }}
              /> Request Quote
            </label>
          </div>

          {form.pricingType === 'per_unit' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-field">
                <label className="form-label">Price</label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="form-input w-24 font-bold"
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="form-input flex-1"
                    required
                    min={1}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Unit (Optional)</label>
                <input
                  type="text"
                  value={form.priceUnit}
                  onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                  placeholder="e.g. Hour, Page, Item"
                  className="form-input"
                />
              </div>
              <div className="form-field sm:col-span-2">
                <label className="form-label">Minimum Quantity</label>
                <input
                  type="number"
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
                  className="form-input"
                  required
                  min={1}
                />
              </div>
            </div>
          )}
          {form.listingType === 'service' && (
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--c-100)' }}>
                <input
                  type="checkbox"
                  checked={form.priceMayVary}
                  onChange={(e) => setForm({ ...form, priceMayVary: e.target.checked })}
                  style={{ accentColor: 'var(--green)' }}
                />
                Final price may vary based on scope
              </label>
            </div>
          )}
        </div>

        {/* Digital Upload */}
        {form.listingType === 'digital' && (
          <div className="form-section">
            <label className="form-section__title">Digital File</label>
            <p className="form-section__desc mb-4">Upload the file that buyers will download upon purchase. Held securely in private storage.</p>
            <div className="border border-dashed border-c500 rounded-xl p-8 text-center transition-colors" style={{ backgroundColor: 'var(--c-800)' }}>
              <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--c-400)' }} />
              <input
                type="file"
                onChange={(e) => setDigitalFile(e.target.files?.[0] || null)}
                className="hidden"
                id="digital-upload"
                required
              />
              <label htmlFor="digital-upload" className="cursor-pointer">
                <span className="font-bold text-green hover:text-green-light">Click to upload</span>
                <span style={{ color: 'var(--c-400)' }}> or drag and drop</span>
              </label>
              <p className="text-xs mt-2" style={{ color: 'var(--c-500)' }}>ZIP, PDF, DOCX up to 100MB</p>
              {digitalFile && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--green-10)', color: 'var(--green)' }}>
                  {digitalFile.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance */}
        <div className="pt-4">
          <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer border border-c700" style={{ backgroundColor: 'var(--c-800)' }}>
            <input
              type="checkbox"
              checked={form.isWorkRelatedConfirmed}
              onChange={(e) => setForm({ ...form, isWorkRelatedConfirmed: e.target.checked })}
              className="mt-1"
              style={{ accentColor: 'var(--green)' }}
              required
            />
            <span className="text-sm font-medium" style={{ color: 'var(--c-300)' }}>
              I confirm that this listing is strictly related to professional work, career development, or business tools. I understand that non-work related items will be removed and my seller account may be suspended.
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Listing
          </button>
        </div>
      </form>
    </div>
  );
}
