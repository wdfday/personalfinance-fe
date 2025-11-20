# Frontend Feature Architecture

## Tổng quan

Ứng dụng Personal Finance DSS đã được chia thành các feature riêng biệt sử dụng Redux Toolkit để quản lý state. Mỗi feature có cấu trúc độc lập và có thể phát triển song song.

## Cấu trúc thư mục

```
client/
├── features/                    # Các feature modules
│   ├── auth/                   # Authentication feature
│   │   └── authSlice.ts        # Redux slice cho auth
│   ├── accounts/               # Accounts management feature
│   │   ├── accountsSlice.ts    # Redux slice cho accounts
│   │   └── create-account-modal.tsx
│   ├── transactions/           # Transactions feature
│   │   ├── transactionsSlice.ts
│   │   └── create-transaction-modal.tsx
│   ├── budgets/                # Budgets feature
│   │   └── budgetsSlice.ts
│   ├── goals/                  # Financial goals feature
│   │   └── goalsSlice.ts
│   ├── investments/            # Investments feature
│   │   └── investmentsSlice.ts
│   ├── categories/             # Categories feature
│   │   └── categoriesSlice.ts
│   └── dashboard/              # Dashboard feature
│       └── dashboardSlice.ts
├── app/                        # Next.js App Router pages
│   ├── accounts/               # Accounts pages
│   ├── transactions/           # Transactions pages
│   ├── budgets/                # Budgets pages
│   ├── goals/                  # Goals pages
│   ├── investments/            # Investments pages
│   ├── categories/             # Categories pages
│   └── analytics/              # Analytics pages
├── lib/                        # Shared utilities
│   ├── store.ts               # Redux store configuration
│   ├── hooks.ts               # Typed Redux hooks
│   ├── api.ts                 # API client
│   └── redux-provider.tsx     # Redux Provider wrapper
└── components/                 # Shared UI components
    └── ui/                     # Reusable UI components
```

## Redux Architecture

### Store Configuration
- **Store**: Centralized state management với Redux Toolkit
- **Slices**: Mỗi feature có một slice riêng biệt
- **Async Thunks**: Xử lý các API calls bất đồng bộ
- **Typed Hooks**: `useAppDispatch` và `useAppSelector` với TypeScript

### Feature Slices

Mỗi slice bao gồm:
- **State Interface**: Định nghĩa cấu trúc state
- **Async Thunks**: CRUD operations cho API
- **Reducers**: Xử lý state updates
- **Actions**: Synchronous actions

#### Ví dụ: AccountsSlice

```typescript
interface AccountsState {
  accounts: Account[]
  selectedAccount: Account | null
  isLoading: boolean
  error: string | null
  total: number
}

// Async thunks
export const fetchAccounts = createAsyncThunk(...)
export const createAccount = createAsyncThunk(...)
export const updateAccount = createAsyncThunk(...)
export const deleteAccount = createAsyncThunk(...)
```

## API Integration

### API Client (`lib/api.ts`)
- Centralized API client với TypeScript types
- Automatic token management
- Error handling
- Type-safe request/response interfaces

### API Endpoints
- **Accounts**: `/api/v1/accounts`
- **Transactions**: `/api/v1/transactions`
- **Budgets**: `/api/v1/budgets`
- **Goals**: `/api/v1/goals`
- **Investments**: `/api/v1/investments`
- **Categories**: `/api/v1/categories`
- **Summaries**: `/api/v1/summaries`

## Component Architecture

### Page Components
- Mỗi trang sử dụng Redux hooks để lấy data
- Loading states và error handling
- Responsive design với Tailwind CSS

### Modal Components
- Reusable modal components cho CRUD operations
- Form validation với React Hook Form + Zod
- Type-safe form handling

### Shared Components
- UI components trong `components/ui/`
- Business logic components trong `components/`
- Consistent styling với design system

## State Management Patterns

### Data Fetching
```typescript
// Trong component
const dispatch = useAppDispatch()
const { accounts, isLoading, error } = useAppSelector(state => state.accounts)

useEffect(() => {
  dispatch(fetchAccounts())
}, [dispatch])
```

### CRUD Operations
```typescript
// Create
const handleCreate = async (data) => {
  try {
    await dispatch(createAccount(data)).unwrap()
    // Success handling
  } catch (error) {
    // Error handling
  }
}
```

### State Updates
- Immutable updates với Redux Toolkit
- Optimistic updates cho better UX
- Error rollback mechanisms

## Benefits

### 1. **Modularity**
- Mỗi feature độc lập và có thể phát triển riêng biệt
- Dễ dàng thêm/sửa/xóa features

### 2. **Type Safety**
- Full TypeScript support
- Type-safe API calls và state management
- Compile-time error checking

### 3. **Scalability**
- Cấu trúc có thể mở rộng dễ dàng
- Performance optimization với selective re-renders
- Code splitting theo features

### 4. **Maintainability**
- Clear separation of concerns
- Consistent patterns across features
- Easy testing và debugging

### 5. **Developer Experience**
- Hot reloading với Redux DevTools
- Predictable state updates
- Rich debugging capabilities

## Development Workflow

### Thêm Feature mới
1. Tạo feature folder trong `features/`
2. Tạo slice với async thunks
3. Thêm reducer vào store
4. Tạo page components
5. Implement CRUD modals
6. Add routing

### Cập nhật Feature
1. Modify slice logic
2. Update API client nếu cần
3. Update components
4. Test với Redux DevTools

## Best Practices

### 1. **State Structure**
- Keep state flat và normalized
- Use selectors cho derived data
- Avoid nested state updates

### 2. **Async Operations**
- Use createAsyncThunk cho API calls
- Handle loading, success, và error states
- Implement proper error boundaries

### 3. **Component Design**
- Keep components small và focused
- Use custom hooks cho complex logic
- Implement proper loading states

### 4. **Performance**
- Use React.memo cho expensive components
- Implement proper dependency arrays
- Use selectors để avoid unnecessary re-renders

## Testing Strategy

### Unit Tests
- Test individual slices và thunks
- Mock API calls
- Test error scenarios

### Integration Tests
- Test component với Redux store
- Test user interactions
- Test data flow

### E2E Tests
- Test complete user workflows
- Test API integration
- Test error handling

## Future Enhancements

### 1. **Real-time Updates**
- WebSocket integration
- Optimistic updates
- Conflict resolution

### 2. **Offline Support**
- Service worker implementation
- Local storage caching
- Sync when online

### 3. **Performance Optimization**
- Virtual scrolling cho large lists
- Lazy loading cho images
- Code splitting optimization

### 4. **Advanced Features**
- Data export/import
- Advanced filtering và search
- Real-time notifications
- Multi-currency support

