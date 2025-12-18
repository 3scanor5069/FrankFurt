// src/pages/MenuDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/MenuDetail.css';

const allItems = [
  {
    id: 'lasagna',
    title: 'Beef Lasagna',
    description: 'Delicious layers of pasta, beef, tomato sauce, and cheese.',
    ingredients: ['Beef', 'Pasta', 'Tomato sauce', 'Cheese', 'Spices'],
    price: '$13.75',
    image: '/images/lasagna.jpg',
  },
  {
    id: 'tiramisu',
    title: 'Tiramisu',
    description: 'Classic Italian dessert with mascarpone, coffee, and cocoa.',
    ingredients: ['Mascarpone', 'Coffee', 'Ladyfingers', 'Cocoa', 'Sugar'],
    price: '$6.99',
    image: '/images/tiramisu.jpg',
  },
];

const MenuDetail = () => {
  const { id } = useParams();
  const item = allItems.find((p) => p.id === id);
  const { addToCart } = useCart();

  if (!item) return <p style={{ padding: '50px' }}>Item not found.</p>;

  return (
    <div className="menu-detail">
      <img src={item.image} alt={item.title} />
      <div className="detail-info">
        <h1>{item.title}</h1>
        <p className="description">{item.description}</p>
        <h3>Ingredients:</h3>
        <ul>
          {item.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
        <p className="price">{item.price}</p>
        <button onClick={() => addToCart(item)}>Add to Order</button>
      </div>
    </div>
  );
};

export default MenuDetail;
