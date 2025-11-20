# Mock Data Guide - Personal Finance DSS

## 🎯 Tổng quan

Frontend hiện tại đã được cấu hình để sử dụng **Mock Data** thay vì call API thực tế. Điều này cho phép bạn test và phát triển frontend mà không cần backend server.

## 📊 Mock Data Available

### 1. **Accounts** (5 accounts)
- **Checking Account**: $7,500.50
- **Savings Account**: $25,000.00  
- **Investment Portfolio**: $150,000.75
- **Credit Card**: -$2,500.25
- **Cash Wallet**: $500.00

### 2. **Transactions** (5 transactions)
- Grocery shopping: -$125.50
- Electricity bill: -$85.00
- Monthly salary: +$5,000.00
- Dinner at restaurant: -$45.75
- Dividend payment: +$250.00

### 3. **Budgets** (3 budgets)
- Monthly Groceries: $500.00 (spent: $375.50)
- Entertainment: $200.00 (spent: $180.25)
- Utilities: $300.00 (spent: $285.00)

### 4. **Goals** (3 goals)
- Emergency Fund: $15,000 target (current: $8,500)
- Europe Vacation: $5,000 target (current: $2,200)
- New Car: $10,000 target (current: $3,500)

### 5. **Investments** (3 investments)
- Apple Inc. (AAPL): 10 shares @ $185.50
- Alphabet Inc. (GOOGL): 5 shares @ $2,950.00
- Vanguard Total Stock Market: 100 shares @ $98.50

### 6. **Categories** (5 categories)
- Groceries 🛒
- Utilities ⚡
- Salary 💰
- Dining 🍽️
- Investment 📈

## 🔧 Cấu hình Mock Data

### File Structure
```
client/lib/
├── mock-data.ts      # Mock data definitions
├── mock-api.ts       # Mock API client
└── api.ts           # Main API client (uses mock)
```

### Mock API Client Features
- ✅ **Simulated Network Delay**: 300-500ms delay
- ✅ **CRUD Operations**: Create, Read, Update, Delete
- ✅ **Filtering & Pagination**: Support for query parameters
- ✅ **Error Handling**: Proper error responses
- ✅ **Data Persistence**: Changes persist during session

## 🚀 Cách sử dụng

### 1. **Start Development Server**
```bash
cd client
npm run dev
```

### 2. **Access Pages**
- **Dashboard**: `http://localhost:3000/`
- **Accounts**: `http://localhost:3000/accounts`
- **Transactions**: `http://localhost:3000/transactions`
- **Budgets**: `http://localhost:3000/budgets`
- **Goals**: `http://localhost:3000/goals`
- **Investments**: `http://localhost:3000/investments`
- **Categories**: `http://localhost:3000/categories`
- **Analytics**: `http://localhost:3000/analytics`

### 3. **Test Features**
- ✅ View all data
- ✅ Create new items
- ✅ Edit existing items
- ✅ Delete items
- ✅ Filter and search
- ✅ Responsive design

## 📱 Available Pages

### Dashboard (`/`)
- Account overview với total balance
- Recent transactions
- Quick actions
- Business metrics

### Accounts (`/accounts`)
- List all accounts
- Create new account
- Edit account details
- Delete account
- Account balance display

### Transactions (`/transactions`)
- List all transactions
- Create new transaction
- Edit transaction
- Delete transaction
- Filter by type, account, date

### Budgets (`/budgets`)
- List all budgets
- Create new budget
- Edit budget
- Delete budget
- Progress tracking

### Goals (`/goals`)
- List all goals
- Create new goal
- Edit goal
- Delete goal
- Progress visualization

### Investments (`/investments`)
- List all investments
- Create new investment
- Edit investment
- Delete investment
- Performance tracking

### Categories (`/categories`)
- List all categories
- Create new category
- Edit category
- Delete category
- Category management

### Analytics (`/analytics`)
- Account growth charts
- Transaction trends
- Budget analysis
- Goal progress
- Investment performance

## 🎨 UI Features

### Components
- ✅ **Responsive Design**: Mobile-friendly
- ✅ **Dark Mode**: Theme switching
- ✅ **Loading States**: Spinner animations
- ✅ **Error Handling**: User-friendly messages
- ✅ **Form Validation**: Real-time validation
- ✅ **Modals**: Create/Edit forms
- ✅ **Charts**: Data visualization

### Styling
- ✅ **Tailwind CSS**: Utility-first styling
- ✅ **Radix UI**: Accessible components
- ✅ **Lucide Icons**: Beautiful icons
- ✅ **Custom Components**: Reusable UI elements

## 🔄 Data Flow

### Redux State Management
```
User Action → Component → Redux Action → Mock API → State Update → UI Re-render
```

### Mock API Flow
```
Component → API Client → Mock API Client → Mock Data → Response → Component
```

## 🧪 Testing Scenarios

### 1. **View Data**
- All pages load with mock data
- Data displays correctly
- Loading states work
- Error handling works

### 2. **Create Operations**
- Create new account
- Create new transaction
- Create new budget
- Create new goal
- Create new investment
- Create new category

### 3. **Edit Operations**
- Edit account details
- Edit transaction
- Edit budget
- Edit goal
- Edit investment
- Edit category

### 4. **Delete Operations**
- Delete account
- Delete transaction
- Delete budget
- Delete goal
- Delete investment
- Delete category

### 5. **Filtering & Search**
- Filter transactions by type
- Filter by account
- Search functionality
- Pagination

## 🔧 Customization

### Adding New Mock Data
1. Edit `client/lib/mock-data.ts`
2. Add new data to appropriate array
3. Update types if needed
4. Test the changes

### Modifying Mock API
1. Edit `client/lib/mock-api.ts`
2. Update methods as needed
3. Add new endpoints
4. Test the changes

### Changing API Behavior
1. Edit `client/lib/api.ts`
2. Switch between mock and real API
3. Add fallback logic
4. Test the changes

## 🚀 Production Ready

### Switch to Real API
1. **Enable Authentication**: Uncomment auth guard
2. **Update API Client**: Switch to real API calls
3. **Remove Mock Data**: Remove mock imports
4. **Test Integration**: Verify with backend

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NODE_ENV=production
```

## 📊 Performance

### Mock API Performance
- ✅ **Fast Response**: 300-500ms delay
- ✅ **Memory Efficient**: In-memory storage
- ✅ **No Network**: No real API calls
- ✅ **Consistent**: Predictable responses

### Frontend Performance
- ✅ **Fast Loading**: Optimized components
- ✅ **Efficient Rendering**: React optimizations
- ✅ **Bundle Size**: Optimized build
- ✅ **Caching**: Redux state caching

## 🎯 Next Steps

### Immediate
1. **Test All Pages**: Verify all features work
2. **Add More Data**: Expand mock data
3. **Improve UI**: Enhance user experience
4. **Add Tests**: Unit and integration tests

### Future
1. **Real API Integration**: Connect to backend
2. **Authentication**: Enable auth system
3. **Real-time Updates**: WebSocket integration
4. **Advanced Features**: More functionality

## 🎉 Kết luận

Mock data system đã được hoàn thiện với:

### ✅ **Complete Features**
- All CRUD operations
- Realistic data
- Proper error handling
- Loading states
- Responsive design

### ✅ **Developer Experience**
- Easy to test
- No backend required
- Fast development
- Clear structure

### ✅ **Production Ready**
- Easy to switch to real API
- Scalable architecture
- Maintainable code
- Well documented

**Frontend giờ đây có thể hoạt động hoàn toàn với mock data!** 🚀

Bạn có thể bắt đầu test ngay bằng cách chạy `npm run dev` và truy cập các trang khác nhau.
