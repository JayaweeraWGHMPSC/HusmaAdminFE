'use client';

import { useState } from 'react';

export default function AddNew() {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    status: 'Ongoing',
    mainImage: null,
    allImages: [],
    area: {
      enabled: false,
      details: ''
    },
    flow: {
      enabled: false,
      details: ''
    },
    bedrooms: {
      enabled: false,
      details: ''
    },
    bathrooms: {
      enabled: false,
      details: ''
    },
    customerFeedback: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [allImagesPreviews, setAllImagesPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        mainImage: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAllImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      allImages: files
    }));

    // Create previews for all images
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setAllImagesPreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddMoreImages = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      // Combine existing files with new files
      const combinedFiles = [...formData.allImages, ...newFiles];
      setFormData(prev => ({
        ...prev,
        allImages: combinedFiles
      }));

      // Create previews for new images and combine with existing previews
      const newPreviews = [];
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === newFiles.length) {
            setAllImagesPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Clear the input value to allow selecting the same files again if needed
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    // Remove from both files array and previews array
    const updatedFiles = formData.allImages.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = allImagesPreviews.filter((_, index) => index !== indexToRemove);
    
    setFormData(prev => ({
      ...prev,
      allImages: updatedFiles
    }));
    setAllImagesPreviews(updatedPreviews);
  };

  const handleOptionalFieldToggle = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        enabled: !prev[fieldName].enabled,
        details: !prev[fieldName].enabled ? prev[fieldName].details : ''
      }
    }));
  };

  const handleOptionalFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        details: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Cloudinary config (replace with your own values)
    const cloudName = 'ddptresnb'; // TODO: replace with your Cloudinary cloud name
    const uploadPreset = 'husmaprojects'; // TODO: replace with your unsigned upload preset
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Helper to upload a single file to Cloudinary
    const uploadToCloudinary = async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      return data.secure_url;
    };

    let mainImageUrl = '';
    let allImagesUrls = [];
    try {
      // Upload main image if present
      if (formData.mainImage) {
        mainImageUrl = await uploadToCloudinary(formData.mainImage);
      }
      // Upload all images if present
      if (formData.allImages.length > 0) {
        allImagesUrls = [];
        for (const file of formData.allImages) {
          const url = await uploadToCloudinary(file);
          allImagesUrls.push(url);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Image upload failed. Please try again.');
      return;
    }

    // Parse area, flow, bedrooms, bathrooms from details if enabled, else fallback to 0
    const parseNumber = (val) => {
      if (!val) return 0;
      const n = parseFloat(val);
      return isNaN(n) ? 0 : n;
    };

    const payload = {
      name: formData.projectName,
      description: formData.description,
      status: formData.status,
      mainImage: mainImageUrl,
      allImages: allImagesUrls,
      area: formData.area.enabled ? parseNumber(formData.area.details) : 0,
      flow: formData.flow.enabled ? parseNumber(formData.flow.details) : 0,
      bedrooms: formData.bedrooms.enabled ? parseNumber(formData.bedrooms.details) : 0,
      bathrooms: formData.bathrooms.enabled ? parseNumber(formData.bathrooms.details) : 0,
      customerFeedback: formData.customerFeedback
    };

    try {
      const response = await fetch('/api/projects/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = errorData.message || 'Failed to create project. Please try again.';
        alert(errorMsg);
        setIsSubmitting(false);
        return;
      }

      setShowSuccessPopup(true);
      handleReset();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData({
      projectName: '',
      description: '',
      status: 'Ongoing',
      mainImage: null,
      allImages: [],
      area: { enabled: false, details: '' },
      flow: { enabled: false, details: '' },
      bedrooms: { enabled: false, details: '' },
      bathrooms: { enabled: false, details: '' },
      customerFeedback: ''
    });
    setImagePreview(null);
    setAllImagesPreviews([]);
  };

  return (
    <div className="min-h-screen bg-white py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-8 relative">
      {showSuccessPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-80 sm:w-96 shadow-2xl border-2 border-green-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Project has been created successfully.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-husmah-primary mb-4 sm:mb-6 text-center">
            Add New Project
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ color: 'gray' }}
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ color: 'black' }}
                placeholder="Enter project name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ color: 'black' }}
                placeholder="Enter project description"
              />
            </div>

            {/* Main Image */}
            <div>
              <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-2">
                Main Image *
              </label>
              <input
                type="file"
                id="mainImage"
                accept="image/*"
                onChange={handleMainImageChange}
                disabled={isSubmitting}
                required
                style={{ color: '#7F7F7F' }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Main image preview"
                    className="max-w-xs h-48 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* All Images */}
            <div>
              <label htmlFor="allImages" className="block text-sm font-medium text-gray-700 mb-2">
                All Project Images
              </label>
              <input
                type="file"
                id="allImages"
                accept="image/*"
                multiple
                onChange={handleAllImagesChange}
                disabled={isSubmitting}
                required
                style={{ color: '#7F7F7F' }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              
              {/* Add More Images Button - Show only if there are already some images */}
              {formData.allImages.length > 0 && (
                <div className="mt-3">
                  <label htmlFor="addMoreImages" className={`inline-block ${isSubmitting ? 'pointer-events-none' : ''}`}>
                    <input
                      type="file"
                      id="addMoreImages"
                      accept="image/*"
                      multiple
                      onChange={handleAddMoreImages}
                      disabled={isSubmitting}
                      style={{ color: 'gray' }}
                      className="hidden"
                    />
                    <span className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors cursor-pointer text-sm font-medium ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      + Add More Images
                    </span>
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    Total: {formData.allImages.length} image{formData.allImages.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {allImagesPreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Image Previews:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {allImagesPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                          className={`absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100 ${isSubmitting ? 'cursor-not-allowed opacity-30' : ''}`}
                          title="Remove image"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Area */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Area Details</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('area')}
                  disabled={isSubmitting}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.area.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {formData.area.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.area.enabled && (
                <textarea
                  value={formData.area.details}
                  onChange={(e) => handleOptionalFieldChange('area', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ color: 'black' }}
                  placeholder="Enter area details (e.g., 2500 sq ft, land area, built-up area, etc.)"
                />
              )}
              {!formData.area.enabled && (
                <p className="text-gray-500 text-sm">None - Click &quot;Add Details&quot; to include area information</p>
              )}
            </div>

            {/* Flow */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Flow Details</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('flow')}
                  disabled={isSubmitting}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.flow.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {formData.flow.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.flow.enabled && (
                <textarea
                  value={formData.flow.details}
                  onChange={(e) => handleOptionalFieldChange('flow', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ color: 'black' }}
                  placeholder="Enter flow details (e.g., layout flow, room connections, circulation patterns, etc.)"
                />
              )}
              {!formData.flow.enabled && (
                <p className="text-gray-500 text-sm">None - Click &quot;Add Details&quot; to include flow information</p>
              )}
            </div>

            {/* Bedrooms */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Bedrooms</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('bedrooms')}
                  disabled={isSubmitting}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.bedrooms.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {formData.bedrooms.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.bedrooms.enabled && (
                <textarea
                  value={formData.bedrooms.details}
                  onChange={(e) => handleOptionalFieldChange('bedrooms', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ color: 'black' }}
                  placeholder="Enter bedroom details (e.g., 3 bedrooms, master bedroom with en-suite, etc.)"
                />
              )}
              {!formData.bedrooms.enabled && (
                <p className="text-gray-500 text-sm">None - Click &quot;Add Details&quot; to include bedroom information</p>
              )}
            </div>

            {/* Number of Bathrooms */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Number of Bathrooms</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('bathrooms')}
                  disabled={isSubmitting}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.bathrooms.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {formData.bathrooms.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.bathrooms.enabled && (
                <textarea
                  value={formData.bathrooms.details}
                  onChange={(e) => handleOptionalFieldChange('bathrooms', e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ color: 'black' }}
                  placeholder="Enter bathroom details (e.g., 2 bathrooms, 1 en-suite, powder room, etc.)"
                />
              )}
              {!formData.bathrooms.enabled && (
                <p className="text-gray-500 text-sm">None - Click &quot;Add Details&quot; to include bathroom information</p>
              )}
            </div>

            {/* Customer Feedback */}
            <div>
              <label htmlFor="customerFeedback" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Feedback
              </label>
              <textarea
                id="customerFeedback"
                name="customerFeedback"
                value={formData.customerFeedback}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ color: 'black' }}
                placeholder="Enter customer feedback and testimonials"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-husmah-primary text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md transition-colors font-medium text-sm sm:text-base ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-husmah-primary-dark'}`}
              >
                {isSubmitting ? 'Processing...' : 'Add Project'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className={`flex-1 bg-gray-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md transition-colors font-medium text-sm sm:text-base ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-600'}`}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}