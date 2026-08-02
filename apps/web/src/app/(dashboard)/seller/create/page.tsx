'use client';

import { toast } from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth, api } from '@/lib/api';
import { X, Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FormData = {
  title: string;
  description: string;
  listingType: string;
  subcategoryId: string;
  pricingType: string;
  price: string;
  currency: string;
  priceUnit: string;
  minQuantity: string;
  priceMayVary: boolean;
  isWorkRelatedConfirmed: boolean;
};

const DEFAULT_FORM_DATA: FormData = {
  title: '',
  description: '',
  listingType: 'digital',
  subcategoryId: '',
  pricingType: 'fixed',
  price: '',
  currency: 'NGN',
  priceUnit: '',
  minQuantity: '1',
  priceMayVary: false,
  isWorkRelatedConfirmed: false,
};

export default function CreateListing() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // File uploads
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    // Fetch categories on mount
    const fetchCategories = async () => {
      try {
        const res = await api.get('/shop/categories');
        const cats = res.data?.data || [];
        setCategories(cats);
        // Automatically select the first subcategory if available
        if (cats.length > 0 && cats[0].subcategories?.length > 0) {
          updateForm({ subcategoryId: cats[0].subcategories[0].id });
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDigitalFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return setErrorMsg('Title and Description are required.');
    if (!formData.subcategoryId) return setErrorMsg('Please select a category.');
    if (!formData.isWorkRelatedConfirmed) return setErrorMsg('You must confirm the listing is career/work related.');
    if (formData.pricingType !== 'quote_based' && (!formData.price || Number(formData.price) <= 0)) {
      return setErrorMsg('Price is required for fixed or per-unit pricing.');
    }
    if (formData.listingType === 'digital' && !digitalFile) {
      return setErrorMsg('Please upload a file for your digital listing.');
    }
    
    setSubmitting(true);
    setErrorMsg('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const payload: any = {
        title: formData.title,
        description: formData.description,
        listingType: formData.listingType,
        subcategoryId: formData.subcategoryId,
        pricingType: formData.pricingType,
        isWorkRelatedConfirmed: formData.isWorkRelatedConfirmed,
      };

      if (formData.pricingType !== 'quote_based') {
        payload.price = Number(formData.price);
        payload.currency = formData.currency;
      }
      
      if (formData.pricingType === 'per_unit') {
        payload.priceUnit = formData.priceUnit;
        payload.minQuantity = Number(formData.minQuantity);
        payload.priceMayVary = formData.priceMayVary;
      }

      // Create product
      const res = await apiAuth.withToken(token).post('/shop/products', payload);
      const productId = res.data.id || res.data.data?.id;

      if (!productId) {
         throw new Error("Product creation did not return an ID");
      }

      // Upload Digital File if needed
      if (formData.listingType === 'digital' && digitalFile) {
        const fileData = new FormData();
        fileData.append('file', digitalFile);
        await apiAuth.withToken(token).post(`/shop/products/${productId}/upload`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Upload Images if any
      if (imageFiles.length > 0) {
        const imgData = new FormData();
        imageFiles.forEach(img => imgData.append('image', img));
        await apiAuth.withToken(token).post(`/shop/products/${productId}/images`, imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Listing created successfully!');
      router.push('/seller');
    } catch (e) {
      const err = e as any;
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dcard max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-100)' }}>Create New Listing</h1>
        <p className="text-sm" style={{ color: 'var(--c-500)' }}>Add a new career resource, service, or digital product to the marketplace.</p>
      </div>

      {errorMsg && (
        <div className="mb-8 rounded-xl p-4 border flex items-start" style={{ borderColor: 'var(--red)', backgroundColor: 'var(--red-10)' }}>
          <p className="text-sm" style={{ color: 'var(--red)' }}>{errorMsg}</p>
        </div>
      )}

      <div className="form-section">
        <div className="form-section__title">Basic details</div>
        
        <div className="form-field">
          <label className="form-label">Listing Title <span style={{ color: 'var(--red)', marginLeft: '4px' }}>*</span></label>
          <input className="input" type="text" placeholder="e.g. 2026 Tech Resume Template" value={formData.title} onChange={e => updateForm({ title: e.target.value })} />
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Type of Listing</label>
            <select className="input" value={formData.listingType} onChange={e => updateForm({ listingType: e.target.value })}>
              <option value="digital">Digital Product (Download)</option>
              <option value="physical">Physical Item (Shipped)</option>
              <option value="service">Service (Consulting / Mentorship)</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Category</label>
            <select className="input" value={formData.subcategoryId} onChange={e => updateForm({ subcategoryId: e.target.value })}>
              {categories.map(cat => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.subcategories?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__title">Description</div>
        <div className="form-field">
          <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-600)' }}>
            <ReactQuill 
              theme="snow" 
              value={formData.description} 
              onChange={val => updateForm({ description: val })}
              className="border-0"
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>
      </div>

      <div className="form-section mt-14">
        <div className="form-section__title">Pricing & Format</div>
        
        <div className="form-field">
          <label className="form-label">Pricing Strategy</label>
          <div className="flex p-1 rounded-lg w-full border mb-4" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-700)' }}>
            <button type="button" onClick={() => updateForm({ pricingType: 'fixed' })} className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", formData.pricingType === 'fixed' ? "shadow-sm" : "opacity-60")} style={formData.pricingType === 'fixed' ? { backgroundColor: 'var(--c-700)', color: 'var(--c-100)' } : { color: 'var(--c-400)' }}>
              Fixed Price
            </button>
            <button type="button" onClick={() => updateForm({ pricingType: 'per_unit' })} className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", formData.pricingType === 'per_unit' ? "shadow-sm" : "opacity-60")} style={formData.pricingType === 'per_unit' ? { backgroundColor: 'var(--c-700)', color: 'var(--c-100)' } : { color: 'var(--c-400)' }}>
              Per Unit / Hour
            </button>
            <button type="button" onClick={() => updateForm({ pricingType: 'quote_based' })} className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", formData.pricingType === 'quote_based' ? "shadow-sm" : "opacity-60")} style={formData.pricingType === 'quote_based' ? { backgroundColor: 'var(--c-700)', color: 'var(--c-100)' } : { color: 'var(--c-400)' }}>
              Custom Quote
            </button>
          </div>
        </div>

        {formData.pricingType !== 'quote_based' && (
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Price</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="input" style={{ width: '100px', flexShrink: 0 }} value={formData.currency} onChange={e => updateForm({ currency: e.target.value })}>
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <input className="input" style={{ flex: 1 }} type="number" placeholder="e.g. 5000" value={formData.price} onChange={e => updateForm({ price: e.target.value })} />
              </div>
            </div>

            {formData.pricingType === 'per_unit' && (
              <div className="form-field">
                <label className="form-label">Unit (e.g. "hour", "session")</label>
                <input className="input" type="text" placeholder="e.g. hour" value={formData.priceUnit} onChange={e => updateForm({ priceUnit: e.target.value })} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-section__title">Media & Files</div>
        
        {formData.listingType === 'digital' && (
          <div className="form-field border rounded-lg p-6 text-center border-dashed mb-6 flex flex-col items-center justify-center" style={{ borderColor: 'var(--c-600)', backgroundColor: 'var(--c-800)' }}>
            <Upload width={32} height={32} style={{ color: 'var(--c-500)', marginBottom: '12px' }} />
            <div className="font-bold mb-1" style={{ color: 'var(--c-100)' }}>Digital Deliverable File</div>
            <p className="text-xs mb-4" style={{ color: 'var(--c-400)' }}>Upload the PDF, ZIP, or DOCX that the user will receive after purchase.</p>
            <input type="file" onChange={handleFileChange} />
          </div>
        )}

        <div className="form-field border rounded-lg p-6 text-center border-dashed flex flex-col items-center justify-center" style={{ borderColor: 'var(--c-600)', backgroundColor: 'var(--c-800)' }}>
          <Upload width={32} height={32} style={{ color: 'var(--c-500)', marginBottom: '12px' }} />
          <div className="font-bold mb-1" style={{ color: 'var(--c-100)' }}>Display Images</div>
          <p className="text-xs mb-4" style={{ color: 'var(--c-400)' }}>Upload up to 5 images to show in the marketplace gallery.</p>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>
      </div>

      <div className="form-section">
        <label className="check-row flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all" style={formData.isWorkRelatedConfirmed ? { borderColor: 'var(--gold)', backgroundColor: 'var(--gold-10)' } : { borderColor: 'var(--c-700)', backgroundColor: 'var(--c-800)' }}>
          <div className="flex items-center h-6 pt-1">
             <div className={cn("filter-checkbox", formData.isWorkRelatedConfirmed ? "checked" : "")} style={formData.isWorkRelatedConfirmed ? { borderColor: 'var(--gold)', backgroundColor: 'var(--gold)' } : { borderColor: 'var(--c-500)' }} onClick={(e) => { e.preventDefault(); updateForm({ isWorkRelatedConfirmed: !formData.isWorkRelatedConfirmed }); }}></div>
          </div>
          <div className="ml-4 flex-1" onClick={(e) => { e.preventDefault(); updateForm({ isWorkRelatedConfirmed: !formData.isWorkRelatedConfirmed }); }}>
            <span className="block text-base font-bold" style={{ color: 'var(--c-100)' }}>Confirm Work/Career Focus</span>
            <span className="block text-sm mt-1" style={{ color: 'var(--c-400)' }}>I confirm this listing is directly related to professional development, career growth, or workplace productivity. Non-work-related listings will be removed.</span>
          </div>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
        <button type="button" className="btn btn--ghost" onClick={() => router.push('/seller')}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Creating...' : 'Create Listing'}</button>
      </div>

    </div>
  );
}
