/**
 * ═══════════════════════════════════════════════════════════
 *  UserHub — Frontend Application Logic
 *  Handles CRUD operations via Fetch API, theme toggling,
 *  client-side validation, search, sorting, and view modes.
 * ═══════════════════════════════════════════════════════════
 */

const API_URL = '/api/users';

// ─── State ───────────────────────────────────────────────
let users = [];
let currentView = 'table'; // 'table' or 'cards'
let sortField = 'id';
let sortDir = 'asc';
let editingId = null;
let deletingId = null;

// ─── DOM Elements ────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const loader        = $('#loader');
const emptyState    = $('#empty-state');
const tableContainer = $('#table-container');
const cardsContainer = $('#cards-container');
const tbody         = $('#users-tbody');
const totalCount    = $('#total-count');
const searchInput   = $('#search-input');
const searchClear   = $('#search-clear');
const modalOverlay  = $('#modal-overlay');
const deleteOverlay = $('#delete-overlay');
const userForm      = $('#user-form');
const modalTitle    = $('#modal-title');
const btnSubmitText = $('#btn-submit-text');
const userId        = $('#user-id');
const inputName     = $('#input-fullname');
const inputEmail    = $('#input-email');
const inputBirth    = $('#input-birthdate');

// ─── Initialization ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    bindEvents();
    fetchUsers();
    lucide.createIcons();
});

// ═══════════════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════════════

function initTheme() {
    const saved = localStorage.getItem('userhub-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('userhub-theme', next);
}

// ═══════════════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════════════

function bindEvents() {
    // Theme toggle
    $('#theme-toggle').addEventListener('click', toggleTheme);

    // Add user buttons
    $('#btn-add-user').addEventListener('click', () => openModal());
    $('#btn-empty-add')?.addEventListener('click', () => openModal());

    // Modal close / cancel
    $('#modal-close').addEventListener('click', closeModal);
    $('#btn-cancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    // Delete modal
    $('#delete-close').addEventListener('click', closeDeleteModal);
    $('#delete-cancel').addEventListener('click', closeDeleteModal);
    deleteOverlay.addEventListener('click', (e) => { if (e.target === deleteOverlay) closeDeleteModal(); });
    $('#delete-confirm').addEventListener('click', confirmDelete);

    // Form submit
    userForm.addEventListener('submit', handleSubmit);

    // Search
    searchInput.addEventListener('input', handleSearch);
    searchClear.addEventListener('click', () => { searchInput.value = ''; handleSearch(); searchInput.focus(); });

    // View toggles
    $('#view-table').addEventListener('click', () => switchView('table'));
    $('#view-cards').addEventListener('click', () => switchView('cards'));

    // Sortable columns
    $$('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortField = field; sortDir = 'asc'; }
            renderUsers();
        });
    });

    // Keyboard: Escape closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeModal(); closeDeleteModal(); }
    });
}

// ═══════════════════════════════════════════════════════════
//  API — CRUD
// ═══════════════════════════════════════════════════════════

async function fetchUsers() {
    showLoader(true);
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch users');
        users = await res.json();
        renderUsers();
        showToast('Users loaded successfully', 'info');
    } catch (err) {
        showToast('Error loading users: ' + err.message, 'error');
    } finally {
        showLoader(false);
    }
}

async function createUser(data) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.message || 'Email already exists');
    }
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.title || 'Failed to create user');
    }
    return res.json();
}

async function updateUser(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.message || 'Email already exists');
    }
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.title || 'Failed to update user');
    }
    return res.json();
}

async function deleteUser(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
}

// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function renderUsers() {
    const filtered = getFilteredUsers();
    const sorted = getSortedUsers(filtered);

    totalCount.textContent = users.length;

    // Show/hide empty state
    if (sorted.length === 0) {
        tableContainer.classList.add('hidden');
        cardsContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    if (currentView === 'table') renderTable(sorted);
    else renderCards(sorted);

    // Update sort indicators
    $$('th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        if (th.dataset.sort === sortField) th.classList.add(sortDir);
    });

    lucide.createIcons();
}

function renderTable(data) {
    tableContainer.classList.remove('hidden');
    cardsContainer.classList.add('hidden');

    tbody.innerHTML = data.map((u, i) => `
        <tr style="animation-delay: ${i * 0.04}s">
            <td>#${u.id}</td>
            <td class="user-name">${esc(u.fullName)}</td>
            <td class="user-email">${esc(u.email)}</td>
            <td>${formatDate(u.birthDate)}</td>
            <td>${formatDateTime(u.registrationDate)}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon edit" onclick="editUser(${u.id})" title="Edit user" aria-label="Edit ${esc(u.fullName)}">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-icon delete" onclick="openDeleteModal(${u.id})" title="Delete user" aria-label="Delete ${esc(u.fullName)}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCards(data) {
    cardsContainer.classList.remove('hidden');
    tableContainer.classList.add('hidden');

    cardsContainer.innerHTML = data.map((u, i) => `
        <div class="user-card glass-card" style="animation-delay: ${i * 0.06}s">
            <div class="card-header">
                <div class="card-avatar">${getInitials(u.fullName)}</div>
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="editUser(${u.id})" title="Edit" aria-label="Edit ${esc(u.fullName)}">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-icon delete" onclick="openDeleteModal(${u.id})" title="Delete" aria-label="Delete ${esc(u.fullName)}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            <div class="card-name">${esc(u.fullName)}</div>
            <div class="card-email"><i data-lucide="mail"></i> ${esc(u.email)}</div>
            <div class="card-meta">
                <div class="card-meta-item"><i data-lucide="cake"></i> <strong>${formatDate(u.birthDate)}</strong></div>
                <div class="card-meta-item"><i data-lucide="clock"></i> <strong>${formatDate(u.registrationDate)}</strong></div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════
//  MODAL — Add / Edit
// ═══════════════════════════════════════════════════════════

function openModal(user = null) {
    editingId = user ? user.id : null;
    modalTitle.textContent = user ? 'Edit User' : 'Add New User';
    btnSubmitText.textContent = user ? 'Save Changes' : 'Create User';

    // Reset form
    userForm.reset();
    clearErrors();

    if (user) {
        userId.value = user.id;
        inputName.value = user.fullName;
        inputEmail.value = user.email;
        inputBirth.value = user.birthDate ? user.birthDate.split('T')[0] : '';
    }

    modalOverlay.classList.remove('hidden');
    inputName.focus();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    editingId = null;
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (user) openModal(user);
}

// ═══════════════════════════════════════════════════════════
//  MODAL — Delete Confirmation
// ═══════════════════════════════════════════════════════════

function openDeleteModal(id) {
    deletingId = id;
    const user = users.find(u => u.id === id);
    $('#delete-user-name').textContent = user ? user.fullName : `User #${id}`;
    deleteOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    deleteOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    deletingId = null;
}

async function confirmDelete() {
    if (deletingId == null) return;
    try {
        await deleteUser(deletingId);
        users = users.filter(u => u.id !== deletingId);
        renderUsers();
        showToast('User deleted successfully', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
    closeDeleteModal();
}

// ═══════════════════════════════════════════════════════════
//  FORM HANDLING & VALIDATION
// ═══════════════════════════════════════════════════════════

async function handleSubmit(e) {
    e.preventDefault();
    clearErrors();

    const data = {
        fullName: inputName.value.trim(),
        email: inputEmail.value.trim(),
        birthDate: inputBirth.value
    };

    // Client-side validation
    let valid = true;

    if (!data.fullName || data.fullName.length < 2) {
        showFieldError('fullname', 'Full name must be at least 2 characters.');
        valid = false;
    }

    if (!data.email || !isValidEmail(data.email)) {
        showFieldError('email', 'Please enter a valid email address.');
        valid = false;
    }

    if (!data.birthDate) {
        showFieldError('birthdate', 'Please select a date of birth.');
        valid = false;
    } else if (new Date(data.birthDate) > new Date()) {
        showFieldError('birthdate', 'Birth date cannot be in the future.');
        valid = false;
    }

    if (!valid) return;

    // Disable submit button
    const btn = $('#btn-submit');
    btn.disabled = true;
    btnSubmitText.textContent = editingId ? 'Saving…' : 'Creating…';

    try {
        if (editingId) {
            const updated = await updateUser(editingId, data);
            const idx = users.findIndex(u => u.id === editingId);
            if (idx !== -1) users[idx] = updated;
            showToast('User updated successfully!', 'success');
        } else {
            const created = await createUser(data);
            users.unshift(created);
            showToast('User created successfully!', 'success');
        }
        renderUsers();
        closeModal();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btnSubmitText.textContent = editingId ? 'Save Changes' : 'Create User';
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, msg) {
    const input = $(`#input-${field}`);
    const errEl = $(`#err-${field}`);
    if (input) input.classList.add('invalid');
    if (errEl) errEl.textContent = msg;
}

function clearErrors() {
    $$('.form-group input').forEach(el => el.classList.remove('invalid'));
    $$('.error-msg').forEach(el => el.textContent = '');
}

// ═══════════════════════════════════════════════════════════
//  SEARCH, SORT, VIEW
// ═══════════════════════════════════════════════════════════

function handleSearch() {
    const val = searchInput.value.trim();
    searchClear.classList.toggle('hidden', val.length === 0);
    renderUsers();
}

function getFilteredUsers() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return [...users];
    return users.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
}

function getSortedUsers(arr) {
    return arr.sort((a, b) => {
        let va = a[sortField];
        let vb = b[sortField];
        if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });
}

function switchView(view) {
    currentView = view;
    $('#view-table').classList.toggle('active', view === 'table');
    $('#view-cards').classList.toggle('active', view === 'cards');
    renderUsers();
}

// ═══════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: 'check-circle-2', error: 'alert-circle', info: 'info' };
    toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${esc(message)}</span>`;

    container.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════

function showLoader(show) {
    loader.classList.toggle('hidden', !show);
    if (show) {
        tableContainer.classList.add('hidden');
        cardsContainer.classList.add('hidden');
        emptyState.classList.add('hidden');
    }
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Expose functions used in onclick attributes
window.editUser = editUser;
window.openDeleteModal = openDeleteModal;
