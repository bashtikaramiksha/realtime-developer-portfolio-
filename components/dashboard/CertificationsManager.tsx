'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, Plus, Trash2, Loader, Upload, Link as LinkIcon, 
  Calendar, CheckCircle, AlertCircle, ExternalLink 
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
  imageUrl: string;
}

export default function CertificationsManager() {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Input states
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile/certifications', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCertifications(data.certifications || []);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      showToast('Failed to load certifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds the 2MB limit', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/profile/upload-certificate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setImageUrl(data.imageUrl);
        showToast('Certificate image uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch (error) {
      showToast('Network error during upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) {
      showToast('Title and Issuing Organization are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/profile/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          issuer: issuer.trim(),
          issueDate: issueDate.trim(),
          credentialUrl: credentialUrl.trim(),
          imageUrl: imageUrl.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Certification added successfully!', 'success');
        // Reset states
        setTitle('');
        setIssuer('');
        setIssueDate('');
        setCredentialUrl('');
        setImageUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        await fetchCertifications();
      } else {
        showToast(data.message || 'Failed to add certification', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/certifications?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Certification removed successfully!', 'success');
        await fetchCertifications();
      } else {
        showToast(data.message || 'Failed to remove certification', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header Panel */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 backdrop-blur-sm shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Certifications Manager</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure verify credentials, upload certificate records, and list your dynamic engineering achievements.
          </p>
        </div>
      </div>

      {/* Main Grid: Form Left, List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddCertification} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-cyan-500" />
              Add Certification
            </h4>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Certificate Title*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect"
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Issuer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Issuing Organization*</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Amazon Web Services (AWS)"
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Issue Date (e.g. Month Year)</label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="e.g. March 2026"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Credential URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Credential Verification Link</label>
              <input
                type="url"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="e.g. https://credly.com/..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Certificate Image / Badge Preview</label>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Uploading...' : imageUrl ? 'Replace Image' : 'Upload Image'}
                </button>

                {imageUrl && (
                  <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Uploaded
                  </span>
                )}
              </div>

              {imageUrl && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mt-2 bg-zinc-950 flex items-center justify-center">
                  <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-600/20"
            >
              {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Save Certification
            </button>
          </form>
        </div>

        {/* Display List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-cyan-500" />
            Configured Certifications ({certifications.length})
          </h4>

          {certifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10 p-12 text-center text-zinc-500 space-y-2">
              <Award className="h-8 w-8 text-zinc-400 mx-auto" />
              <p className="text-xs">No certifications added yet. Create one on the left!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="group rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/80 dark:bg-zinc-900/30 p-5 backdrop-blur-sm shadow-sm flex gap-4 relative">
                  
                  {/* Badge Preview */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-center">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="h-6 w-6 text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6 space-y-1">
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate" title={cert.title}>{cert.title}</h5>
                    <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 truncate">{cert.issuer}</p>
                    
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-zinc-500 font-medium">
                      {cert.issueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {cert.issueDate}
                        </span>
                      )}
                      
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 hover:text-cyan-555"
                        >
                          Verify Link
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-all shrink-0 cursor-pointer"
                    title="Remove Certification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
