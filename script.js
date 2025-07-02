// Page transition animation
const PageTransition = {
    init() {
        this.body = document.body;
        this.setupPageLoad();
        this.setupLanguageToggle();
    },

    setupPageLoad() {
        // Set initial state
        this.body.style.opacity = '0';
        this.body.style.transform = 'translateY(20px)';
        this.body.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Smooth page entrance
        setTimeout(() => {
            this.body.style.opacity = '1';
            this.body.style.transform = 'translateY(0)';
        }, 100);
    },

    setupLanguageToggle() {
        // Language switching is handled by onclick events in HTML
        // This method is kept for potential future enhancements
    },

    handleLanguageSwitch(toggle) {
        // Get target page and navigate immediately
        const targetPage = this.getTargetPage();
        window.location.href = targetPage;
    },

    getTargetPage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const isEnglish = !currentPage.includes('-zh');
        
        const pageMap = {
            'index.html': 'index-zh.html',
            'about.html': 'about-zh.html',
            'research.html': 'research-zh.html',
            'projects.html': 'projects-zh.html',
            'experience.html': 'experience-zh.html',
            'contact.html': 'contact-zh.html'
        };
        
        const reversePageMap = {};
        Object.keys(pageMap).forEach(key => {
            reversePageMap[pageMap[key]] = key;
        });
        
        if (isEnglish) {
            return pageMap[currentPage] || 'index-zh.html';
        } else {
            return reversePageMap[currentPage] || 'index.html';
        }
    },

    // exitAnimation method removed - no longer needed for instant language switching
};

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Adjusted for new navbar height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Simple navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const scrolled = window.scrollY;
        if (scrolled > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            navbar.style.backdropFilter = 'blur(30px) saturate(180%)';
        }
    }
});

// Enhanced intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

// Navbar fixed positioning code has been removed

// Initialize animations and page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page transitions
    PageTransition.init();
    
    // Add staggered animation to elements
    const animateElements = document.querySelectorAll('.card, .project-card, .timeline-item');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s`;
        observer.observe(el);
    });

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init("YOUR_PUBLIC_KEY"); // You need to replace this with your actual EmailJS public key
    }

    // Form submission handling with FormSubmit (simplified and improved method)
    const contactForms = document.querySelectorAll('form[action*="formsubmit.co"]');
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Get form data
            const formData = new FormData(this);
            
            // Basic validation
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message') || formData.get('website_feedback');
            
            if (name && !name.trim()) {
                alert('Please enter your name');
                return;
            }
            if (email && !email.trim()) {
                alert('Please enter your email');
                return;
            }
            if (message && !message.trim()) {
                alert('Please enter a message');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            
            // Use fetch to submit the form
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok || response.status === 200) {
                    // Success
                    submitBtn.innerHTML = '✓ Message Sent Successfully!';
                    submitBtn.style.background = '#34c759';
                    submitBtn.style.opacity = '1';
                    
                    // Reset form
                    this.reset();
                    
                    // Redirect to thank you page
                    setTimeout(() => {
                        const isChinesePage = window.location.pathname.includes('-zh');
                        const thankYouPage = isChinesePage ? 'thank-you-zh.html' : 'thank-you.html';
                        window.location.href = thankYouPage;
                    }, 2000);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.log('Fetch failed, using fallback method:', error);
                
                // Fallback: Try direct form submission
                submitBtn.innerHTML = 'Redirecting...';
                
                // Remove the hidden _next field temporarily to prevent redirect loop
                const nextField = this.querySelector('input[name="_next"]');
                const nextValue = nextField ? nextField.value : '';
                if (nextField) nextField.remove();
                
                // Submit the form normally
                const tempForm = document.createElement('form');
                tempForm.action = this.action;
                tempForm.method = 'POST';
                tempForm.target = '_blank'; // Open in new tab to prevent navigation away
                
                // Copy all form data
                for (let [key, value] of formData.entries()) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    tempForm.appendChild(input);
                }
                
                document.body.appendChild(tempForm);
                tempForm.submit();
                document.body.removeChild(tempForm);
                
                // Show success message and redirect
                setTimeout(() => {
                    submitBtn.innerHTML = '✓ Message Sent!';
                    submitBtn.style.background = '#34c759';
                    submitBtn.style.opacity = '1';
                    
                    setTimeout(() => {
                        const isChinesePage = window.location.pathname.includes('-zh');
                        const thankYouPage = isChinesePage ? 'thank-you-zh.html' : 'thank-you.html';
                        window.location.href = thankYouPage;
                    }, 2000);
                }, 1000);
            });
        });
    });
});

// Language switching function
function switchLanguage(targetUrl) {
    // Add smooth transition effect
    const body = document.body;
    body.style.opacity = '0.7';
    body.style.transform = 'scale(0.95)';
    
    // Navigate to target URL after brief animation
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 150);
}

// Mobile menu toggle (for responsive design)
function toggleMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    if (navOverlay) {
        navOverlay.classList.toggle('active');
    }
    
    // Prevent body scrolling when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Close resume dropdown menu
function closeResumeMenu() {
    const resumeOverlay = document.querySelector('.resume-overlay');
    const resumeDropdowns = document.querySelectorAll('.resume-dropdown');
    
    resumeDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
        const dropdownContent = dropdown.querySelector('.resume-dropdown-content');
        if (dropdownContent) {
            dropdownContent.classList.remove('active');
        }
    });
    
    if (resumeOverlay) {
        resumeOverlay.classList.remove('active');
    }
}

// Additional mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            // Don't close menu if it's a dropdown text link in mobile
            const dropdown = link.closest('.resume-dropdown');
            const isDropdownTextLink = link.classList.contains('resume-btn-text');
            const isMobile = window.innerWidth <= 1100;
            
            if (isDropdownTextLink && dropdown && isMobile) {
                // For dropdown text links in mobile, we want normal link behavior
                // so we don't return early here
            }
            
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            const navOverlay = document.querySelector('.nav-overlay');
            const resumeOverlay = document.querySelector('.resume-overlay');
            
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
                if (resumeOverlay) {
                    resumeOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
                
                // Close any open dropdowns
                document.querySelectorAll('.resume-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const dropdownContent = dropdown.querySelector('.resume-dropdown-content');
                    if (dropdownContent) {
                        dropdownContent.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // Handle dropdown arrow clicks (both desktop and mobile)
    document.querySelectorAll('.resume-btn-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = arrow.closest('.resume-dropdown');
            const dropdownContent = dropdown.querySelector('.resume-dropdown-content');
            const resumeOverlay = document.querySelector('.resume-overlay');
            
            // Close all other dropdowns first
            document.querySelectorAll('.resume-dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                    const otherContent = otherDropdown.querySelector('.resume-dropdown-content');
                    if (otherContent) {
                        otherContent.classList.remove('active');
                    }
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
            if (dropdownContent) {
                dropdownContent.classList.toggle('active');
            }
            
            // Show overlay if dropdown is open (mainly for mobile)
            if (resumeOverlay) {
                if (dropdown.classList.contains('active')) {
                    resumeOverlay.classList.add('active');
                } else {
                    resumeOverlay.classList.remove('active');
                }
            }
        });
    });
    
    // Handle dropdown option clicks in mobile
    document.querySelectorAll('.resume-option').forEach(option => {
        option.addEventListener('click', () => {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            const navOverlay = document.querySelector('.nav-overlay');
            const resumeOverlay = document.querySelector('.resume-overlay');
            
            // Close mobile menu when clicking on dropdown options
            if (navToggle && navMenu && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
                if (resumeOverlay) {
                    resumeOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
                
                // Close all dropdowns
                document.querySelectorAll('.resume-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const dropdownContent = dropdown.querySelector('.resume-dropdown-content');
                    if (dropdownContent) {
                        dropdownContent.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.querySelector('.nav-overlay');
        const navbar = document.querySelector('.navbar');
        
        if (navbar && !navbar.contains(e.target) && navMenu && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            if (navOverlay) {
                navOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    });
    
    // Close dropdown menus when clicking outside
    document.addEventListener('click', (e) => {
        const resumeDropdowns = document.querySelectorAll('.resume-dropdown');
        const resumeOverlay = document.querySelector('.resume-overlay');
        
        // Check if click is outside any dropdown
        let clickedInside = false;
        resumeDropdowns.forEach(dropdown => {
            if (dropdown.contains(e.target)) {
                clickedInside = true;
            }
        });
        
        if (!clickedInside) {
            resumeDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
                const dropdownContent = dropdown.querySelector('.resume-dropdown-content');
                if (dropdownContent) {
                    dropdownContent.classList.remove('active');
                }
            });
            
            if (resumeOverlay) {
                resumeOverlay.classList.remove('active');
            }
        }
    });
});

// Abstract toggle functionality for publications
function toggleAbstract(abstractId) {
    const abstractElement = document.getElementById(abstractId);
    const toggleElement = abstractElement.previousElementSibling;
    const arrow = toggleElement.querySelector('.abstract-arrow');
    
    if (abstractElement.classList.contains('show')) {
        // Hide abstract
        abstractElement.classList.remove('show');
        toggleElement.classList.remove('active');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        // Show abstract
        abstractElement.classList.add('show');
        toggleElement.classList.add('active');
        arrow.style.transform = 'rotate(180deg)';
    }
}

// Show citation information
function showCitation(citationId) {
    const citation = document.getElementById(citationId);
    
    if (citation.style.display === 'none' || citation.style.display === '') {
        citation.style.display = 'block';
        citation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        citation.style.display = 'none';
    }
}
