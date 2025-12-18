import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import '../styles/MenuPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FeaturedMenu from '../components/FeaturedMenu';

const MenuPage = () => {
  const [menu, setMenu] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [noResults, setNoResults] = useState(false);
  const { addToCart } = useCart();

  // Obtener datos del backend
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Utiliza la variable de entorno REACT_APP_API_URL si está definida.
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        const data = await response.json();

        // Organizar los datos agrupados por categoría. El backend devuelve
        // campos normalizados: id, name, description, price, status, category, image, menu.
        const groupedMenu = {};
        data.forEach(item => {
          const categoryName = item.category || 'Otros';
          if (!groupedMenu[categoryName]) groupedMenu[categoryName] = [];
          groupedMenu[categoryName].push({
            id: item.id,
            title: item.name,
            description: item.description || '',
            price: item.price,
            priceFormatted: `$${Number(item.price).toLocaleString('es-CO')}`,
            image: item.image || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
            featured: false
          });
        });

        setMenu(groupedMenu);
      } catch (error) {
        console.error('Error al cargar el menú:', error);
      }
    };

    fetchMenu();
  }, []);

  // Función para agregar al carrito
  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.image
    });
    toast.success(`${item.title} agregado al carrito`, {
      position: 'top-right',
      autoClose: 2000
    });
  };

  // Manejar el scroll suave si hay hash en la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const handleSearch = (term) => setSearchTerm(term.toLowerCase());

  const filteredMenu = useMemo(() => {
    if (!searchTerm.trim()) {
      setNoResults(false);
      return menu;
    }

    const filtered = {};
    let hasResults = false;

    Object.entries(menu).forEach(([category, items]) => {
      const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );

      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
        hasResults = true;
      }
    });

    setNoResults(!hasResults);
    return filtered;
  }, [searchTerm, menu]);

  return (
    <div className="paginamenu-wrapper">
      <Header />
      <main className="paginamenu-page">
        <div className="paginamenu-hero">
          <div className="crown-icon">👑</div>
          <h1 className="paginamenu-title">Nuestro Menú Real</h1>
          <p className="paginamenu-subtitle">Sabores auténticos con la calidad de la realeza</p>
        </div>

        {/* Especiales del día */}
        <section className="especiales-dia-section">
          <h2 className="especiales-title">Especiales del Día</h2>
          {/* Utilizamos el componente FeaturedMenu como muestra */}
          <FeaturedMenu />
        </section>

        {/* Barra de búsqueda */}
        <div className="search-section">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Buscar platos, bebidas, ingredientes..."
          />
        </div>

        {/* Mostrar mensaje si no hay resultados */}
        {noResults && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No encontramos resultados</h3>
            <p>
              No pudimos encontrar platos que coincidan con "<strong>{searchTerm}</strong>"
            </p>
            <p>Intenta con otros términos como "salchicha", "cerveza" o "postre"</p>
          </div>
        )}
        
        {Object.entries(filteredMenu).map(([category, items]) => {
          const id = category.replace(/\s+/g, '').toLowerCase();
          return (
            <div key={category} className="paginamenu-category">
              <h2 className="paginamenu-category-title" id={id}>
                {category}
              </h2>
              <div className="paginamenu-items">
                {items.map((item, index) => (
                  <div 
                    className={`paginamenu-card ${item.featured ? 'featured' : ''}`} 
                    key={index}
                  >
                    <div className="paginamenu-image">
                      <img src={item.image} alt={item.title} />
                      {item.featured && (
                        <div className="featured-badge">👑 Especialidad</div>
                      )}
                    </div>
                    <div className="paginamenu-info">
                      <h3 className="paginamenu-item-title">{item.title}</h3>
                      <p className="paginamenu-description">{item.description}</p>
                      <div className="paginamenu-footer">
                        <span className="paginamenu-price">{item.priceFormatted}</span>
                        <button 
                          className="paginamenu-add-to-cart"
                          onClick={() => handleAddToCart(item)}
                          title="Agregar al carrito"
                        >
                          <Plus size={18} />
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
};

export default MenuPage;