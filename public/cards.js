    async function loadProducts() {
      try {
        const response = await fetch('http://localhost:5000/api/products'); // Adjust base URL if needed
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        const container = document.getElementById('productsContainer');

        if (products.length === 0) {
          container.innerHTML = '<p>No products available.</p>';
          return;
        }

        container.innerHTML = ''; // Clear previous content
        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';

          card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">₹${product.price}</p>
            <span class="category">${product.category}</span>
          `;

          container.appendChild(card);
        });

      } catch (error) {
        console.error('Error:', error);
        document.getElementById('productsContainer').innerHTML = '<p>Error loading products.</p>';
      }
    }

    window.onload = loadProducts;
