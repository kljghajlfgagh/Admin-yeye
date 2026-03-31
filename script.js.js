// script.js
// 模拟的初始数据
let users = [
    { id: 1, name: '张三', role: 'super_admin', lastLogin: '2026-03-31 22:45' },
    { id: 2, name: '李四', role: 'admin', lastLogin: '2026-03-30 15:20' },
    { id: 3, name: '王五', role: 'user', lastLogin: '2026-03-29 10:10' },
    { id: 4, name: '赵六', role: 'user', lastLogin: '2026-03-28 18:00' }
];
let roles = [
    { id: 'super_admin', name: '超级管理员', permissions: ['上传', '下载', '删除', '管理用户', '管理角色', '管理分类'] },
    { id: 'admin', name: '普通管理员', permissions: ['上传', '下载', '编辑自己上传的文件', '管理部分用户'] },
    { id: 'user', name: '普通用户', permissions: ['上传', '下载（仅自己上传的）'] }
];
let categories = [
    { id: 1, name: '公共资料', parentId: null, permissions: 'all' },
    { id: 2, name: '产品手册', parentId: 1, permissions: 'all' },
    { id: 3, name: '宣传海报', parentId: 1, permissions: 'all' },
    { id: 4, name: '内部资料', parentId: null, permissions: 'admin_up' },
    { id: 5, name: '财务报告', parentId: 4, permissions: 'super_admin_only' },
    { id: 6, name: '员工通讯录', parentId: 4, permissions: 'admin_up' },
    { id: 7, name: '技术文档', parentId: null, permissions: 'admin_up' }
];

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const loginPage = document.getElementById('loginPage');
    const mainPage = document.getElementById('mainPage');
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');

    // 登录
    loginBtn.addEventListener('click', () => {
        // 模拟登录，设定当前用户为超级管理员
        currentUser = { name: '张三', role: 'super_admin' };
        loginPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        updateUI();
    });

    // 导航切换
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            // 更新导航按钮状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // 显示对应内容
            contentSections.forEach(section => section.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
            
            // 根据切换的页面加载数据
            if (targetId === 'userManagement') renderUsers();
            if (targetId === 'roleManagement') renderRoles();
            if (targetId === 'categoryManagement') renderCategories();
        });
    });

    // 模态框关闭
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));

    // 初始化
    function updateUI() {
        if (currentUser) {
            document.getElementById('welcomeName').textContent = currentUser.name;
            document.getElementById('userInfo').textContent = `(${currentUser.name} - ${getRoleName(currentUser.role)})`;
            // 默认显示仪表板
            navButtons[0].click();
        }
    }

    // 渲染用户列表
    function renderUsers() {
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${getRoleName(user.role)}</td>
                <td>${user.lastLogin}</td>
                <td>
                    <button onclick="openEditUserModal(${user.id})">编辑</button>
                    <button onclick="deleteUser(${user.id})">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('addUserBtn').onclick = openAddUserModal;
    }

    // 渲染角色列表
    function renderRoles() {
        const tbody = document.getElementById('roleTableBody');
        tbody.innerHTML = '';
        roles.forEach(role => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${role.name}</td>
                <td>${role.permissions.join(', ')}</td>
                <td><button onclick="openEditRoleModal('${role.id}')">编辑</button></td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('addRoleBtn').onclick = openAddRoleModal;
    }

    // 渲染分类列表
    function renderCategories() {
        const ul = document.getElementById('categoryTree');
        ul.innerHTML = '';
        const rootNodes = categories.filter(cat => cat.parentId === null);
        rootNodes.forEach(node => {
            ul.appendChild(createCategoryNode(node));
        });
        document.getElementById('addCategoryBtn').onclick = openAddCategoryModal;
    }

    function createCategoryNode(category) {
        const li = document.createElement('li');
        const permText = getCategoryPermissionText(category.permissions);
        li.innerHTML = `${category.name} (${permText}) <button onclick="openEditCategoryModal(${category.id})">编辑</button>`;
        
        const children = categories.filter(cat => cat.parentId === category.id);
        if (children.length > 0) {
            const childUl = document.createElement('ul');
            children.forEach(child => childUl.appendChild(createCategoryNode(child)));
            li.appendChild(childUl);
        }
        return li;
    }

    window.openAddUserModal = function() {
        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <h3>新增用户</h3>
            <input type="text" id="newUserName" placeholder="用户名"><br><br>
            <select id="newUserRole">
                <option value="user">普通用户</option>
                <option value="admin">普通管理员</option>
            </select><br><br>
            <button onclick="saveNewUser()">确定</button>
        `;
        modal.classList.remove('hidden');
    };

    window.saveNewUser = function() {
        const name = document.getElementById('newUserName').value;
        const role = document.getElementById('newUserRole').value;
        if (name) {
            users.push({ id: Date.now(), name, role, lastLogin: '刚刚' });
            renderUsers(); // 重新渲染用户列表
            modal.classList.add('hidden');
        }
    };

    window.openEditRoleModal = function(roleId) {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;
        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <h3>编辑角色 - ${role.name}</h3>
            <p>角色名称: ${role.name}</p>
            <p>当前权限:</p>
            <div id="permissionCheckboxes"></div>
            <button onclick="saveEditedRole('${roleId}')">保存</button>
        `;
        const permDiv = document.getElementById('permissionCheckboxes');
        const allPerms = ['上传资料', '下载资料', '删除资料', '管理用户', '管理角色', '管理分类'];
        allPerms.forEach(perm => {
            const checked = role.permissions.includes(perm) ? 'checked' : '';
            permDiv.innerHTML += `<label><input type="checkbox" value="${perm}" ${checked}> ${perm}</label><br>`;
        });
        modal.classList.remove('hidden');
    };

    window.saveEditedRole = function(roleId) {
        const checkboxes = document.querySelectorAll('#permissionCheckboxes input[type="checkbox"]:checked');
        const newPermissions = Array.from(checkboxes).map(cb => cb.value);
        const role = roles.find(r => r.id === roleId);
        if (role) {
            role.permissions = newPermissions;
            renderRoles(); // 重新渲染角色列表
            modal.classList.add('hidden');
        }
    };

    // ... (其他window.functions 如openAddRoleModal, deleteUser等)
    // (为节省篇幅，此处省略，但在实际文件中会完整提供)
    
    window.openAddRoleModal = function() {
        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <h3>新建角色</h3>
            <input type="text" id="newRoleName" placeholder="角色名称"><br><br>
            <p>选择权限:</p>
            <div id="newPermissionCheckboxes"></div>
            <button onclick="saveNewRole()">保存</button>
        `;
        const permDiv = document.getElementById('newPermissionCheckboxes');
        const allPerms = ['上传资料', '下载资料', '删除资料', '管理用户', '管理角色', '管理分类'];
        allPerms.forEach(perm => {
            permDiv.innerHTML += `<label><input type="checkbox" value="${perm}"> ${perm}</label><br>`;
        });
        modal.classList.remove('hidden');
    };

    window.saveNewRole = function() {
        const name = document.getElementById('newRoleName').value;
        const checkboxes = document.querySelectorAll('#newPermissionCheckboxes input[type="checkbox"]:checked');
        const permissions = Array.from(checkboxes).map(cb => cb.value);
        if (name && permissions.length > 0) {
            roles.push({ id: name.toLowerCase().replace(/\s+/g, '_'), name, permissions });
            renderRoles();
            modal.classList.add('hidden');
        }
    };

    window.openAddCategoryModal = function() {
        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <h3>新建分类</h3>
            <input type="text" id="newCatName" placeholder="分类名称"><br><br>
            <select id="newCatPerm">
                <option value="all">所有人可读</option>
                <option value="user_up">普通用户及以上</option>
                <option value="admin_up">管理员及以上</option>
                <option value="super_admin_only">超级管理员</option>
            </select><br><br>
            <button onclick="saveNewCategory()">确定</button>
        `;
        modal.classList.remove('hidden');
    };

    window.saveNewCategory = function() {
        const name = document.getElementById('newCatName').value;
        const perm = document.getElementById('newCatPerm').value;
        if (name) {
            categories.push({ id: Date.now(), name, parentId: null, permissions: perm });
            renderCategories();
            modal.classList.add('hidden');
        }
    };

    window.deleteUser = function(id) {
        if (confirm('确定要删除此用户吗？')) {
            users = users.filter(u => u.id !== id);
            renderUsers();
        }
    };

    function getRoleName(roleId) {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : '未知角色';
    }

    function getCategoryPermissionText(perm) {
        const map = {
            'all': '所有人可读',
            'user_up': '普通用户及以上',
            'admin_up': '管理员及以上',
            'super_admin_only': '超级管理员'
        };
        return map[perm] || '未知';
    }
});

// 将所有window函数声明在此，避免报错
window.openEditUserModal = function(id) {};
window.openEditCategoryModal = function(id) {};