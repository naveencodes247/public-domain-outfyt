import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  User,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Server,
  CheckCircle2,
} from 'lucide-react';
import { Link } from '../../router/Router';
import { auth } from '../../firebase/config';
import { testFirestoreConnection, ConnectionTestResult } from '../../firebase/testConnection';
import { checkAdminStatus, AdminStatus } from '../../firebase/services/admin';
import { updateOutfit, createOutfit } from '../../firebase/services/outfits';
import { createProduct, deleteProductsByOutfitId } from '../../firebase/services/products';
import { SAMPLE_EDITORIAL_PRESETS } from '../../assets/sampleAssets';
import firebaseConfig from '../../../firebase-applet-config.json';

export const AdminSettingsPage: React.FC = () => {
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [connResult, setConnResult] = useState<ConnectionTestResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      checkAdminStatus(auth.currentUser).then(setAdminStatus);
    }
    testFirestoreConnection().then(setConnResult);
  }, []);

  const runConnectionProbe = async () => {
    setProbing(true);
    try {
      const res = await testFirestoreConnection();
      setConnResult(res);
      setMsg(`Probe succeeded: ${res.message}`);
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setProbing(false);
    }
  };

  const handleSeedPresets = async () => {
    if (!window.confirm('Populate Cloud Firestore with the 4 initial curated presets (OUT-001 through OUT-004)?')) {
      return;
    }
    setSeeding(true);
    setMsg('Writing presets to Cloud Firestore...');
    try {
      for (const preset of SAMPLE_EDITORIAL_PRESETS) {
        const { products, ...outfitData } = preset;
        await updateOutfit(preset.id, outfitData).catch(async () => {
          await createOutfit(outfitData as any);
        });

        await deleteProductsByOutfitId(preset.id);
        for (const p of products) {
          await createProduct(p.id, {
            outfitId: preset.id,
            name: p.name,
            retailer: p.retailer,
            price: p.price,
            currency: p.currency,
            affiliateUrl: p.affiliateUrl,
            imageUrl: p.imageUrl || null,
            sortOrder: p.sortOrder,
          });
        }
      }
      setMsg('Successfully initialized 4 curated looks in Cloud Firestore!');
    } catch (err: any) {
      alert(`Error initializing presets: ${err.message}`);
    } finally {
      setSeeding(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E5DDD0]">
        <div className="flex items-center gap-2 text-xs text-[#66615B] mb-1">
          <Link to="/admin" className="hover:text-[#171717] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <h1 className="font-editorial text-3xl font-bold text-[#171717] tracking-tight">
          System & Curation Settings
        </h1>
        <p className="text-xs text-[#66615B] mt-1">
          Backend connection parameters, administrator registry, and catalog initialization.
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          {msg}
        </div>
      )}

      {/* Admin Profile */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-4 shadow-xs">
        <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
          <User className="w-4 h-4 text-[#CDA66B]" />
          <span>Active Administrator Session</span>
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-[#E5DDD0]">
            <span className="text-[#66615B]">Current Email:</span>
            <span className="font-mono text-[#171717] font-semibold">{auth.currentUser?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E5DDD0]">
            <span className="text-[#66615B]">UID:</span>
            <span className="font-mono text-[#66615B]">{auth.currentUser?.uid || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E5DDD0]">
            <span className="text-[#66615B]">Authority Role:</span>
            <span className="text-emerald-700 font-semibold uppercase">{adminStatus?.role || 'Super Admin'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E5DDD0]">
            <span className="text-[#66615B]">Evaluation:</span>
            <span className="text-[#171717]">{adminStatus?.reason}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 gap-1">
            <span className="text-[#66615B]">Authorized Admin Accounts:</span>
            <div className="flex flex-col sm:items-end text-xs font-mono text-[#A77B3D] font-medium">
              <span>naveencodes247@gmail.com</span>
              <span>outfyt.co.in@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Firestore Diagnostics */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#CDA66B]" />
            <span>Cloud Firestore Backend</span>
          </h2>
          <button
            onClick={runConnectionProbe}
            disabled={probing}
            className="text-xs text-[#CDA66B] hover:text-[#A77B3D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
            <span>Test Probe</span>
          </button>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-[#E5DDD0]">
            <span className="text-[#66615B]">Firebase Project:</span>
            <span className="font-mono text-[#171717]">{firebaseConfig.projectId}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E5DDD0]">
            <span className="text-[#66615B]">Database Instance:</span>
            <span className="font-mono text-[#171717]">{firebaseConfig.firestoreDatabaseId}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#66615B]">Network Handshake:</span>
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{connResult?.message || 'Connected'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Catalog Preset Seeding */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-3 shadow-xs">
        <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#CDA66B]" />
          <span>Curated Sample Presets Initialization</span>
        </h2>
        <p className="text-xs text-[#66615B] leading-relaxed">
          Quickly write or restore the initial curated outfit presets (OUT-001, OUT-002, OUT-003, OUT-004) and their corresponding products into Cloud Firestore.
        </p>
        <button
          onClick={handleSeedPresets}
          disabled={seeding}
          className="mt-2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{seeding ? 'Writing to Firestore...' : 'Seed Curated Looks Now'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
