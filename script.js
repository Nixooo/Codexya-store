// Cart functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Auth Check (Synced with Firebase via localStorage)
function checkAuth() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function handleProtectedAction(e) {
    if (!checkAuth()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = 'register.html';
        return false;
    }
    return true;
}

// Update cart count display
function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Add to cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Protect Routes (Library, Publish, Cart, Profile)
    const protectedLinks = [
        'a[href="productos.html"]', // Mi Biblioteca (Index)
        'a[href="library.html"]',   // Mi Biblioteca (Other pages)
        'a[href="#publicar"]',      // Publicar (Index)
        'a[href="publish.html"]',   // Publicar (Other pages)
        '.user-btn'                 // Perfil
    ];

    protectedLinks.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.addEventListener('click', handleProtectedAction, true); // Capture phase
        });
    });

    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartCount++;
            updateCartCount();
            
            // Visual feedback
            button.textContent = '✓ Añadido';
            button.style.backgroundColor = '#4caf50';
            
            setTimeout(() => {
                button.textContent = 'Añadir al Carrito';
                button.style.backgroundColor = '';
            }, 2000);
        });
    });

    // New icon action buttons functionality
    const iconActionButtons = document.querySelectorAll('.btn-icon-action');
    
    iconActionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            cartCount++;
            updateCartCount();
            
            // Visual feedback
            const originalHTML = button.innerHTML;
            button.style.backgroundColor = '#4caf50';
            button.style.color = 'white';
            
            // Show checkmark
            button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.backgroundColor = '';
                button.style.color = '';
            }, 2000);
        });
    });

    // Quick view button functionality
    const quickViewButtons = document.querySelectorAll('.btn-quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            alert('Función de vista rápida - Próximamente');
        });
    });

    // Search button functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    function performSearch(term) {
        const products = document.querySelectorAll('.product-card');
        const searchTerm = term.toLowerCase();
        
        products.forEach(product => {
            const title = product.querySelector('.product-title').textContent.toLowerCase();
            const category = product.querySelector('.product-category').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || category.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
        
        // Scroll to products if search is performed
        if (searchTerm.length > 0) {
            const productsGrid = document.querySelector('.products-grid') || document.querySelector('.product-card').parentElement;
            productsGrid.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (searchInput) {
                performSearch(searchInput.value);
            }
        });
    }

    // Language button functionality
    const langBtn = document.querySelector('button[aria-label="Idioma"]');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            alert('Cambio de idioma próximamente disponible. Actualmente solo en Español.');
        });
    }

    // Header Cart button functionality
    const headerCartBtn = document.querySelector('.cart-btn');
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => {
            if (cartCount === 0) {
                alert('Tu carrito está vacío.');
            } else {
                alert(`Tienes ${cartCount} artículos en tu carrito. Ir al checkout...`);
            }
        });
    }

    // Filter functionality
    // Handle both Sidebar links and Pill buttons
    const filterElements = document.querySelectorAll('[data-category]');
    
    filterElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Update active state
            filterElements.forEach(el => {
                if (el.classList.contains('pill')) {
                    el.classList.remove('active');
                }
                if (el.classList.contains('sidebar-link')) {
                    el.classList.remove('active');
                }
            });
            
            this.classList.add('active');
            
            // Sync pills and sidebar if matching
            filterElements.forEach(el => {
                if (el.getAttribute('data-category') === category && el !== this) {
                    el.classList.add('active');
                }
            });
            
            filterProducts(category);
        });
    });

    // Handle Price/Offer links in sidebar (mock logic for now)
    const sidebarLinks = document.querySelectorAll('.sidebar-link:not([data-category])');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent.trim();
            
            // Visual feedback
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            if (text.includes('Gratis')) {
                filterByPrice('free');
            } else if (text.includes('Oferta')) {
                filterProducts('all'); // Show all for "En Oferta" for now
            } else if (text.includes('Menos de')) {
                filterByPrice('under-10');
            } else {
                // Default fallback
                console.log('Filter clicked:', text);
            }
        });
    });

    function filterProducts(category) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const cardCategory = card.querySelector('.product-category').textContent.toLowerCase();
            
            if (category === 'all' || cardCategory.includes(category.toLowerCase())) {
                card.style.display = 'block';
                // Reset animation
                card.style.animation = 'none';
                card.offsetHeight; /* trigger reflow */
                card.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    function filterByPrice(range) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const priceText = card.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace('$', '').replace('Free', '0'));
            
            let visible = false;
            if (range === 'free') {
                visible = price === 0 || priceText.toLowerCase() === 'free';
            } else if (range === 'under-10') {
                visible = price < 10;
            }
            
            if (visible) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
});

// Slider functionality (Infinite Loop)
document.addEventListener('DOMContentLoaded', function() {
    const sliderTrack = document.querySelector('.slider-track');
    const originalCards = document.querySelectorAll('.slider-card');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (!sliderTrack || !originalCards.length) return;

    // Clone cards to create infinite effect
    // Append multiple copies to ensure we never run out of content during scroll
    // Creating 3 sets of clones (total 4 sets including original)
    for (let i = 0; i < 3; i++) {
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            sliderTrack.appendChild(clone);
        });
    }

    const allCards = document.querySelectorAll('.slider-card');
    let currentIndex = 0;
    const cardHeight = 90 + 16; // Height + gap (approx) - refined below
    const totalOriginal = originalCards.length;
    let autoSlideInterval;

    // Calculate exact height including gap
    function getCardHeight() {
        // Use fixed base height from CSS (90px) to ensure consistent scrolling
        // regardless of which card is currently expanded (active)
        const baseHeight = 90; 
        const style = window.getComputedStyle(sliderTrack);
        const gap = parseFloat(style.gap) || 8; 
        return baseHeight + gap;
    }

    function updateSlider(transition = true) {
        const height = getCardHeight();
        if (transition) {
            sliderTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            sliderTrack.style.transition = 'none';
        }
        
        // Move to current index
        const offset = currentIndex * height;
        sliderTrack.style.transform = `translateY(-${offset}px)`;

        // Update active class
        allCards.forEach(c => c.classList.remove('active'));
        // The visible card is the one at currentIndex
        // However, if we are at the clone, we might want to highlight it
        if (allCards[currentIndex]) {
            allCards[currentIndex].classList.add('active');
        }
    }

    function nextSlide() {
        currentIndex++;
        updateSlider(true);

        // Check if we reached the end of the clones
        if (currentIndex >= totalOriginal) {
            // We are now showing the first clone (which looks like the first original)
            // Wait for transition to finish, then jump back to 0
            setTimeout(() => {
                currentIndex = 0;
                updateSlider(false); // No transition
            }, 400); // Match transition duration
        }
    }

    function prevSlide() {
        if (currentIndex <= 0) {
            // Jump to the clone position (end of originals)
            currentIndex = totalOriginal;
            updateSlider(false);
            // Force reflow to ensure the jump happens before the transition
            sliderTrack.offsetHeight; 
            // Then slide back to last original
            currentIndex--;
            updateSlider(true);
        } else {
            currentIndex--;
            updateSlider(true);
        }
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 3000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    // Click on slider cards to activate
    // We need to handle clicks on clones too
    sliderTrack.addEventListener('click', (e) => {
        const card = e.target.closest('.slider-card');
        if (card) {
            // Find index of this card
            const index = Array.from(allCards).indexOf(card);
            currentIndex = index;
            updateSlider(true);
            stopAutoSlide();
            startAutoSlide();
        }
    });

    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Initialize
    updateSlider(false);
    startAutoSlide();
});

