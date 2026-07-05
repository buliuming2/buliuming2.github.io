/* ============================================
   不刘名科创 — 交互脚本
   深色模式切换 + 滚动动画 + 移动端菜单
   ============================================ */

// =============================================
// 1. 深色模式切换
// =============================================
(function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

// =============================================
// 2. 滚动触发淡入动画 (IntersectionObserver)
// =============================================
(function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
})();

// =============================================
// 3. 导航栏滚动效果
// =============================================
(function initHeaderScroll() {
    const header = document.querySelector('header');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                header.classList.toggle('scrolled', window.scrollY > 60);
                ticking = false;
            });
            ticking = true;
        }
    });
})();

// =============================================
// 4. 移动端菜单
// =============================================
(function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    // 切换菜单
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // 点击导航链接后关闭菜单
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
})();

// =============================================
// 5. 平滑滚动
// =============================================
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth',
            });
        });
    });
})();
