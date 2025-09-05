// Cấu hình phân quyền cho ứng dụng
module.exports = {
    // Vai trò mặc định cho người dùng mới đăng ký
    DEFAULT_ROLE: 'user',
    
    // Danh sách các vai trò
    ROLES: {
        ADMIN: 'admin',
        WORKER: 'worker',
        USER: 'user'
    },
    
    // Phân quyền mặc định cho từng vai trò
    PERMISSIONS: {
        admin: [
            'users:read',
            'users:create',
            'users:update',
            'users:delete',
            'services:manage',
            'orders:manage'
        ],
        worker: [
            'profile:read',
            'profile:update',
            'services:read',
            'orders:read',
            'orders:update'
        ],
        user: [
            'profile:read',
            'profile:update',
            'services:read',
            'orders:create',
            'orders:read:own',
            'orders:update:own'
        ]
    },
    
    // Kiểm tra xem một vai trò có hợp lệ không
    isValidRole: function(role) {
        return Object.values(this.ROLES).includes(role);
    },
    
    // Lấy danh sách quyền của một vai trò
    getPermissions: function(role) {
        return this.PERMISSIONS[role] || [];
    }
};
