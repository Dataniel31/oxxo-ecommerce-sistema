import React from 'react';
import { Filter } from 'lucide-react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      <div className="container">
        <div className="filter-header">
          <Filter size={20} />
          <h3>Categorías</h3>
        </div>
        
        <div className="category-list">
          <button
            className={`category-btn ${selectedCategory === 'todos' ? 'active' : ''}`}
            onClick={() => onCategoryChange('todos')}
          >
            Todos los productos
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
              <span className="category-count">{category.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;