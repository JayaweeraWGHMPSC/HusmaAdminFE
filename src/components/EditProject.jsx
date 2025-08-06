'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

const EditProject = ({ id, initialData, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    status: '',
    mainImage: '',
    allImages: [],
    area: 0,
    flow: 0,
    bedrooms: 0,
    bathrooms: 0,
    customerFeedback: '',
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }
      const projectData = await response.json();
      console.log('Fetched project data:', projectData);
      
      // Log image URLs for debugging
      console.log('Main image URL:', projectData.mainImage);
      console.log('Additional images:', projectData.allImages);
      
      setFormData(projectData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (id) {
      // Fetch project data if only ID is provided
      fetchProjectData();
    }
  }, [initialData, id, fetchProjectData]);

  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      // Clean up preview URLs to prevent memory leaks
      previewImages.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previewImages]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleMainImageChange = (e) => {
    if (e.target.files?.[0]) {
      try {
        const file = e.target.files[0];
        validateImageFile(file);
        setMainImageFile(file);
        setError(null); // Clear any previous errors
      } catch (validationError) {
        setError(validationError.message);
        e.target.value = ''; // Clear the input
      }
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      try {
        const files = Array.from(e.target.files);
        
        // Validate all files
        files.forEach(file => validateImageFile(file));
        
        setAdditionalImageFiles(prev => [...prev, ...files]);
        
        // Create preview URLs for new images
        const newPreviews = files.map(file => ({
          file,
          url: URL.createObjectURL(file),
          isNew: true
        }));
        setPreviewImages(prev => [...prev, ...newPreviews]);
        setError(null); // Clear any previous errors
      } catch (validationError) {
        setError(validationError.message);
        e.target.value = ''; // Clear the input
      }
    }
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setFormData(prev => ({ ...prev, mainImage: '' }));
  };

  const removeExistingImage = (imageUrl, index) => {
    // Add to removal list
    setImagesToRemove(prev => [...prev, imageUrl]);
    
    // Remove from current formData
    setFormData(prev => ({
      ...prev,
      allImages: prev.allImages.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    // Remove from preview and files
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const replaceMainImage = (e) => {
    if (e.target.files?.[0]) {
      try {
        const file = e.target.files[0];
        validateImageFile(file);
        setMainImageFile(file);
        // Clear the existing mainImage URL so the new file preview shows
        setFormData(prev => ({ ...prev, mainImage: '' }));
        setError(null); // Clear any previous errors
      } catch (validationError) {
        setError(validationError.message);
        e.target.value = ''; // Clear the input
      }
    }
  };

  const checkNetworkConnection = async () => {
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/ddptresnb/image/upload', {
        method: 'HEAD',
        mode: 'cors'
      });
      return true;
    } catch (error) {
      console.error('Network check failed:', error);
      throw new Error('Unable to connect to image upload service. Please check your internet connection.');
    }
  };

  const validateImageFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Please use JPEG, PNG, GIF, or WebP.`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds the 10MB limit.`);
    }
    
    return true;
  };

  const uploadToCloudinary = async (file) => {
    try {
      // Validate file before upload
      validateImageFile(file);
      
      console.log('Uploading file to Cloudinary:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2) + 'MB');
      
      // Try multiple upload strategies
      const uploadStrategies = [
        // Strategy 1: Try with common unsigned presets
        { preset: 'ml_default', description: 'ML Default preset' },
        { preset: 'unsigned_preset', description: 'Standard unsigned preset' },
        { preset: 'default', description: 'Default preset' },
        // Strategy 2: Try without any preset (for accounts with default unsigned uploads enabled)
        { preset: null, description: 'No preset (default unsigned)' }
      ];
      
      for (const strategy of uploadStrategies) {
        try {
          console.log(`Trying upload strategy: ${strategy.description}`);
          
          const formData = new FormData();
          formData.append('file', file);
          
          if (strategy.preset) {
            formData.append('upload_preset', strategy.preset);
          }

          const response = await fetch('https://api.cloudinary.com/v1_1/ddptresnb/image/upload', {
            method: 'POST',
            body: formData
          });

          console.log(`Upload response status for ${strategy.description}:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Cloudinary upload successful with strategy:', strategy.description, 'URL:', data.secure_url);
            return data.secure_url;
          } else {
            const errorData = await response.text();
            console.warn(`Upload strategy "${strategy.description}" failed:`, errorData);
            
            // If it's not a preset issue, break the loop
            if (!errorData.includes('Upload preset not found') && !errorData.includes('Invalid upload preset')) {
              throw new Error(`Upload failed: ${response.status} - ${errorData}`);
            }
          }
        } catch (strategyError) {
          console.warn(`Upload strategy "${strategy.description}" error:`, strategyError.message);
          
          // If it's not a preset-related error, rethrow
          if (!strategyError.message.includes('preset')) {
            throw strategyError;
          }
        }
      }
      
      // If all Cloudinary strategies failed, use development fallback
      console.warn('All Cloudinary strategies failed. Using development fallback...');
      return await uploadToFallbackService(file);
      
    } catch (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }
  };

  // Fallback upload service for development
  const uploadToFallbackService = async (file) => {
    try {
      console.log('Using fallback upload service for development...');
      
      // For development, we'll use a data URL which will persist
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Fallback upload successful. Using data URL for image.');
      console.warn('⚠️  This is a development fallback. Please configure Cloudinary for production!');
      
      return dataUrl;
    } catch (error) {
      throw new Error(`Fallback upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmPopup(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmPopup(false);
    setIsSubmitting(true);
    
    try {
      // Check network connectivity if we have images to upload
      if (mainImageFile || additionalImageFiles.length > 0) {
        console.log('Checking network connectivity...');
        await checkNetworkConnection();
      }

      // Only include the fields required by the backend
      let updatedFormData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        mainImage: formData.mainImage,
        allImages: [...formData.allImages], // Copy existing images (minus removed ones)
        area: formData.area,
        flow: formData.flow,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        customerFeedback: formData.customerFeedback
      };

      // Upload new main image if changed
      if (mainImageFile) {
        try {
          console.log('Uploading new main image...');
          const mainImageUrl = await uploadToCloudinary(mainImageFile);
          updatedFormData.mainImage = mainImageUrl;
        } catch (uploadError) {
          throw new Error(`Main image upload failed: ${uploadError.message}`);
        }
      }

      // Upload new additional images if any
      if (additionalImageFiles.length > 0) {
        try {
          console.log(`Uploading ${additionalImageFiles.length} new additional images...`);
          const additionalImageUrls = [];
          
          for (let i = 0; i < additionalImageFiles.length; i++) {
            const file = additionalImageFiles[i];
            console.log(`Uploading additional image ${i + 1}/${additionalImageFiles.length}:`, file.name);
            const url = await uploadToCloudinary(file);
            additionalImageUrls.push(url);
          }
          
          updatedFormData.allImages = [
            ...updatedFormData.allImages,
            ...additionalImageUrls
          ];
        } catch (uploadError) {
          throw new Error(`Additional images upload failed: ${uploadError.message}`);
        }
      }

      console.log('Final form data:', updatedFormData);
      console.log('Images to remove:', imagesToRemove);

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      // Clear temporary states
      setMainImageFile(null);
      setAdditionalImageFiles([]);
      setImagesToRemove([]);
      setPreviewImages([]);

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading project: {error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 mt-3 sm:mt-5">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-husmah-primary text-center">
            Edit Project
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Project updated successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Popup */}
          {error && (
            <div className="mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              style={{color: 'black'}}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={4}
              style={{color: 'black'}}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isSubmitting}
              style={{color: 'black'}}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              required
            >
              <option value="In Progress">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Main Image
            </label>
            <div className="mt-2">
              {(mainImageFile || formData.mainImage) ? (
                <div className="relative inline-block">
                  <img
                    src={mainImageFile ? URL.createObjectURL(mainImageFile) : formData.mainImage}
                    alt="Main image"
                    className="h-32 w-auto object-cover rounded-md border"
                    onError={(e) => {
                      console.error('Main image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                    onLoad={(e) => {
                      console.log('Main image loaded successfully:', e.target.src);
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = 'none';
                      }
                    }}
                  />
                  {/* Fallback placeholder when image fails to load */}
                  <div 
                    className="h-32 w-32 bg-gray-200 rounded-md border flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <div className="text-center text-gray-500">
                      <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">Image not available</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeMainImage}
                    disabled={isSubmitting}
                    className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    ×
                  </button>
                  <div className="mt-2">
                    <label className={`cursor-pointer bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 ${isSubmitting ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                      Replace Image
                      <input
                        type="file"
                        onChange={replaceMainImage}
                        disabled={isSubmitting}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-2">
                      <label className={`cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${isSubmitting ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                        Upload Main Image
                        <input
                          type="file"
                          onChange={handleMainImageChange}
                          disabled={isSubmitting}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Images
            </label>
            
            {/* Existing Images */}
            {formData.allImages.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {formData.allImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Additional image ${index + 1}`}
                        className="h-20 sm:h-24 w-full object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img, index)}
                        disabled={isSubmitting}
                        className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {previewImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">New Images to Add:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview.url}
                        alt={`New image ${index + 1}`}
                        className="h-20 sm:h-24 w-full object-cover rounded-md border border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={isSubmitting}
                        className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 bg-green-500 text-white text-xs px-1 rounded-tr">
                        NEW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Images */}
            <div className="mt-4">
              <label className={`cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block ${isSubmitting ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                + Add More Images
                <input
                  type="file"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  disabled={isSubmitting}
                  className="hidden"
                  accept="image/*"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">Select multiple images to add</p>
            </div>
          </div>

          {/* Numeric Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Area (sq ft)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                disabled={isSubmitting}
                style={{color: 'black'}}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floors
              </label>
              <input
                type="number"
                name="flow"
                value={formData.flow}
                onChange={handleInputChange}
                disabled={isSubmitting}
                style={{color: 'black'}}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                disabled={isSubmitting}
                style={{color: 'black'}}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                disabled={isSubmitting}
                style={{color: 'black'}}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Customer Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer Feedback
            </label>
            <textarea
              name="customerFeedback"
              value={formData.customerFeedback}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={3}
              style={{color: 'black'}}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Confirm Popup */}
          {showConfirmPopup && (
            <div className="my-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
                <div className="text-center mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirm Changes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to save the changes to this project?
                    {(mainImageFile || additionalImageFiles.length > 0 || imagesToRemove.length > 0) && (
                      <span className="block mt-3 text-sm">
                        {mainImageFile && <span className="block text-blue-600 mb-1">• Main image will be updated</span>}
                        {additionalImageFiles.length > 0 && <span className="block text-green-600 mb-1">• {additionalImageFiles.length} new image(s) will be added</span>}
                        {imagesToRemove.length > 0 && <span className="block text-red-600 mb-1">• {imagesToRemove.length} image(s) will be removed</span>}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPopup(false)}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmedSubmit}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 order-1 sm:order-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 order-2 sm:order-1 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md order-1 sm:order-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
