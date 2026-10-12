import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from '../../router/Router';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Play,
  AlertCircle,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Upload,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';
import { getOutfitById, createOutfit, updateOutfit } from '../../firebase/services/outfits';
import {
  getProductsByOutfitId,
  createProduct,
  deleteProductsByOutfitId,
} from '../../firebase/services/products';
import { uploadOutfitMedia, validateMediaFile } from '../../firebase/services/storage';
import {
  getAllCategories,
  createCustomCategory,
  STARTER_CATEGORIES,
} from '../../firebase/services/categories';
import {
  PRODUCT_CATEGORY_GROUPS,
  ALL_PRODUCT_CATEGORIES,
} from '../../utils/productCategories';
import { MediaType, Category, CategoryGroup } from '../../types/schema';

interface ProductItemState {
  id?: string;
  name: string;
  retailer: string;
  category?: string;
  retailerLogoUrl?: string;
  isCustomRetailer?: boolean;
  isCustomCategory?: boolean;
  price: string;
  currency: string;
  affiliateUrl: string;
  imageUrl: string;
  sortOrder: number;
}

const INDIAN_RETAILERS = [
  'Amazon India',
  'Flipkart',
  'Myntra',
  'Meesho',
  'Shoppers Stop',
  'Nicobar',
  'Fabindia',
  'Zara India',
  'H&M India',
  'Ajio Luxe',
  'Tata CLiQ Luxury',
  'Other (Custom)',
];

export const AdminOutfitEditorPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isEditMode = pathname.includes('/edit');
  const outfitIdFromUrl = isEditMode
    ? pathname.replace('/admin/outfits/', '').replace('/edit', '')
    : '';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Outfit Fields
  const [outfitId, setOutfitId] = useState('OUT-001');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Streetwear');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  // Media Management Fields
  const [heroMediaType, setHeroMediaType] = useState<MediaType>('image');
  const [heroMediaUrl, setHeroMediaUrl] = useState('');
  const [heroThumbnailUrl, setHeroThumbnailUrl] = useState('');
  const [heroMediaAlt, setHeroMediaAlt] = useState('');

  // Media Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Dynamic Categories & Custom Occasion Creation State
  const [availableCategories, setAvailableCategories] = useState<Category[]>(STARTER_CATEGORIES);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState<CategoryGroup>('Occasions');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Load available categories on component mount
  useEffect(() => {
    let isMounted = true;
    getAllCategories().then((cats) => {
      if (isMounted) setAvailableCategories(cats);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler to create a custom occasion/category without code deployments
  const handleCreateOccasion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await createCustomCategory({
        name: newCatName.trim(),
        group: newCatGroup,
        description: newCatDesc.trim() || undefined,
      });
      setAvailableCategories((prev) => [created, ...prev]);
      setCategory(created.name);
      setSuccessMsg(`Category "${created.name}" created and selected!`);
      setShowCreateCategoryModal(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      setErrorMsg(`Failed to create category: ${err.message}`);
    } finally {
      setCreatingCategory(false);
    }
  };

  // Product Items
  const [products, setProducts] = useState<ProductItemState[]>([
    {
      name: '',
      retailer: 'Amazon India',
      category: 'Shirt',
      retailerLogoUrl: '',
      isCustomRetailer: false,
      isCustomCategory: false,
      price: '',
      currency: 'INR',
      affiliateUrl: '',
      imageUrl: '',
      sortOrder: 1,
    },
  ]);

  // Load existing data if editing
  useEffect(() => {
    if (!isEditMode || !outfitIdFromUrl) return;

    async function loadData() {
      try {
        const existing = await getOutfitById(outfitIdFromUrl);
        if (existing) {
          setOutfitId(existing.id);
          setSlug(existing.slug);
          setTitle(existing.title);
          setDescription(existing.description || '');
          setCategory(existing.category);
          setTagsInput(existing.tags?.join(', ') || '');
          setStatus(existing.status);

          // Resolve media fields with backwards compatibility
          setHeroMediaType(existing.heroMediaType || 'image');
          setHeroMediaUrl(existing.heroMediaUrl || existing.heroImageUrl || '');
          setHeroThumbnailUrl(existing.heroThumbnailUrl || '');
          setHeroMediaAlt(existing.heroMediaAlt || '');

          // Load products
          const items = await getProductsByOutfitId(existing.id);
          if (items.length > 0) {
            setProducts(
              items.map((p, idx) => {
                const isKnownRetailer = INDIAN_RETAILERS.includes(p.retailer);
                const isKnownCategory = p.category ? ALL_PRODUCT_CATEGORIES.includes(p.category) : true;
                return {
                  id: p.id,
                  name: p.name,
                  retailer: p.retailer,
                  category: p.category || '',
                  retailerLogoUrl: p.retailerLogoUrl || '',
                  isCustomRetailer: !isKnownRetailer,
                  isCustomCategory: !isKnownCategory,
                  price: p.price ? String(p.price) : '',
                  currency: p.currency || 'INR',
                  affiliateUrl: p.affiliateUrl,
                  imageUrl: p.imageUrl || '',
                  sortOrder: p.sortOrder || idx + 1,
                };
              })
            );
          }
        } else {
          setErrorMsg(`Outfit ${outfitIdFromUrl} not found in database.`);
        }
      } catch (err: any) {
        setErrorMsg(`Failed to load outfit: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isEditMode, outfitIdFromUrl]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode && !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 80);
      setSlug(generated);
    }
  };

  const handleAddProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        name: '',
        retailer: 'Amazon India',
        category: 'Shirt',
        retailerLogoUrl: '',
        isCustomRetailer: false,
        price: '',
        currency: 'INR',
        affiliateUrl: '',
        imageUrl: '',
        sortOrder: prev.length + 1,
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveProductUp = (index: number) => {
    if (index === 0) return;
    setProducts((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveProductDown = (index: number) => {
    if (index === products.length - 1) return;
    setProducts((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleProductChange = (index: number, field: keyof ProductItemState, value: any) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRetailerSelect = (index: number, val: string) => {
    if (val === 'Other (Custom)') {
      handleProductChange(index, 'isCustomRetailer', true);
      handleProductChange(index, 'retailer', '');
    } else {
      handleProductChange(index, 'isCustomRetailer', false);
      handleProductChange(index, 'retailer', val);
    }
  };

  const handleProductCategorySelect = (index: number, val: string) => {
    if (val === 'Other (Custom)') {
      handleProductChange(index, 'isCustomCategory', true);
      handleProductChange(index, 'category', '');
    } else {
      handleProductChange(index, 'isCustomCategory', false);
      handleProductChange(index, 'category', val);
    }
  };

  // Device file upload handler (Image or Video)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadStatusMsg(null);

    const validation = validateMediaFile(file, heroMediaType);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file format');
      return;
    }

    // Set immediate preview
    const localPreview = URL.createObjectURL(file);
    setHeroMediaUrl(localPreview);
    setHeroMediaType(validation.detectedType);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusMsg(`Uploading ${file.name} to persistent storage...`);

    try {
      const result = await uploadOutfitMedia(file, outfitId || 'temp', {
        expectedType: validation.detectedType,
        onProgress: (pct) => setUploadProgress(pct),
      });
      setHeroMediaUrl(result.downloadUrl);
      setHeroMediaType(result.mediaType);
      setUploadStatusMsg('Uploaded successfully! Media is saved to persistent storage.');
      setSuccessMsg('Media uploaded successfully to Firebase Storage.');
    } catch (uploadErr: any) {
      setErrorMsg(uploadErr.message || 'Media upload failed.');
      setUploadStatusMsg(null);
      // Revoke broken preview
      setHeroMediaUrl('');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  // Video poster upload handler
  const handlePosterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const validation = validateMediaFile(file, 'image');
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid poster image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusMsg(`Uploading poster ${file.name}...`);

    try {
      const result = await uploadOutfitMedia(file, `${outfitId || 'temp'}-poster`, {
        expectedType: 'image',
        onProgress: (pct) => setUploadProgress(pct),
      });
      setHeroThumbnailUrl(result.downloadUrl);
      setUploadStatusMsg('Poster image uploaded successfully to persistent storage.');
    } catch (err: any) {
      setErrorMsg(`Poster upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = () => {
    setHeroMediaUrl('');
    setUploadStatusMsg(null);
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedId = outfitId.trim().toUpperCase();
    if (!/^OUT-[0-9]{3,}$/.test(trimmedId)) {
      setErrorMsg('Outfit ID must follow the standard format: OUT-001, OUT-002, etc.');
      return;
    }

    // Reject duplicate outfit IDs on creation
    if (!isEditMode) {
      try {
        const existing = await getOutfitById(trimmedId);
        if (existing) {
          setErrorMsg(`Outfit ID "${trimmedId}" already exists. Please choose a unique look identifier (e.g. OUT-00X).`);
          return;
        }
      } catch (checkErr: any) {
        console.warn('ID collision pre-check warning:', checkErr);
      }
    }

    const trimmedSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      setErrorMsg('Slug must be URL-safe (lowercase letters, numbers, and dashes only).');
      return;
    }

    if (!title.trim() || title.length < 3) {
      setErrorMsg('Outfit title must be at least 3 characters.');
      return;
    }

    if (heroMediaUrl.startsWith('blob:')) {
      setErrorMsg('Media upload is still in progress. Please wait for upload to complete before saving.');
      return;
    }

    if (!heroMediaUrl.trim()) {
      setErrorMsg('Please upload an image or video, or provide a valid Hero Media URL.');
      return;
    }

    const parsedProducts: Array<{
      name: string;
      retailer: string;
      category?: string;
      retailerLogoUrl?: string;
      price?: number;
      currency: string;
      affiliateUrl: string;
      imageUrl?: string;
      sortOrder: number;
    }> = [];

    for (let idx = 0; idx < products.length; idx++) {
      const p = products[idx];
      if (!p.name.trim() && !p.retailer.trim()) continue; // skip blank empty draft row

      if (!p.name.trim()) {
        setErrorMsg(`Product #${idx + 1} is missing a name.`);
        return;
      }
      if (!p.retailer.trim()) {
        setErrorMsg(`Product "${p.name.trim()}" is missing a retailer.`);
        return;
      }

      let parsedPrice: number | undefined = undefined;
      const rawPrice = (p.price || '').trim();
      if (rawPrice !== '') {
        const num = parseFloat(rawPrice);
        if (isNaN(num) || num < 0) {
          setErrorMsg(`Product "${p.name.trim()}" has an invalid price "${rawPrice}". Please enter a valid positive number or leave it blank.`);
          return;
        }
        parsedPrice = num;
      }

      parsedProducts.push({
        name: p.name.trim(),
        retailer: p.retailer.trim(),
        category: p.category?.trim() || undefined,
        retailerLogoUrl: p.retailerLogoUrl?.trim() || undefined,
        price: parsedPrice,
        currency: p.currency || 'INR',
        affiliateUrl: p.affiliateUrl.trim(),
        imageUrl: p.imageUrl.trim() || undefined,
        sortOrder: idx + 1,
      });
    }

    if (parsedProducts.length === 0) {
      setErrorMsg('Please specify at least one product with name and retailer for "SHOP THE LOOK".');
      return;
    }

    for (const p of parsedProducts) {
      if (!p.affiliateUrl.startsWith('http://') && !p.affiliateUrl.startsWith('https://')) {
        setErrorMsg(`Product "${p.name}" has an invalid affiliate URL (must start with https:// or http://).`);
        return;
      }
    }

    const finalStatus = targetStatus || status;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    setSaving(true);
    try {
      const outfitPayload: any = {
        id: trimmedId,
        slug: trimmedSlug,
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        heroMediaType,
        heroMediaUrl: heroMediaUrl.trim(),
        heroImageUrl: heroMediaType === 'image' ? heroMediaUrl.trim() : (heroThumbnailUrl.trim() || heroMediaUrl.trim()),
        heroThumbnailUrl: heroThumbnailUrl.trim() || null,
        heroMediaAlt: heroMediaAlt.trim() || null,
        status: finalStatus,
      };

      if (isEditMode) {
        await updateOutfit(trimmedId, outfitPayload);
        await deleteProductsByOutfitId(trimmedId);
      } else {
        await createOutfit(outfitPayload);
      }

      for (let i = 0; i < parsedProducts.length; i++) {
        const p = parsedProducts[i];
        const prodId = `${trimmedId}-P${i + 1}`;
        await createProduct(prodId, {
          outfitId: trimmedId,
          name: p.name,
          retailer: p.retailer,
          category: p.category,
          retailerLogoUrl: p.retailerLogoUrl,
          price: p.price,
          currency: p.currency,
          affiliateUrl: p.affiliateUrl,
          imageUrl: p.imageUrl || null,
          sortOrder: p.sortOrder,
        });
      }

      setSuccessMsg(`Outfit ${trimmedId} saved successfully as ${finalStatus.toUpperCase()}!`);
      setTimeout(() => {
        navigate('/admin/outfits');
      }, 1500);
    } catch (err: any) {
      let friendlyError = err.message || 'An error occurred while saving.';
      // Parse JSON from handleFirestoreError if present
      try {
        const parsedJson = JSON.parse(err.message);
        if (parsedJson && parsedJson.error) {
          friendlyError = parsedJson.error;
        }
      } catch {
        // Not a JSON string, retain friendly message
      }
      setErrorMsg(`Failed to save outfit: ${friendlyError}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#66615B]">Loading outfit editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DDD0]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#66615B] mb-1">
            <Link to="/admin/outfits" className="hover:text-[#171717] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Outfits</span>
            </Link>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-[#171717] tracking-tight">
            {isEditMode ? `Edit Look: ${outfitId}` : 'Create New Look'}
          </h1>
          <p className="text-xs text-[#66615B] mt-1">
            Configure outfit identifier, hero image or video, and external affiliate products.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-[#E5DDD0] bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] text-xs font-semibold transition cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Publish Look'}</span>
          </button>
        </div>
      </div>

      {/* Notices */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Details + Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Outfit Info */}
        <div className="lg:col-span-7 space-y-6 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5DDD0] shadow-xs">
          <h2 className="text-base font-semibold text-[#171717] border-b border-[#E5DDD0] pb-3">
            1. Outfit Details & Look ID
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717]">
                Look Identifier <span className="text-[#A77B3D]">*</span>
              </label>
              <input
                type="text"
                disabled={isEditMode}
                value={outfitId}
                onChange={(e) => setOutfitId(e.target.value.toUpperCase())}
                placeholder="OUT-001"
                className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#171717] outline-none focus:border-[#CDA66B] disabled:opacity-60"
              />
              <span className="text-[10px] text-[#66615B]">Format: OUT-001</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#171717]">
                  Category / Occasion <span className="text-[#A77B3D]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCreateCategoryModal(true)}
                  className="text-[11px] text-[#A77B3D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Occasion</span>
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
              >
                {/* Dynamically grouped categories */}
                {(['Everyday', 'Occasions', 'Seasonal', 'Style', 'Custom'] as CategoryGroup[]).map((grp) => {
                  const inGroup = availableCategories.filter((c) => (c.group || 'Custom') === grp);
                  if (inGroup.length === 0) return null;
                  return (
                    <optgroup key={grp} label={grp}>
                      {inGroup.map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#171717]">
              Outfit Title <span className="text-[#A77B3D]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. The Linen Minimalist: Heritage & Ease"
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#171717]">
              URL Slug <span className="text-[#A77B3D]">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="mumbai-resort-linen-streetwear"
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#171717] outline-none focus:border-[#CDA66B]"
            />
            <span className="text-[10px] text-[#66615B] font-mono">
              Public page: /outfit/{slug || '...'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#171717]">
              Styling Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the styling notes, occasion, or inspiration..."
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#171717]">Tags (comma-separated, max 10)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Linen, Summer, Casual, Streetwear"
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
            />
          </div>
        </div>

        {/* Right Side: Flexible Hero Media Management (Image vs Video) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5DDD0] space-y-5 shadow-xs">
          <div className="border-b border-[#E5DDD0] pb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#171717]">
              2. Hero Media Management
            </h2>
            <span className="text-[10px] text-[#A77B3D] font-semibold uppercase tracking-wider">
              {heroMediaType === 'video' ? 'Video Reel' : 'Photography'}
            </span>
          </div>

          {/* Media Format Toggle: Image vs Video */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#171717] block">Media Type</label>
            <div className="grid grid-cols-2 gap-2 bg-[#F7F3EB] p-1 rounded-xl border border-[#E5DDD0]">
              <button
                type="button"
                onClick={() => setHeroMediaType('image')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  heroMediaType === 'image'
                    ? 'bg-[#FFFFFF] text-[#171717] shadow-xs'
                    : 'text-[#66615B] hover:text-[#171717]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#CDA66B]" />
                <span>Image Look</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroMediaType('video')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  heroMediaType === 'video'
                    ? 'bg-[#FFFFFF] text-[#171717] shadow-xs'
                    : 'text-[#66615B] hover:text-[#171717]'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-[#CDA66B]" />
                <span>Video Reel</span>
              </button>
            </div>
          </div>

          {/* Device File Upload with Progress */}
          <div className="space-y-2 p-4 bg-[#F7F3EB]/70 border border-[#E5DDD0] rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#CDA66B]" />
                <span>Upload {heroMediaType === 'video' ? 'Video File' : 'Image File'}</span>
              </label>
              <span className="text-[10px] text-[#66615B]">
                {heroMediaType === 'video' ? 'MP4, WebM, MOV (Max 50MB)' : 'JPG, PNG, WebP (Max 10MB)'}
              </span>
            </div>

            <div className="relative">
              <input
                type="file"
                disabled={isUploading}
                accept={heroMediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'}
                onChange={handleFileSelect}
                className="w-full text-xs text-[#66615B] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#CDA66B] file:text-[#FFFFFF] hover:file:bg-[#A77B3D] file:cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Upload Progress Bar */}
            {isUploading && uploadProgress !== null && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-[#171717]">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[#A77B3D]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Uploading to Firebase Storage...</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-[#CDA66B]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#E5DDD0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#CDA66B] h-full transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Status / Success Feedback */}
            {uploadStatusMsg && !isUploading && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{uploadStatusMsg}</span>
              </div>
            )}
          </div>

          {/* Primary Media URL (Auto-filled on upload or manual input) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#171717]">
                {heroMediaType === 'video' ? 'Video File URL (Persistent / CDN) *' : 'Image URL (Persistent / CDN) *'}
              </label>
              {heroMediaUrl && (
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="text-[10px] text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Media</span>
                </button>
              )}
            </div>
            <input
              type="url"
              required
              value={heroMediaUrl}
              onChange={(e) => setHeroMediaUrl(e.target.value)}
              placeholder={heroMediaType === 'video' ? 'https://example.com/reel.mp4' : 'https://example.com/look.jpg'}
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
            />
            <span className="text-[10px] text-[#66615B] block">
              Auto-populated when uploading a file from your device, or paste a high-resolution CDN link.
            </span>
          </div>

          {/* Video Poster Thumbnail Option */}
          {heroMediaType === 'video' && (
            <div className="space-y-2 p-3 bg-[#F7F3EB]/50 border border-[#E5DDD0] rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#171717]">
                  Video Poster / Thumbnail Image
                </label>
                <span className="text-[10px] text-[#66615B]">Shown in gallery grid</span>
              </div>
              <input
                type="file"
                disabled={isUploading}
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePosterSelect}
                className="w-full text-xs text-[#66615B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#EFE6D8] file:text-[#171717] hover:file:bg-[#E5DDD0] file:cursor-pointer disabled:opacity-50"
              />
              <input
                type="url"
                value={heroThumbnailUrl}
                onChange={(e) => setHeroThumbnailUrl(e.target.value)}
                placeholder="https://example.com/poster.jpg (or upload above)"
                className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-xl px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
              />
            </div>
          )}

          {/* Interactive Media Preview Box */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#66615B]">Interactive Media Preview</label>
              {heroMediaUrl && (
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Media Active
                </span>
              )}
            </div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#F7F3EB] border border-[#E5DDD0] flex items-center justify-center relative">
              {heroMediaUrl ? (
                heroMediaType === 'video' ? (
                  <video
                    src={heroMediaUrl}
                    poster={heroThumbnailUrl || undefined}
                    controls
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={heroMediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover object-top"
                    onError={() => setErrorMsg('Hero media URL could not be loaded.')}
                  />
                )
              ) : (
                <div className="text-center text-[#66615B] p-6 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-[#66615B]" />
                  <span className="text-xs block font-medium">No media selected</span>
                  <span className="text-[11px] text-[#A77B3D] block">Upload a file or paste a media URL above</span>
                </div>
              )}
              {outfitId && (
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="bg-[#171717]/90 text-[#CDA66B] font-mono text-xs font-bold px-2.5 py-0.5 rounded shadow">
                    {outfitId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: SHOP THE LOOK Products Sub-form */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5DDD0] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[#171717]">
              3. Individual Products ("SHOP THE LOOK")
            </h2>
            <p className="text-xs text-[#66615B]">
              Add individual garments and accessories with separate affiliate destination URLs.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center gap-1.5 bg-[#F7F3EB] hover:bg-[#EFE6D8] text-[#171717] text-xs font-semibold px-4 py-2 rounded-xl border border-[#E5DDD0] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#CDA66B]" />
            <span>Add Piece</span>
          </button>
        </div>

        <div className="space-y-4">
          {products.map((item, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 rounded-xl bg-[#F7F3EB]/60 border border-[#E5DDD0] space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#A77B3D] font-bold">
                  Piece #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveProductUp(index)}
                    className="p-1 rounded text-[#66615B] hover:text-[#171717] disabled:opacity-30 disabled:hover:text-[#66615B] transition cursor-pointer"
                    title="Move piece up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === products.length - 1}
                    onClick={() => handleMoveProductDown(index)}
                    className="p-1 rounded text-[#66615B] hover:text-[#171717] disabled:opacity-30 disabled:hover:text-[#66615B] transition cursor-pointer"
                    title="Move piece down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-[#66615B] hover:text-rose-600 transition p-1 cursor-pointer ml-1"
                      title="Remove piece"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[11px] font-medium text-[#171717]">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    placeholder="e.g. Relaxed Oversized Flax Linen Camp Shirt"
                    className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                  />
                </div>

                {/* Clothing Category Selector */}
                <div className="sm:col-span-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-[#171717]">Clothing Category</label>
                    {item.isCustomCategory ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleProductChange(index, 'isCustomCategory', false);
                          handleProductChange(index, 'category', 'Shirt');
                        }}
                        className="text-[10px] text-[#66615B] hover:text-[#171717] underline shrink-0 cursor-pointer"
                      >
                        Select list
                      </button>
                    ) : null}
                  </div>
                  {!item.isCustomCategory ? (
                    <select
                      value={item.category || ''}
                      onChange={(e) => handleProductCategorySelect(index, e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                    >
                      <option value="">Select category...</option>
                      {PRODUCT_CATEGORY_GROUPS.map((grp) => (
                        <optgroup key={grp.groupName} label={grp.groupName}>
                          {grp.items.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={item.category || ''}
                        onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                        placeholder="e.g. Bandhgala, Waistcoat"
                        className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                      />
                    </div>
                  )}
                </div>

                {/* Retailer Selector for Indian Market */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-[#171717]">Retailer Partner *</label>
                  {!item.isCustomRetailer ? (
                    <select
                      value={item.retailer}
                      onChange={(e) => handleRetailerSelect(index, e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                    >
                      {INDIAN_RETAILERS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={item.retailer}
                        onChange={(e) => handleProductChange(index, 'retailer', e.target.value)}
                        placeholder="Enter retailer name"
                        className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleProductChange(index, 'isCustomRetailer', false)}
                        className="px-2 text-[10px] text-[#66615B] hover:text-[#171717] underline shrink-0"
                      >
                        Select list
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-medium text-[#171717]">Price (optional)</label>
                  <div className="flex gap-1">
                    <select
                      value={item.currency}
                      onChange={(e) => handleProductChange(index, 'currency', e.target.value)}
                      className="bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-2 py-2 text-xs text-[#171717] outline-none font-mono"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                      placeholder="3450"
                      className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-1">
                  <label className="text-[11px] font-medium text-[#171717]">Affiliate Destination URL *</label>
                  <input
                    type="url"
                    required
                    value={item.affiliateUrl}
                    onChange={(e) => handleProductChange(index, 'affiliateUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#171717]">Product Image URL (optional)</label>
                  <input
                    type="url"
                    value={item.imageUrl}
                    onChange={(e) => handleProductChange(index, 'imageUrl', e.target.value)}
                    placeholder="https://... (thumbnail preview)"
                    className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#171717]">Retailer Logo URL (optional)</label>
                  <input
                    type="url"
                    value={item.retailerLogoUrl || ''}
                    onChange={(e) => handleProductChange(index, 'retailerLogoUrl', e.target.value)}
                    placeholder="https://... (custom retailer mark)"
                    className="w-full bg-[#FFFFFF] border border-[#E5DDD0] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DDD0]">
        <Link
          to="/admin/outfits"
          className="px-4 py-2.5 rounded-xl border border-[#E5DDD0] bg-[#FFFFFF] hover:bg-[#F7F3EB] text-xs text-[#66615B] hover:text-[#171717]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-[#E5DDD0] bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] text-xs font-semibold cursor-pointer"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave('published')}
          disabled={saving}
          className="bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          {saving ? 'Saving...' : 'Publish to Catalog'}
        </button>
      </div>

      {/* Create Occasion / Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DDD0] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0]">
              <h3 className="text-base font-semibold text-[#171717]">
                Create Occasion or Category
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateCategoryModal(false)}
                className="p-1 text-[#66615B] hover:text-[#171717] rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOccasion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#171717]">
                  Category / Occasion Name <span className="text-[#A77B3D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Diwali 2026, College Fest, Eid Collection"
                  className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#171717]">
                  Group / Classification
                </label>
                <select
                  value={newCatGroup}
                  onChange={(e) => setNewCatGroup(e.target.value as CategoryGroup)}
                  className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
                >
                  <option value="Occasions">Occasions (Festivals, Events, Weddings)</option>
                  <option value="Everyday">Everyday (Casual, Streetwear, Daily)</option>
                  <option value="Seasonal">Seasonal (Summer, Winter, Monsoon)</option>
                  <option value="Style">Style (Old Money, Y2K, Athleisure)</option>
                  <option value="Custom">Custom / Special Edition</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#171717]">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Curated festive fits, ethnic silhouettes and celebratory styling."
                  className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] outline-none focus:border-[#CDA66B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DDD0] bg-[#FFFFFF] hover:bg-[#F7F3EB] text-xs text-[#66615B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory || !newCatName.trim()}
                  className="bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {creatingCategory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create & Select</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOutfitEditorPage;
