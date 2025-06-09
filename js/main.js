// Функція для завантаження HTML-компонентів
function loadComponent(selector, url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = data;
                return true;
            }
            return false;
        })
        .catch(error => {
            console.error('Error loading component:', error);
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = `<p>Error loading content.</p>`;
            }
            return false;
        });
}

// Функція для отримання назви з імені файлу
function getSlabName(filename) {
    // Видаляємо розширення файлу
    let name = filename.replace(/\.[^/.]+$/, "");
    // Беремо тільки частину до AGL
    name = name.split('-AGL-')[0];
    // Замінюємо дефіси на пробіли
    name = name.replace(/-/g, " ");
    // Робимо першу літеру кожного слова великою
    name = name.split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return name;
}

// Функція для створення модального вікна
function createModal(image, name) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="zoom-controls">
                <button class="zoom-btn zoom-in">+</button>
                <button class="zoom-btn zoom-out">-</button>
            </div>
            <img src="${image}" alt="${name}">
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const modalImg = modal.querySelector('img');
    let scale = 1;
    const ZOOM_STEP = 0.2;
    const MAX_ZOOM = 3;
    const MIN_ZOOM = 0.5;

    // Функція для оновлення масштабу
    function updateZoom(newScale) {
        scale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
        modalImg.style.transform = `scale(${scale})`;
    }

    // Збільшення
    modal.querySelector('.zoom-in').onclick = (e) => {
        e.stopPropagation();
        updateZoom(scale + ZOOM_STEP);
    };

    // Зменшення
    modal.querySelector('.zoom-out').onclick = (e) => {
        e.stopPropagation();
        updateZoom(scale - ZOOM_STEP);
    };

    // Збільшення/зменшення коліщатком миші
    modalImg.onwheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        updateZoom(scale + delta);
    };

    // Закриття модального вікна
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    };

    // Закриття по кліку поза модальним вікном
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    };

    // Закриття по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Функція для завантаження зображень з папки slabs
async function loadSlabImages() {
    const productsContainer = document.querySelector('.products-container');
    if (!productsContainer) return;

    try {
        // Отримуємо список зображень з JSON файлу
        const response = await fetch('/Porcelain/js/slabs.json');
        const data = await response.json();
        
        const itemsPerPage = 6;
        let currentPage = 1;

        function displayPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = data.slabs.slice(start, end);

            const productsHTML = pageItems.map(slab => {
                return `
                    <div class="product-item" onclick="createModal('/Porcelain/images/slabs/${slab.filename}', '${slab.name}')">
                        <img src="/Porcelain/images/slabs/${slab.filename}" alt="${slab.name}">
                        <div class="product-info">
                            <h3>${slab.name}</h3>
                            <p>${slab.size}</p>
                            <p>${slab.thickness} thickness</p>
                        </div>
                    </div>
                `;
            }).join('');

            productsContainer.innerHTML = productsHTML;
            updatePagination();
        }

        function updatePagination() {
            const totalPages = Math.ceil(data.slabs.length / itemsPerPage);
            const paginationContainer = document.querySelector('.pagination');
            if (!paginationContainer) return;

            let paginationHTML = '';
            
            // Previous button
            paginationHTML += `
                <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                        onclick="changePage(${currentPage - 1})">
                    Previous
                </button>
            `;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                            onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            }

            // Next button
            paginationHTML += `
                <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                        onclick="changePage(${currentPage + 1})">
                    Next
                </button>
            `;

            paginationContainer.innerHTML = paginationHTML;
        }

        // Додаємо функцію changePage до глобального об'єкта window
        window.changePage = function(page) {
            currentPage = page;
            displayPage(page);
        };

        // Відображаємо першу сторінку
        displayPage(1);
    } catch (error) {
        console.error('Error loading slab images:', error);
        productsContainer.innerHTML = '<p>Error loading images. Please try again later.</p>';
    }
}

// Функціонал мобільного меню
function initMobileMenu() {
    console.log('Initializing mobile menu...');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    console.log('Mobile menu button:', mobileMenuBtn);
    console.log('Mobile menu:', mobileMenu);

    if (!mobileMenuBtn || !mobileMenu) {
        console.error('Mobile menu elements not found');
        return;
    }

    const mobileMenuLinks = mobileMenu.querySelectorAll('a');

    function toggleMobileMenu() {
        console.log('Toggling mobile menu');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    }

    mobileMenuBtn.addEventListener('click', (e) => {
        console.log('Mobile menu button clicked');
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Закриття меню при кліку на посилання
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Закриття меню при кліку поза меню
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            toggleMobileMenu();
        }
    });
}

// Завантажуємо хедер і футер, коли DOM готовий
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM Content Loaded');
    
    // Ініціалізуємо мобільне меню
    initMobileMenu();
    
    // Завантажуємо зображення
    loadSlabImages();
}); 