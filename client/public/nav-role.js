/**
 * Dynamic Role-Based Navigation Helper (AlumniNav)
 *
 * Dynamically shows, hides, and renders navigation menu items and role-gated actions
 * based on the authenticated user's role (`GUEST`, `STUDENT`, `ALUMNI`, `ADMIN`)
 * stored in localStorage (`alumni_auth_user`), aligned with ddd.md RBAC rules.
 */
(function (global) {
  'use strict';

  const BACKEND_ORIGIN =
    typeof window !== 'undefined' && window.location && window.location.port === '5001'
      ? ''
      : 'http://localhost:5001';

  const MENU_BY_ROLE = {
    GUEST: [
      { label: 'Directory', href: '/' },
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' }
    ],
    STUDENT: [
      { label: 'Directory', href: '/' },
      { label: 'Announcements', href: BACKEND_ORIGIN + '/announcements', external: true },
      { label: 'Account', href: '/login' }
    ],
    ALUMNI: [
      { label: 'Directory', href: '/' },
      { label: 'Alumni', href: BACKEND_ORIGIN + '/alumni', external: true },
      { label: 'Announcements', href: BACKEND_ORIGIN + '/announcements', external: true },
      { label: 'Account', href: '/login' }
    ],
    ADMIN: [
      { label: 'Directory', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Users', href: BACKEND_ORIGIN + '/users', external: true },
      { label: 'Announcements', href: BACKEND_ORIGIN + '/announcements', external: true },
      { label: 'API Docs', href: BACKEND_ORIGIN + '/api/swagger', external: true }
    ]
  };

  function getCurrentUser() {
    try {
      const raw = global.localStorage && global.localStorage.getItem('alumni_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getCurrentRole(user) {
    const activeUser = user !== undefined ? user : getCurrentUser();
    if (!activeUser || !activeUser.role) return 'GUEST';
    const normalized = String(activeUser.role).trim().toUpperCase();
    return MENU_BY_ROLE[normalized] ? normalized : 'STUDENT';
  }

  function getMenuItemsForRole(role) {
    const key = String(role || 'GUEST').toUpperCase();
    return MENU_BY_ROLE[key] || MENU_BY_ROLE.GUEST;
  }

  function isRoleAllowed(attrValue, currentRole) {
    if (!attrValue) return true;
    const allowed = String(attrValue)
      .split(',')
      .map(function (r) { return r.trim().toUpperCase(); })
      .filter(Boolean);
    if (!allowed.length) return true;
    if (allowed.includes('ALL')) return true;
    if (allowed.includes('AUTH') && currentRole !== 'GUEST') return true;
    return allowed.includes(currentRole);
  }

  function renderDynamicNavContainers(role) {
    if (typeof document === 'undefined') return;
    const containers = document.querySelectorAll('.primary-nav[data-dynamic-nav="true"]');
    if (!containers.length) return;

    const pathname = (window.location && window.location.pathname) || '/';
    const items = getMenuItemsForRole(role);

    containers.forEach(function (nav) {
      nav.innerHTML = items
        .map(function (item) {
          const isActive = !item.external && (pathname === item.href || pathname === item.href + '.html');
          const attrs = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
          const aria = isActive ? ' aria-current="page"' : '';
          return (
            '<a href="' + item.href + '" class="nav-link' + (isActive ? ' active' : '') + '"' + attrs + aria + '>' +
            item.label +
            '</a>'
          );
        })
        .join('');
    });
  }

  function applyRoleNavigation() {
    if (typeof document === 'undefined') return;

    const user = getCurrentUser();
    const role = getCurrentRole(user);

    document.documentElement.setAttribute('data-user-role', role);

    // 1. Toggle visibility on every role-annotated element
    const roleNodes = document.querySelectorAll('[data-roles]');
    roleNodes.forEach(function (el) {
      const allowed = isRoleAllowed(el.getAttribute('data-roles'), role);
      if (allowed) {
        el.hidden = false;
        if (el.getAttribute('data-display')) {
          el.style.display = el.getAttribute('data-display');
        } else if (el.style.display === 'none') {
          el.style.display = '';
        }
      } else {
        el.hidden = true;
        el.style.display = 'none';
      }
    });

    // 2. Update authenticated user badge if present
    const userBadge = document.getElementById('navUserBadge');
    if (userBadge) {
      userBadge.textContent = user && user.name ? user.name + ' (' + role + ')' : '';
    }

    // 3. If active tab in SPA became hidden for current role, fall back to Directory tab
    const activeTabBtn = document.querySelector('.primary-nav .tab-btn.active');
    if (activeTabBtn && (activeTabBtn.hidden || activeTabBtn.style.display === 'none')) {
      const fallbackBtn = document.getElementById('nav-directory');
      if (fallbackBtn) {
        fallbackBtn.click();
      }
    }

    // 4. Render dynamic nav bars on standalone pages (login, register, admin)
    renderDynamicNavContainers(role);

    return { user: user, role: role };
  }

  const AlumniNav = {
    MENU_BY_ROLE: MENU_BY_ROLE,
    getCurrentUser: getCurrentUser,
    getCurrentRole: getCurrentRole,
    getMenuItemsForRole: getMenuItemsForRole,
    isRoleAllowed: isRoleAllowed,
    refresh: applyRoleNavigation
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlumniNav;
  }

  if (typeof global !== 'undefined') {
    global.AlumniNav = AlumniNav;
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyRoleNavigation);
    } else {
      applyRoleNavigation();
    }
    window.addEventListener('storage', function (e) {
      if (e.key === 'alumni_auth_user' || e.key === 'alumni_auth_token') {
        applyRoleNavigation();
      }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
