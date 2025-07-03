import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { apiService, Ad } from '../../services/apiService';
import './ManageAds.css';

interface NewAdForm {
  title: string;
  content: string;
  brandName: string;
  clickUrl: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  brandName?: string;
  clickUrl?: string;
}

interface ManageAdsProps {
  projectId: string;
}

const ManageAds: React.FC<ManageAdsProps> = ({ projectId }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [newAd, setNewAd] = useState<NewAdForm>({
    title: '',
    content: '',
    brandName: '',
    clickUrl: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null); // Track which project is currently loading

  useEffect(() => {
    if (projectId && projectId !== loadingRef.current) {
      loadAds();
    }
  }, [projectId]);

  const loadAds = async (forceReload = false) => {
    if (!projectId || (!forceReload && loadingRef.current === projectId)) return; // Prevent duplicate calls
    
    try {
      setLoading(true);
      loadingRef.current = projectId; // Mark this project as loading
      
      console.log(`Loading ads for project: ${projectId}`); // Debug log
      const adsData = await apiService.getAdsByProject(projectId);
      setAds(adsData);
    } catch (error) {
      console.error('Failed to load ads:', error);
      setAds([]); // Set empty array on error
    } finally {
      setLoading(false);
      loadingRef.current = null; // Reset loading state
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newAd.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!newAd.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (!newAd.brandName.trim()) {
      errors.brandName = 'Brand name is required';
    }
    
    if (!newAd.clickUrl.trim()) {
      errors.clickUrl = 'Click URL is required';
    } else if (!/^https?:\/\/.+/.test(newAd.clickUrl)) {
      errors.clickUrl = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAd = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreatingAd(true);
      
      // Prepare ad data for API call
      const adData = {
        projectId: projectId,
        title: newAd.title.trim(),
        content: newAd.content.trim(),
        brandName: newAd.brandName.trim(),
        imageUrl: '', // Optional field, can be empty
        clickUrl: newAd.clickUrl.trim(),
        isActive: true
      };

      console.log('Creating ad with payload:', adData); // Debug log
      
      // Call the POST API to create the ad
      const createdAd = await apiService.createAd(adData);
      
      console.log('Ad created successfully:', createdAd);
      
      // Reset form and close modal
      setNewAd({ title: '', content: '', brandName: '', clickUrl: '' });
      setFormErrors({});
      setIsCreateModalOpen(false);
      
      // Reload ads to show the new one
      await loadAds(true); // Force reload
      
    } catch (error) {
      console.error('Failed to create ad:', error);
      setFormErrors({ clickUrl: 'Failed to create ad. Please try again.' });
    } finally {
      setIsCreatingAd(false);
    }
  };

  const handleInputChange = (field: keyof NewAdForm, value: string) => {
    setNewAd(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteAd = (adId: string) => {
    setAdToDelete(adId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAd = async () => {
    if (!adToDelete) return;
    
    try {
      setDeletingAdId(adToDelete); // Show loading state for this specific ad
      
      console.log(`Deleting ad: ${adToDelete} for project: ${projectId}`); // Debug log
      
      // Call the DELETE API
      await apiService.deleteAd(adToDelete, projectId);
      
      console.log('Ad deleted successfully');
      
      // Reload ads to reflect the deletion
      await loadAds(true); // Force reload
      
      setIsDeleteModalOpen(false);
      setAdToDelete(null);
      
    } catch (error) {
      console.error('Failed to delete ad:', error);
      alert('Failed to delete ad. Please try again.');
    } finally {
      setDeletingAdId(null); // Reset loading state
    }
  };

  const cancelDeleteAd = () => {
    setIsDeleteModalOpen(false);
    setAdToDelete(null);
  };

  if (loading) {
    return (
      <div className="manage-ads-loading">
        <div className="spinner"></div>
        <p>Loading ads...</p>
      </div>
    );
  }

  return (
    <div className="manage-ads-container chart-card">
      <div className='button-display'>
        <button 
          className="create-ad-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          Create a New Ad
        </button>
      </div>

      {ads.length === 0 ? (
        <div className="empty-state">
          <p>Create ad to view the list</p>
        </div>
      ) : (
        <div className="ads-table-container">
          <table className="ads-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Content</th>
                <th>Brand Name</th>
                <th>Click URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td>{ad.title}</td>
                  <td>{ad.content}</td>
                  <td>{ad.brandName}</td>
                  <td>
                    <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer">
                      {ad.clickUrl}
                    </a>
                  </td>
                  <td>
                    <span className={`status-badge ${ad.isActive ? 'active' : 'inactive'}`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="action-button delete" 
                        title="Delete"
                        onClick={() => handleDeleteAd(ad.id)}
                        disabled={deletingAdId === ad.id}
                      >
                        {deletingAdId === ad.id ? (
                          <>
                            <div className="mini-spinner"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormErrors({});
        }}
        title="Create a New Ad"
        maxWidth="600px"
      >
        <div className="create-ad-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={newAd.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter ad title"
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <span className="form-error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={newAd.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter ad content"
              rows={3}
              className={formErrors.content ? 'error' : ''}
            />
            {formErrors.content && <span className="form-error-message">{formErrors.content}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="brandName">Brand Name</label>
            <input
              type="text"
              id="brandName"
              value={newAd.brandName}
              onChange={(e) => handleInputChange('brandName', e.target.value)}
              placeholder="Enter brand name"
              className={formErrors.brandName ? 'error' : ''}
            />
            {formErrors.brandName && <span className="form-error-message">{formErrors.brandName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="clickUrl">Click URL*</label>
            <input
              type="url"
              id="clickUrl"
              value={newAd.clickUrl}
              onChange={(e) => handleInputChange('clickUrl', e.target.value)}
              placeholder="https://example.com"
              className={formErrors.clickUrl ? 'error' : ''}
            />
            {formErrors.clickUrl && <span className="form-error-message">{formErrors.clickUrl}</span>}
          </div>

          <div className="form-actions">
            <button 
              className="cancel-button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </button>
            <button 
              className="add-button"
              onClick={handleCreateAd}
              disabled={isCreatingAd}
            >
              {isCreatingAd ? 'Creating...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteAd}
        title="Delete Ad"
        maxWidth="400px"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this ad?</p>
          <div className="delete-actions">
            <button
              type="button"
              onClick={confirmDeleteAd}
              className="confirm-delete-button"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={cancelDeleteAd}
              className="cancel-delete-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageAds;