'use client';

import { useState } from 'react';

export default function AddNew() {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Here you would typically send the data to your backend API
    alert('Project data submitted! Check console for details.');
  };

  const handleReset = () => {
    setFormData({
      projectName: '',
      description: '',
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-husmah-primary mb-8 text-center">
            Add New Project
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
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
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
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
                required
                style={{ color: '#7F7F7F' }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
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
                style={{ color: '#7F7F7F' }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
              />
              
              {/* Add More Images Button - Show only if there are already some images */}
              {formData.allImages.length > 0 && (
                <div className="mt-3">
                  <label htmlFor="addMoreImages" className="inline-block">
                    <input
                      type="file"
                      id="addMoreImages"
                      accept="image/*"
                      multiple
                      onChange={handleAddMoreImages}
                      style={{ color: 'gray' }}
                      className="hidden"
                    />
                    <span className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors cursor-pointer text-sm font-medium">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allImagesPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.area.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {formData.area.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.area.enabled && (
                <textarea
                  value={formData.area.details}
                  onChange={(e) => handleOptionalFieldChange('area', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
                  placeholder="Enter area details (e.g., 2500 sq ft, land area, built-up area, etc.)"
                />
              )}
              {!formData.area.enabled && (
                <p className="text-gray-500 text-sm">None - Click "Add Details" to include area information</p>
              )}
            </div>

            {/* Flow */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Flow Details</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('flow')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.flow.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {formData.flow.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.flow.enabled && (
                <textarea
                  value={formData.flow.details}
                  onChange={(e) => handleOptionalFieldChange('flow', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
                  placeholder="Enter flow details (e.g., layout flow, room connections, circulation patterns, etc.)"
                />
              )}
              {!formData.flow.enabled && (
                <p className="text-gray-500 text-sm">None - Click "Add Details" to include flow information</p>
              )}
            </div>

            {/* Bedrooms */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Bedrooms</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('bedrooms')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.bedrooms.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {formData.bedrooms.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.bedrooms.enabled && (
                <textarea
                  value={formData.bedrooms.details}
                  onChange={(e) => handleOptionalFieldChange('bedrooms', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
                  placeholder="Enter bedroom details (e.g., 3 bedrooms, master bedroom with en-suite, etc.)"
                />
              )}
              {!formData.bedrooms.enabled && (
                <p className="text-gray-500 text-sm">None - Click "Add Details" to include bedroom information</p>
              )}
            </div>

            {/* Number of Bathrooms */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Number of Bathrooms</label>
                <button
                  type="button"
                  onClick={() => handleOptionalFieldToggle('bathrooms')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    formData.bathrooms.enabled
                      ? 'bg-husmah-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {formData.bathrooms.enabled ? 'Clear' : 'Add Details'}
                </button>
              </div>
              {formData.bathrooms.enabled && (
                <textarea
                  value={formData.bathrooms.details}
                  onChange={(e) => handleOptionalFieldChange('bathrooms', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
                  placeholder="Enter bathroom details (e.g., 2 bathrooms, 1 en-suite, powder room, etc.)"
                />
              )}
              {!formData.bathrooms.enabled && (
                <p className="text-gray-500 text-sm">None - Click "Add Details" to include bathroom information</p>
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-husmah-primary focus:border-transparent"
                style={{ color: 'black' }}
                placeholder="Enter customer feedback and testimonials"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-husmah-primary text-white py-3 px-6 rounded-md hover:bg-husmah-primary-dark transition-colors font-medium"
              >
                Add Project
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-colors font-medium"
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