'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiAuth, api } from '@/lib/api';
import {
  ArrowLeft, Upload, Save, Loader2, Cpu, Package, Wrench, ImagePlus, X,
} from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);

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
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    checkSellerStatus();
  }, []);

  const checkSellerStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }
      const res = await apiAuth.withToken(token).get('/shop/seller/status');
      const status = res.data?.sellerStatus || res.data?.data?.sellerStatus || 'none';
      if (status !== 'approved') {
        router.push('/seller/apply');
        return;
      }
      await fetchCategories();
    } catch (err) {
      console.error('Failed to verify seller status', err);
      router.push('/seller/apply');
    } finally {
      setChecking(false);
    }
  };

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

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - productImages.length;
    const toAdd = files.slice(0, remaining);

    setProductImages(prev => [...prev, ...toAdd]);

    // Generate preview URLs
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
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

      if (product?.id) {
        // 2. Upload digital file if digital listing
        if (form.listingType === 'digital' && digitalFile) {
          const formData = new FormData();
          formData.append('file', digitalFile);

          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/shop/products/${product.id}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
        }

        // 3. Upload product images (for all listing types)
        for (const imageFile of productImages) {
          const formData = new FormData();
          formData.append('image', imageFile);

          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/shop/products/${product.id}/images`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

      router.push('/seller');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:p-8 pb-16 max-w-3xl mx-auto">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 mt-1">Add a new template, tool, or professional service.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Listing Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, listingType: 'digital' }))}
              className={`p-4 rounded-xl border text-left transition-all ${form.listingType === 'digital' ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-20 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
            >
              <Cpu className={`w-6 h-6 mb-2 ${form.listingType === 'digital' ? 'text-purple-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900 mb-1">Digital</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Files, templates, scripts</p>
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, listingType: 'physical' }))}
              className={`p-4 rounded-xl border text-left transition-all ${form.listingType === 'physical' ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <Package className={`w-6 h-6 mb-2 ${form.listingType === 'physical' ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900 mb-1">Physical</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Books, hardware, merch</p>
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, listingType: 'service' }))}
              className={`p-4 rounded-xl border text-left transition-all ${form.listingType === 'service' ? 'border-amber-500 ring-2 ring-amber-500 ring-opacity-20 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
            >
              <Wrench className={`w-6 h-6 mb-2 ${form.listingType === 'service' ? 'text-amber-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900 mb-1">Service</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Consulting, design, review</p>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-black"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-black"
              required
              minLength={20}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.categoryId}
                onChange={handleCategoryChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white text-black"
                required
              >
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={form.subcategoryId}
                onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white text-black"
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
        <div className="border-t border-gray-100 pt-8">
          <label className="block text-sm font-bold text-gray-900 mb-4">Pricing</label>

          <div className="flex gap-4 mb-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                checked={form.pricingType === 'per_unit'}
                onChange={() => setForm({ ...form, pricingType: 'per_unit' })}
                className="text-teal-600 focus:ring-teal-500"
              /> Fixed Price
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                checked={form.pricingType === 'quote_based'}
                onChange={() => setForm({ ...form, pricingType: 'quote_based' })}
                className="text-teal-600 focus:ring-teal-500"
              /> Request Quote
            </label>
          </div>

          {form.pricingType === 'per_unit' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white font-bold text-black"
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-black"
                    required
                    min={1}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (Optional)</label>
                <input
                  type="text"
                  value={form.priceUnit}
                  onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                  placeholder="e.g. Hour, Page, Item"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-black"
                />
              </div>
            </div>
          )}
        </div>

        {/* Product Images — Available for ALL listing types */}
        <div className="border-t border-gray-100 pt-8">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Product Images
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Upload up to 5 images to showcase your {form.listingType === 'digital' ? 'product preview' : form.listingType === 'service' ? 'service portfolio' : 'product'}. JPEG, PNG, WebP or GIF, max 5MB each.
          </p>

          {/* Preview Grid */}
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {productImages.length < 5 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
              <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAddImages}
                className="hidden"
                id="product-images-upload"
                multiple
              />
              <label htmlFor="product-images-upload" className="cursor-pointer">
                <span className="font-bold text-teal-600 hover:text-teal-500">Click to upload images</span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <p className="text-xs text-gray-400 mt-2">
                {productImages.length}/5 images added
              </p>
            </div>
          )}
        </div>

        {/* Digital File Upload — Only for digital listings */}
        {form.listingType === 'digital' && (
          <div className="border-t border-gray-100 pt-8">
            <label className="block text-sm font-bold text-gray-900 mb-2">Digital File</label>
            <p className="text-sm text-gray-500 mb-4">Upload the file that buyers will download upon purchase. Held securely in private storage.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <input
                type="file"
                onChange={(e) => setDigitalFile(e.target.files?.[0] || null)}
                className="hidden"
                id="digital-upload"
                required
              />
              <label htmlFor="digital-upload" className="cursor-pointer">
                <span className="font-bold text-teal-600 hover:text-teal-500">Click to upload</span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <p className="text-xs text-gray-400 mt-2">ZIP, PDF, DOCX up to 100MB</p>
              {digitalFile && (
                <div className="mt-4 inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {digitalFile.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance */}
        <div className="border-t border-gray-100 pt-8">
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={form.isWorkRelatedConfirmed}
              onChange={(e) => setForm({ ...form, isWorkRelatedConfirmed: e.target.checked })}
              className="mt-1 text-teal-600 focus:ring-teal-500 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              I confirm that this listing is strictly related to professional work, career development, or business tools. I understand that non-work related items will be removed and my seller account may be suspended.
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Publish Listing
          </button>
        </div>
      </form>
    </div>
  );
}
