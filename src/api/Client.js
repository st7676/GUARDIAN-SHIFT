// Mock Database in LocalStorage
class MockDatabase {
  constructor() {
    this.data = {
      nurses: [],
      departments: [],
      notifications: [],
      'nurse-availability': [],
      'nurse-weekly-status': [],
      'schedule-weeks': [],
      'shift-assignments': [],
      'user-settings': [],
    };
    this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('mockdb');
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.initializeSampleData();
    }
  }

  saveToStorage() {
    localStorage.setItem('mockdb', JSON.stringify(this.data));
  }

  initializeSampleData() {
    // Initialize with sample nurses
    this.data.nurses = [
      { id: '1', name: 'רחל כהן', email: 'rachel@example.com', is_active: true, is_head_nurse: false, created_date: new Date().toISOString() },
      { id: '2', name: 'דינה לוי', email: 'dina@example.com', is_active: true, is_head_nurse: false, created_date: new Date().toISOString() },
      { id: '3', name: 'שרה גולדמן', email: 'sara@example.com', is_active: true, is_head_nurse: false, created_date: new Date().toISOString() },
      { id: '4', name: 'מירי אברהם', email: 'miri@example.com', is_active: true, is_head_nurse: false, created_date: new Date().toISOString() },
      { id: '5', name: 'חנה כספי', email: 'hana@example.com', is_active: true, is_head_nurse: false, created_date: new Date().toISOString() },
    ];
    
    this.data.departments = [
      { id: '1', name: 'ICU', code: 'ICU', is_active: true },
      { id: '2', name: 'Pediatrics', code: 'PED', is_active: true },
      { id: '3', name: 'Emergency', code: 'ER', is_active: true },
    ];

    // Add sample weekly statuses (all active)
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    this.data['nurse-weekly-status'] = [
      { id: '1', nurse_id: '1', week_start_date: weekStartStr, status: 'active', created_date: new Date().toISOString() },
      { id: '2', nurse_id: '2', week_start_date: weekStartStr, status: 'active', created_date: new Date().toISOString() },
      { id: '3', nurse_id: '3', week_start_date: weekStartStr, status: 'active', created_date: new Date().toISOString() },
      { id: '4', nurse_id: '4', week_start_date: weekStartStr, status: 'active', created_date: new Date().toISOString() },
      { id: '5', nurse_id: '5', week_start_date: weekStartStr, status: 'active', created_date: new Date().toISOString() },
    ];

    // Add sample availability (all available all week)
    this.data['nurse-availability'] = [
      { id: '1', nurse_id: '1', week_start_date: weekStartStr, day_of_week: 0, available: true, created_date: new Date().toISOString() },
      { id: '2', nurse_id: '1', week_start_date: weekStartStr, day_of_week: 1, available: true, created_date: new Date().toISOString() },
      // ... more availability records can be added as needed
    ];

    this.saveToStorage();
  }

  getCollection(entityName) {
    const key = entityName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
    return this.data[key] || this.data[entityName] || [];
  }

  setCollection(entityName, data) {
    const key = entityName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
    this.data[key] = data;
    this.saveToStorage();
  }
}

const mockDb = new MockDatabase();

// Entity factory function with localStorage
const createEntity = (entityName) => {
  return {
    list: (sortBy) => {
      return Promise.resolve(mockDb.getCollection(entityName));
    },
    filter: (filterObj) => {
      const data = mockDb.getCollection(entityName);
      const filtered = data.filter(item => {
        return Object.keys(filterObj).every(key => item[key] === filterObj[key]);
      });
      return Promise.resolve(filtered);
    },
    get: (id) => {
      const data = mockDb.getCollection(entityName);
      return Promise.resolve(data.find(item => item.id === id));
    },
    create: (data) => {
      const collection = mockDb.getCollection(entityName);
      const newItem = { ...data, id: `${Date.now()}`, created_date: new Date().toISOString() };
      collection.push(newItem);
      mockDb.setCollection(entityName, collection);
      return Promise.resolve(newItem);
    },
    update: (id, data) => {
      const collection = mockDb.getCollection(entityName);
      const index = collection.findIndex(item => item.id === id);
      if (index !== -1) {
        collection[index] = { ...collection[index], ...data };
        mockDb.setCollection(entityName, collection);
        return Promise.resolve(collection[index]);
      }
      return Promise.reject(new Error('Item not found'));
    },
    delete: (id) => {
      const collection = mockDb.getCollection(entityName);
      const index = collection.findIndex(item => item.id === id);
      if (index !== -1) {
        collection.splice(index, 1);
        mockDb.setCollection(entityName, collection);
        return Promise.resolve({ success: true });
      }
      return Promise.reject(new Error('Item not found'));
    },
  };
};

// Mock authentication
const mockAuth = {
  me: () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return Promise.resolve(JSON.parse(user));
    }
    // Return default user
    const defaultUser = { id: '1', name: 'משתמש בדיקה', email: 'test@example.com' };
    localStorage.setItem('currentUser', JSON.stringify(defaultUser));
    return Promise.resolve(defaultUser);
  },
  login: (credentials) => {
    const user = { id: '1', name: credentials.email, email: credentials.email };
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', 'mock-token-' + Date.now());
    return Promise.resolve(user);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    return Promise.resolve();
  },
};

// Export mock API client
export const Client = {
  auth: mockAuth,
  entities: {
    Nurse: createEntity('Nurse'),
    Department: createEntity('Department'),
    Notification: createEntity('Notification'),
    NurseAvailability: createEntity('NurseAvailability'),
    NurseWeeklyStatus: createEntity('NurseWeeklyStatus'),
    ScheduleWeek: createEntity('ScheduleWeek'),
    ShiftAssignment: createEntity('ShiftAssignment'),
    UserSettings: createEntity('UserSettings'),
  },
};


export default Client;