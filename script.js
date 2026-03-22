// ========================================
// SciBoost 网站交互脚本
// 功能：滚动效果、进度条动画、表单提交、导航交互
// ========================================

(function() {
    'use strict';

    // DOM 元素
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const progressBars = document.querySelectorAll('.progress-fill');
    const projectCards = document.querySelectorAll('.project-card');
    const contactForm = document.getElementById('contactForm');

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        initNavbar();
        initScrollEffects();
        initProgressBars();
        initProjectAnimations();
        initContactForm();
        initSmoothScroll();
    });

    // ==================== 导航栏交互 ====================

    function initNavbar() {
        let lastScrollTop = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // 添加/移除滚动样式
            if (scrollTop > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // 隐藏/显示导航栏（向上滚动时隐藏）
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop;
        });

        // 移动端菜单切换
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                toggleMobileMenu();
            });
        }
    }

    function toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-links');
        if (!navMenu) return;

        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');

        // 添加动画效果
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // ==================== 滚动效果 ====================

    function initScrollEffects() {
        // 导航链接点击平滑滚动
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId.startsWith('#')) {
                    scrollToSection(targetId.substring(1));
                }
            });
        });

        // 滚动时高亮当前章节
        window.addEventListener('scroll', highlightCurrentSection);

        // 元素进入视口动画
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // 观察所有需要动画的元素
        const animateElements = document.querySelectorAll('.project-card, .step-item, .feature-item, .contact-item');
        animateElements.forEach(el => observer.observe(el));
    }

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const navHeight = navbar.offsetHeight;
        const targetPosition = section.offsetTop - navHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // 关闭移动端菜单
        const navMenu = document.querySelector('.nav-links');
        if (navMenu && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }

    function highlightCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ==================== 进度条动画 ====================

    function initProgressBars() {
        const progressObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressBar(entry.target);
                    progressObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        progressBars.forEach(bar => {
            progressObserver.observe(bar);
        });
    }

    function animateProgressBar(progressBar) {
        const targetWidth = progressBar.getAttribute('data-progress');
        const duration = 1500;
        const startTime = performance.now();
        const startWidth = 0;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用缓动函数
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentWidth = startWidth + (targetWidth - startWidth) * easeOutCubic;

            progressBar.style.width = currentWidth + '%';

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // ==================== 项目卡片动画 ====================

    function initProjectAnimations() {
        projectCards.forEach((card, index) => {
            // 添加悬停效果
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });

            // 添加进入动画延迟
            card.style.animationDelay = (index * 0.1) + 's';
        });
    }

    // ==================== 表单提交 ====================

    function initContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // 表单验证
            if (!validateForm(data)) {
                return;
            }

            // 显示提交状态
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            submitButton.textContent = '发送中...';
            submitButton.disabled = true;

            // 模拟表单提交
            setTimeout(() => {
                showMessage('留言发送成功！我们会尽快回复您。', 'success');
                this.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }

    function validateForm(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('请输入有效的姓名');
        }

        if (!data.email || !isValidEmail(data.email)) {
            errors.push('请输入有效的邮箱地址');
        }

        if (!data.subject || data.subject.trim().length < 5) {
            errors.push('请输入主题（至少5个字符）');
        }

        if (!data.message || data.message.trim().length < 10) {
            errors.push('请输入留言内容（至少10个字符）');
        }

        if (errors.length > 0) {
            showMessage(errors.join('<br>'), 'error');
            return false;
        }

        return true;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type = 'info') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = message;

        // 添加到页面
        document.body.appendChild(messageDiv);

        // 添加样式
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)'
        });

        // 根据类型设置背景色
        if (type === 'success') {
            messageDiv.style.background = 'rgba(16, 185, 129, 0.9)';
        } else if (type === 'error') {
            messageDiv.style.background = 'rgba(239, 68, 68, 0.9)';
        } else {
            messageDiv.style.background = 'rgba(37, 99, 235, 0.9)';
        }

        // 显示动画
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 5000);
    }

    // ==================== 平滑滚动 ====================

    function initSmoothScroll() {
        // 为所有内部链接添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                scrollToSection(targetId);
            });
        });

        // Hero区域按钮
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        heroButtons.forEach(button => {
            button.addEventListener('click', function() {
                const onclick = this.getAttribute('onclick');
                if (onclick && onclick.includes('scrollToSection')) {
                    const sectionId = onclick.match(/'([^']+)'/)[1];
                    scrollToSection(sectionId);
                }
            });
        });
    }

    // ==================== 辅助功能 ====================

    // 键盘导航支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
        // ESC键关闭弹窗
        if (e.key === 'Escape') {
            const bankModal = document.getElementById('bankModal');
            if (bankModal && bankModal.classList.contains('active')) {
                bankModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // 返回顶部按钮
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--gradient-blue);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        opacity: 0;
        transform: translateY(20px);
        transition: all var(--transition-fast);
        z-index: 999;
    `;

    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.transform = 'translateY(0)';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.transform = 'translateY(20px)';
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ==================== 性能优化 ====================

    // 图片懒加载
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 优化滚动事件
    const optimizedScrollHandler = debounce(() => {
        highlightCurrentSection();
    }, 50);

    window.addEventListener('scroll', optimizedScrollHandler);

})();

// 全局函数供HTML调用
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.offsetHeight : 80;
    const targetPosition = section.offsetTop - navHeight - 20;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}
