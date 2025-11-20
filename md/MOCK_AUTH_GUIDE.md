# Mock Authentication Guide

## 🎯 Tổng quan

Hệ thống authentication đã được cấu hình để sử dụng **Mock Data** thay vì call API thực tế. Điều này cho phép bạn test và phát triển frontend mà không cần backend server.

## 👤 Mock User Data

### User Information
```typescript
{
  id: '1',
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  phone: '+1234567890',
  avatar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-20T14:22:00Z'
}
```

### Auth Token
```typescript
{
  token: 'mock-jwt-token-1234567890',
  expires_at: '2024-12-31T23:59:59Z'
}
```

## 🔐 Authentication Features

### 1. **Auto Login**
- User được tự động đăng nhập với mock data
- Không cần nhập email/password
- Có thể truy cập tất cả trang ngay lập tức

### 2. **User Display**
- TopNav hiển thị thông tin user từ Redux
- Avatar và tên user được hiển thị
- Email user được hiển thị

### 3. **Logout Functionality**
- Nút logout hoạt động
- Redirect đến trang login sau khi logout
- Clear Redux state

## 🚀 Cách sử dụng

### 1. **Start Development Server**
```bash
cd client
npm run dev
```

### 2. **Access Pages**
- **Dashboard**: `http://localhost:3000/` - Hiển thị với user đã đăng nhập
- **Accounts**: `http://localhost:3000/accounts` - Hiển thị với user context
- **Transactions**: `http://localhost:3000/transactions` - Hiển thị với user context
- **Budgets**: `http://localhost:3000/budgets` - Hiển thị với user context
- **Goals**: `http://localhost:3000/goals` - Hiển thị với user context
- **Investments**: `http://localhost:3000/investments` - Hiển thị với user context
- **Categories**: `http://localhost:3000/categories` - Hiển thị với user context
- **Analytics**: `http://localhost:3000/analytics` - Hiển thị với user context

### 3. **Test Authentication**
- User được tự động đăng nhập
- TopNav hiển thị thông tin user
- Có thể click logout để test logout flow

## 🔧 Technical Implementation

### Mock Data Structure
```typescript
// mock-data.ts
export const mockUser = {
  id: '1',
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  phone: '+1234567890',
  avatar: 'https://...',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-20T14:22:00Z'
}

export const mockAuthToken = 'mock-jwt-token-1234567890'

export const mockAuthResponse = {
  user: mockUser,
  token: mockAuthToken,
  expires_at: '2024-12-31T23:59:59Z'
}
```

### Mock API Client
```typescript
// mock-api.ts
class MockApiClient {
  async login(credentials) {
    return Promise.resolve(mockAuthResponse)
  }

  async register(userData) {
    return Promise.resolve(mockAuthResponse)
  }

  async checkAuth() {
    return Promise.resolve({ user: mockUser, token: mockAuthToken })
  }

  logout() {
    return Promise.resolve()
  }
}
```

### Redux State
```typescript
// authSlice.ts
const initialState: AuthState = {
  user: mockUser,           // Mock user data
  token: mockAuthToken,     // Mock token
  isLoading: false,
  error: null,
  isAuthenticated: true,    // Always authenticated
}
```

## 🎨 UI Features

### TopNav Integration
- **User Avatar**: Hiển thị avatar từ mock data
- **User Name**: Hiển thị tên từ Redux state
- **User Email**: Hiển thị email từ Redux state
- **Logout Button**: Hoạt động với Redux dispatch

### Authentication Flow
- **Auto Login**: User được đăng nhập tự động
- **State Management**: Redux quản lý auth state
- **UI Updates**: UI cập nhật theo auth state
- **Logout Flow**: Complete logout với state clear

## 🔄 Data Flow

### Authentication Flow
```
App Start → Redux State → Mock User → UI Display
```

### Logout Flow
```
Logout Click → Redux Action → State Clear → Redirect to Login
```

### State Management
```
Redux Store → useAppSelector → Component → UI Update
```

## 🧪 Testing Scenarios

### 1. **Auto Login**
- App khởi động với user đã đăng nhập
- TopNav hiển thị thông tin user
- Có thể truy cập tất cả trang

### 2. **User Display**
- Avatar hiển thị đúng
- Tên user hiển thị đúng
- Email user hiển thị đúng

### 3. **Logout Flow**
- Click logout button
- Redux state được clear
- Redirect đến login page

### 4. **Page Access**
- Tất cả trang đều accessible
- Không cần authentication
- User context available

## 🔧 Customization

### Changing User Data
1. Edit `client/lib/mock-data.ts`
2. Update `mockUser` object
3. Restart development server

### Adding New Auth Features
1. Update `mock-api.ts`
2. Add new methods
3. Update Redux slice
4. Test the changes

### Switching to Real API
1. Update `api.ts` to use real API calls
2. Remove mock data imports
3. Enable real authentication
4. Test with backend

## 🚀 Production Ready

### Switch to Real API
1. **Enable Real Auth**: Update API client
2. **Remove Mock Data**: Remove mock imports
3. **Update Redux**: Use real API responses
4. **Test Integration**: Verify with backend

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NODE_ENV=production
```

## 📊 Benefits

### Development
- ✅ **No Backend Required**: Develop frontend independently
- ✅ **Fast Development**: No API setup needed
- ✅ **Consistent Data**: Predictable user data
- ✅ **Easy Testing**: Test all scenarios

### User Experience
- ✅ **Auto Login**: No need to enter credentials
- ✅ **Realistic UI**: Full authentication UI
- ✅ **Complete Flow**: Login/logout functionality
- ✅ **User Context**: User data available everywhere

## 🎯 Next Steps

### Immediate
1. **Test All Pages**: Verify user context works
2. **Test Logout**: Verify logout flow works
3. **Add More Users**: Create multiple mock users
4. **Improve UI**: Enhance user display

### Future
1. **Real API Integration**: Connect to backend
2. **Multiple Users**: Support multiple user types
3. **Permissions**: Add role-based access
4. **Real-time Updates**: WebSocket integration

## 🎉 Kết luận

Mock authentication system đã được hoàn thiện với:

### ✅ **Complete Features**
- Auto login with mock user
- User display in TopNav
- Logout functionality
- Redux state management

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

**Frontend giờ đây có hệ thống authentication hoàn chỉnh với mock data!** 🚀

Bạn có thể bắt đầu test ngay bằng cách chạy `npm run dev` và truy cập các trang khác nhau. User sẽ được tự động đăng nhập và có thể sử dụng tất cả tính năng.
