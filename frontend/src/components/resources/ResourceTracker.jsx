import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaLaptop, FaCog, FaBox } from 'react-icons/fa';
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from '../../utils/constants';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

const ResourceTracker = ({ resources = [], onAddResource, onUpdateResource, onDeleteResource }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: RESOURCE_TYPES.HUMAN,
    allocated: 0,
    available: 0,
    unit: 'hours'
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case RESOURCE_TYPES.HUMAN:
        return FaUsers;
      case RESOURCE_TYPES.EQUIPMENT:
        return FaCog;
      case RESOURCE_TYPES.SOFTWARE:
        return FaLaptop;
      default:
        return FaBox;
    }
  };

  const getUtilizationColor = (allocated, available) => {
    if (available === 0) return 'bg-secondary-200';
    const utilization = (allocated / available) * 100;
    if (utilization >= 90) return 'bg-danger-500';
    if (utilization >= 70) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getUtilizationPercentage = (allocated, available) => {
    if (available === 0) return 0;
    return Math.min((allocated / available) * 100, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingResource) {
      onUpdateResource(editingResource._id, formData);
    } else {
      onAddResource(formData);
    }
    
    handleCloseModal();
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      allocated: resource.allocated,
      available: resource.available,
      unit: resource.unit
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
    setFormData({
      name: '',
      type: RESOURCE_TYPES.HUMAN,
      allocated: 0,
      available: 0,
      unit: 'hours'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'allocated' || name === 'available' ? Number(value) : value
    }));
  };

  const totalResources = resources.length;
  const overAllocated = resources.filter(r => r.allocated > r.available).length;
  const fullyUtilized = resources.filter(r => r.allocated === r.available && r.available > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">Resource Allocation</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Track and manage project resources
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          icon={<FaPlus />}
        >
          Add Resource
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FaBox className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-600">Total Resources</p>
                <p className="text-2xl font-bold text-secondary-900">{totalResources}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <FaCog className="h-5 w-5 text-warning-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-600">Fully Utilized</p>
                <p className="text-2xl font-bold text-secondary-900">{fullyUtilized}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <FaUsers className="h-5 w-5 text-danger-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-600">Over-allocated</p>
                <p className="text-2xl font-bold text-secondary-900">{overAllocated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-secondary-900">Resources</h3>
        </div>
        <div className="card-body">
          {resources.length === 0 ? (
            <div className="text-center py-8">
              <FaBox className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <h3 className="text-sm font-medium text-secondary-900 mb-2">
                No resources added
              </h3>
              <p className="text-sm text-secondary-500 mb-4">
                Start by adding resources to track their allocation.
              </p>
              <Button onClick={() => setShowModal(true)} icon={<FaPlus />}>
                Add First Resource
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                const utilization = getUtilizationPercentage(resource.allocated, resource.available);
                const utilizationColor = getUtilizationColor(resource.allocated, resource.available);
                
                return (
                  <div
                    key={resource._id || resource.name}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                  >
                    <div className="flex items-center flex-1">
                      <div className="p-2 bg-secondary-100 rounded-lg mr-4">
                        <IconComponent className="h-5 w-5 text-secondary-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-secondary-900">{resource.name}</h4>
                          <Badge variant="secondary" size="sm">
                            {RESOURCE_TYPE_LABELS[resource.type]}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-secondary-600">
                          <span>
                            Allocated: {resource.allocated} {resource.unit}
                          </span>
                          <span>
                            Available: {resource.available} {resource.unit}
                          </span>
                          <span>
                            Utilization: {utilization.toFixed(1)}%
                          </span>
                        </div>
                        
                        {/* Utilization bar */}
                        <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${utilizationColor}`}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="p-2 text-secondary-400 hover:text-primary-600 rounded"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteResource(resource._id || resource.name)}
                        className="p-2 text-secondary-400 hover:text-danger-600 rounded"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Resource Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Resource Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter resource name"
              required
            />
          </div>

          <div>
            <label className="form-label">Resource Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
              required
            >
              {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Allocated</label>
              <input
                type="number"
                name="allocated"
                value={formData.allocated}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="form-label">Available</label>
              <input
                type="number"
                name="available"
                value={formData.available}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="units">Units</option>
              <option value="licenses">Licenses</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingResource ? 'Update' : 'Add'} Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResourceTracker;
