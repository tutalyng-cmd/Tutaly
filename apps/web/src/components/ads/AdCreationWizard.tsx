"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Users, LayoutTemplate, CheckCircle, Info, UploadCloud, Briefcase, ShoppingBag, Globe, Loader2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

type Step = 'campaign' | 'adset' | 'ad' | 'review';

interface Estimation {
  audience_size: number;
  estimated_daily_reach: number;
  estimated_daily_clicks: number;
}

export default function AdCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('campaign');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const [formData, setFormData] = useState({
    // Campaign
    goal: 'awareness',
    isSpecialAdCategory: false,
    
    // Ad Set
    target_countries: [] as string[],
    target_states: [] as string[],
    target_industries: [] as string[],
    target_roles: [] as string[],
    target_user_types: [] as string[],
    placementType: 'automatic',
    placements: [] as string[],
    daily_budget: 2000,
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: '',
    run_continuously: false,
    
    // Ad
    format: 'banner',
    creativeFile: null as File | null,
    destination_url: '',
    primary_text: '',
    job_id: '',
    product_id: '',
    
    // Payment
    paymentGateway: 'paystack' as 'paystack' | 'flutterwave',
  });

  // Fetch Reach Estimation
  useEffect(() => {
    const fetchEstimation = async () => {
      setIsEstimating(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await apiAuth.withToken(token || '').post('/ads/campaigns/estimate-reach', {
          daily_budget: formData.daily_budget,
          format: formData.format,
          target_countries: formData.target_countries,
          target_states: formData.target_states,
          target_industries: formData.target_industries,
          target_roles: formData.target_roles,
          target_user_types: formData.target_user_types,
        });
        setEstimation(res.data);
      } catch (err) {
        console.error('Failed to fetch estimation');
      } finally {
        setIsEstimating(false);
      }
    };

    const debounceTimer = setTimeout(fetchEstimation, 800);
    return () => clearTimeout(debounceTimer);
  }, [
    formData.daily_budget, 
    formData.format, 
    formData.target_countries, 
    formData.target_states,
    formData.target_industries,
    formData.target_roles,
    formData.target_user_types
  ]);

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotalBudget = () => {
    if (formData.run_continuously) return formData.daily_budget * 30; // 30-day assumption
    if (!formData.starts_at || !formData.ends_at) return formData.daily_budget;
    const start = new Date(formData.starts_at);
    const end = new Date(formData.ends_at);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    return days * formData.daily_budget;
  };

  const handleLaunch = async () => {
    if (formData.daily_budget < 1000) {
      return alert("Minimum daily budget is ₦1,000");
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const headers = { Authorization: `Bearer ${token}` };
      
      let imageUrl = '';
      if (formData.creativeFile) {
        const uploadData = new FormData();
        uploadData.append('file', formData.creativeFile);
        const uploadRes = await fetch('/api/ads/campaigns/upload-creative', {
          method: 'POST',
          body: uploadData,
          headers
        });
        if (uploadRes.ok) {
          const uData = await uploadRes.json();
          imageUrl = uData.previewUrl || uData.path;
        }
      }

      const placements = formData.placementType === 'automatic' 
        ? ['homepage_top', 'jobs_sidebar', 'connect_sidebar', 'shop_top'] 
        : formData.placements;

      const payload = {
        goal: formData.goal,
        format: formData.format,
        target_countries: formData.target_countries.length ? formData.target_countries : null,
        target_states: formData.target_states.length ? formData.target_states : null,
        target_industries: formData.target_industries.length ? formData.target_industries : null,
        target_roles: formData.target_roles.length ? formData.target_roles : null,
        target_user_types: formData.target_user_types.length ? formData.target_user_types : null,
        placements,
        daily_budget: formData.daily_budget,
        total_budget: calculateTotalBudget(),
        starts_at: formData.starts_at,
        ends_at: formData.run_continuously ? null : formData.ends_at,
        run_continuously: formData.run_continuously,
        image_url: imageUrl,
        destination_url: formData.destination_url,
        alt_text: formData.primary_text,
        job_id: formData.format === 'sponsored_job' ? formData.job_id : null,
        product_id: formData.format === 'sponsored_product' ? formData.product_id : null,
        paymentGateway: formData.paymentGateway,
      };

      const res = await apiAuth.withToken(token).post('/ads/campaigns', payload);
      
      if (res.data?.payment?.redirectUrl) {
        window.location.href = res.data.payment.redirectUrl;
      } else {
        router.push('/admin/ads?success=true');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create campaign');
      setIsSubmitting(false);
    }
  };

  const renderStepsNav = () => (
    <div className="flex flex-col space-y-4">
      <div className={`p-4 rounded-xl border-l-4 transition-all ${currentStep === 'campaign' ? 'bg-white border-green shadow-sm' : 'border-transparent text-c500 hover:bg-c100 cursor-pointer'}`} onClick={() => setCurrentStep('campaign')}>
        <div className="flex items-center gap-3">
          <Target className={`w-5 h-5 ${currentStep === 'campaign' ? 'text-green' : 'text-c400'}`} />
          <div className="text-left">
            <h3 className={`font-bold ${currentStep === 'campaign' ? 'text-c900' : 'text-c600'}`}>1. Campaign</h3>
            <p className="text-xs text-c500">Objective & Goals</p>
          </div>
        </div>
      </div>
      <div className={`p-4 rounded-xl border-l-4 transition-all ${currentStep === 'adset' ? 'bg-white border-green shadow-sm' : 'border-transparent text-c500 hover:bg-c100 cursor-pointer'}`} onClick={() => setCurrentStep('adset')}>
        <div className="flex items-center gap-3">
          <Users className={`w-5 h-5 ${currentStep === 'adset' ? 'text-green' : 'text-c400'}`} />
          <div className="text-left">
            <h3 className={`font-bold ${currentStep === 'adset' ? 'text-c900' : 'text-c600'}`}>2. Ad Set</h3>
            <p className="text-xs text-c500">Audience & Budget</p>
          </div>
        </div>
      </div>
      <div className={`p-4 rounded-xl border-l-4 transition-all ${currentStep === 'ad' ? 'bg-white border-green shadow-sm' : 'border-transparent text-c500 hover:bg-c100 cursor-pointer'}`} onClick={() => setCurrentStep('ad')}>
        <div className="flex items-center gap-3">
          <LayoutTemplate className={`w-5 h-5 ${currentStep === 'ad' ? 'text-green' : 'text-c400'}`} />
          <div className="text-left">
            <h3 className={`font-bold ${currentStep === 'ad' ? 'text-c900' : 'text-c600'}`}>3. Ad</h3>
            <p className="text-xs text-c500">Creative & Format</p>
          </div>
        </div>
      </div>
      <div className={`p-4 rounded-xl border-l-4 transition-all ${currentStep === 'review' ? 'bg-white border-green shadow-sm' : 'border-transparent text-c500 hover:bg-c100 cursor-pointer'}`} onClick={() => setCurrentStep('review')}>
        <div className="flex items-center gap-3">
          <CheckCircle className={`w-5 h-5 ${currentStep === 'review' ? 'text-green' : 'text-c400'}`} />
          <div className="text-left">
            <h3 className={`font-bold ${currentStep === 'review' ? 'text-c900' : 'text-c600'}`}>4. Review</h3>
            <p className="text-xs text-c500">Launch & Pay</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEstimator = () => (
    <div className="bg-white rounded-xl shadow-sm border border-c200 p-6 sticky top-24">
      <h3 className="font-bold text-c900 flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-green" /> Audience Definition
      </h3>
      
      {isEstimating ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-green" />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-c500">Audience Size</span>
              <span className="font-bold text-c900">
                {estimation?.audience_size ? (estimation.audience_size > 1000000 ? `${(estimation.audience_size/1000000).toFixed(1)}M` : `${(estimation.audience_size/1000).toFixed(1)}K`) : '--'}
              </span>
            </div>
            <div className="h-2 w-full bg-c100 rounded-full overflow-hidden">
              <div className="h-full bg-gold shadow-glow-gold w-3/5 mx-auto"></div>
            </div>
            <p className="text-xs text-c400 mt-2 text-center">Your audience selection is broad enough.</p>
          </div>

          <div className="pt-4 border-t border-c100">
            <h4 className="text-sm font-bold text-c900 mb-3">Estimated Daily Results</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-c600">Reach</span>
                <span className="font-bold text-c900">{estimation?.estimated_daily_reach?.toLocaleString() || '--'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-c600">Clicks</span>
                <span className="font-bold text-green">{estimation?.estimated_daily_clicks?.toLocaleString() || '--'}</span>
              </div>
            </div>
            <p className="text-xs text-c400 mt-3 leading-tight flex gap-1">
              <Info className="w-3 h-3 shrink-0" />
              Estimates are based on past performance and your daily budget of ₦{formData.daily_budget.toLocaleString()}.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-6">
      
      {/* Left Sidebar - Navigation */}
      <div className="w-full md:w-64 shrink-0 hidden md:block">
        <div className="sticky top-24">
          <h2 className="text-xl font-bold text-c900 mb-6">Create Ad</h2>
          {renderStepsNav()}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {currentStep === 'campaign' && (
          <div className="bg-white rounded-2xl shadow-sm border border-c200 overflow-hidden">
            <div className="p-6 border-b border-c100">
              <h2 className="text-2xl font-bold text-c900">Campaign Objective</h2>
              <p className="text-c500 mt-1">Choose the business goal that matters most to you.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'awareness', title: 'Awareness', desc: 'Show your ads to people who are most likely to remember them.', icon: Globe },
                  { id: 'traffic', title: 'Traffic', desc: 'Send people to a destination, like your website or app.', icon: LayoutTemplate },
                  { id: 'leads', title: 'Leads (Jobs)', desc: 'Collect leads or applications for your business or open roles.', icon: Briefcase },
                  { id: 'sales', title: 'Sales (Products)', desc: 'Find people likely to purchase your goods or services.', icon: ShoppingBag }
                ].map(obj => (
                  <div 
                    key={obj.id}
                    onClick={() => updateForm('goal', obj.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.goal === obj.id ? 'border-green bg-green/50' : 'border-c200 hover:border-green'}`}
                  >
                    <obj.icon className={`w-8 h-8 mb-3 ${formData.goal === obj.id ? 'text-green' : 'text-c400'}`} />
                    <h3 className={`font-bold text-lg mb-1 ${formData.goal === obj.id ? 'text-green' : 'text-c900'}`}>{obj.title}</h3>
                    <p className="text-sm text-c500 leading-relaxed">{obj.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-c100">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="specialCategory"
                    checked={formData.isSpecialAdCategory}
                    onChange={(e) => updateForm('isSpecialAdCategory', e.target.checked)}
                    className="mt-1 w-4 h-4 text-green border-c300 rounded focus:ring-green"
                  />
                  <label htmlFor="specialCategory" className="cursor-pointer">
                    <span className="font-bold text-c900 block">Declare Special Ad Category</span>
                    <span className="text-sm text-c500">Check this if your ad is related to Employment, Housing, or Credit to comply with targeting policies.</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 bg-c100 border-t border-c100 flex justify-end">
              <button onClick={() => setCurrentStep('adset')} className="px-6 py-2.5 bg-green text-white font-bold rounded-lg hover:bg-green transition-colors">
                Next: Ad Set
              </button>
            </div>
          </div>
        )}

        {currentStep === 'adset' && (
          <div className="bg-white rounded-2xl shadow-sm border border-c200 overflow-hidden">
            <div className="p-6 border-b border-c100">
              <h2 className="text-2xl font-bold text-c900">Audience & Budget</h2>
              <p className="text-c500 mt-1">Define who you want to see your ads and how much you want to spend.</p>
            </div>
            <div className="p-6 space-y-8">
              
              {/* Budget */}
              <section>
                <h3 className="text-lg font-bold text-c900 mb-4">Budget & Schedule</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-c700 mb-1">Daily Budget (₦)</label>
                    <input 
                      type="number" 
                      min="1000"
                      value={formData.daily_budget}
                      onChange={(e) => updateForm('daily_budget', Math.max(1000, Number(e.target.value)))}
                      className="w-full max-w-xs px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green focus:border-green"
                    />
                    <p className="text-xs text-c500 mt-1">Minimum budget is ₦1,000 per day.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-c700 mb-1">Start Date</label>
                      <input 
                        type="date" 
                        value={formData.starts_at}
                        onChange={(e) => updateForm('starts_at', e.target.value)}
                        className="w-full px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green"
                      />
                    </div>
                    {!formData.run_continuously && (
                      <div>
                        <label className="block text-sm font-medium text-c700 mb-1">End Date</label>
                        <input 
                          type="date" 
                          value={formData.ends_at}
                          onChange={(e) => updateForm('ends_at', e.target.value)}
                          className="w-full px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="runCont"
                      checked={formData.run_continuously}
                      onChange={(e) => updateForm('run_continuously', e.target.checked)}
                      className="w-4 h-4 text-green rounded border-c300"
                    />
                    <label htmlFor="runCont" className="text-sm text-c700">Run this campaign continuously</label>
                  </div>
                </div>
              </section>

              <hr className="border-c100" />

              {/* Audience */}
              <section>
                <h3 className="text-lg font-bold text-c900 mb-4">Audience</h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-c700 mb-1">Locations</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Lagos, Abuja, Nigeria"
                      className="w-full px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green"
                      onBlur={(e) => {
                        if(e.target.value) updateForm('target_states', [e.target.value]);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-c700 mb-1">Detailed Targeting (Industries / Roles)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Technology, Software Engineer"
                      className="w-full px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green"
                      onBlur={(e) => {
                        if(e.target.value) updateForm('target_industries', [e.target.value]);
                      }}
                    />
                  </div>
                </div>
              </section>

              <hr className="border-c100" />

              {/* Placements */}
              <section>
                <h3 className="text-lg font-bold text-c900 mb-4">Placements</h3>
                <div className="space-y-3">
                  <div 
                    onClick={() => updateForm('placementType', 'automatic')}
                    className={`p-4 rounded-xl border-2 cursor-pointer ${formData.placementType === 'automatic' ? 'border-green bg-green' : 'border-c200'}`}
                  >
                    <h4 className="font-bold text-c900">Advantage+ Placements (Recommended)</h4>
                    <p className="text-sm text-c500 mt-1">We will automatically allocate your budget across multiple placements to maximize results.</p>
                  </div>
                  <div 
                    onClick={() => updateForm('placementType', 'manual')}
                    className={`p-4 rounded-xl border-2 cursor-pointer ${formData.placementType === 'manual' ? 'border-green bg-green' : 'border-c200'}`}
                  >
                    <h4 className="font-bold text-c900">Manual Placements</h4>
                    <p className="text-sm text-c500 mt-1">Manually choose the places to show your ad.</p>
                  </div>
                </div>
              </section>

            </div>
            <div className="p-4 bg-c100 border-t border-c100 flex justify-between">
              <button onClick={() => setCurrentStep('campaign')} className="px-6 py-2.5 text-c600 font-bold hover:bg-c200 rounded-lg transition-colors">Back</button>
              <button onClick={() => setCurrentStep('ad')} className="px-6 py-2.5 bg-green text-white font-bold rounded-lg hover:bg-green transition-colors">Next: Ad Setup</button>
            </div>
          </div>
        )}

        {currentStep === 'ad' && (
          <div className="bg-white rounded-2xl shadow-sm border border-c200 overflow-hidden">
            <div className="p-6 border-b border-c100">
              <h2 className="text-2xl font-bold text-c900">Ad Creative</h2>
              <p className="text-c500 mt-1">What your ad will look like.</p>
            </div>
            <div className="p-6 space-y-8">
              
              <section>
                <h3 className="text-lg font-bold text-c900 mb-4">Ad Setup</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['banner', 'sponsored_job', 'sponsored_product'].map(fmt => (
                    <div 
                      key={fmt}
                      onClick={() => updateForm('format', fmt)}
                      className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${formData.format === fmt ? 'border-green bg-green' : 'border-c200 hover:border-green'}`}
                    >
                      <h4 className={`font-bold capitalize ${formData.format === fmt ? 'text-green' : 'text-c700'}`}>{fmt.replace('_', ' ')}</h4>
                    </div>
                  ))}
                </div>
              </section>

              {formData.format === 'banner' && (
                <section>
                  <h3 className="text-lg font-bold text-c900 mb-4">Ad Creative</h3>
                  <div className="border-2 border-dashed border-c300 rounded-xl p-8 text-center bg-c100 hover:bg-c100 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => updateForm('creativeFile', e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-c400 mx-auto mb-3" />
                    <span className="text-green font-medium">Click to upload media</span>
                    <span className="block text-sm text-c500 mt-1">PNG, JPG up to 2MB</span>
                    {formData.creativeFile && (
                      <div className="mt-4 text-sm font-bold text-green bg-green py-2 px-4 rounded-full inline-block">
                        Selected: {formData.creativeFile.name}
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-lg font-bold text-c900 mb-4">Destination</h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-c700 mb-1">Destination URL</label>
                    <input 
                      type="url" 
                      placeholder="https://yourwebsite.com"
                      value={formData.destination_url}
                      onChange={(e) => updateForm('destination_url', e.target.value)}
                      className="w-full px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-c700 mb-1">Primary Text (Optional)</label>
                    <textarea 
                      placeholder="Tell people what your ad is about..."
                      rows={3}
                      value={formData.primary_text}
                      onChange={(e) => updateForm('primary_text', e.target.value)}
                      className="w-full px-4 py-2 border border-c300 rounded-lg focus:ring-2 focus:ring-green resize-none"
                    />
                  </div>
                </div>
              </section>

            </div>
            <div className="p-4 bg-c100 border-t border-c100 flex justify-between">
              <button onClick={() => setCurrentStep('adset')} className="px-6 py-2.5 text-c600 font-bold hover:bg-c200 rounded-lg transition-colors">Back</button>
              <button onClick={() => setCurrentStep('review')} className="px-6 py-2.5 bg-green text-white font-bold rounded-lg hover:bg-green transition-colors">Next: Review</button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="bg-white rounded-2xl shadow-sm border border-c200 overflow-hidden">
            <div className="p-6 border-b border-c100">
              <h2 className="text-2xl font-bold text-c900">Review & Launch</h2>
              <p className="text-c500 mt-1">Review your campaign details before publishing.</p>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="bg-c100 rounded-xl p-6 border border-c200">
                <h3 className="font-bold text-c900 mb-4 pb-2 border-b border-c200">Campaign Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-c500">Objective:</span>
                    <span className="font-bold text-c900 capitalize">{formData.goal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-c500">Format:</span>
                    <span className="font-bold text-c900 capitalize">{formData.format.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-c500">Daily Budget:</span>
                    <span className="font-bold text-c900">₦{formData.daily_budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-c500">Schedule:</span>
                    <span className="font-bold text-c900">{formData.starts_at} {formData.run_continuously ? '(Continuous)' : `to ${formData.ends_at}`}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-c200 flex justify-between items-center">
                    <span className="font-bold text-c900 text-lg">Total Charge Today:</span>
                    <span className="font-bold text-green text-2xl">₦{calculateTotalBudget().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-c900 mb-3">Payment Method</h3>
                <div className="flex gap-4">
                  <label className={`flex-1 border-2 p-4 rounded-xl cursor-pointer flex items-center justify-between ${formData.paymentGateway === 'paystack' ? 'border-green bg-green' : 'border-c200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-current p-0.5">
                        <div className={`w-full h-full rounded-full ${formData.paymentGateway === 'paystack' ? 'bg-green' : 'bg-transparent'}`}></div>
                      </div>
                      <span className="font-bold text-c900">Paystack</span>
                    </div>
                  </label>
                  <label className={`flex-1 border-2 p-4 rounded-xl cursor-pointer flex items-center justify-between ${formData.paymentGateway === 'flutterwave' ? 'border-green bg-green' : 'border-c200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-current p-0.5">
                        <div className={`w-full h-full rounded-full ${formData.paymentGateway === 'flutterwave' ? 'bg-green' : 'bg-transparent'}`}></div>
                      </div>
                      <span className="font-bold text-c900">Flutterwave</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
            <div className="p-4 bg-c100 border-t border-c100 flex justify-between">
              <button onClick={() => setCurrentStep('ad')} disabled={isSubmitting} className="px-6 py-2.5 text-c600 font-bold hover:bg-c200 rounded-lg transition-colors">Back</button>
              <button onClick={handleLaunch} disabled={isSubmitting || calculateTotalBudget() <= 0} className="px-8 py-2.5 bg-green text-white font-bold rounded-lg hover:bg-green transition-colors flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isSubmitting ? 'Processing...' : `Pay ₦${calculateTotalBudget().toLocaleString()} & Publish`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Estimator */}
      <div className="w-full md:w-72 shrink-0 hidden md:block">
        {renderEstimator()}
      </div>

    </div>
  );
}
