# Module Architecture: Auth vs User vs Profile

## 🏗️ Kiến trúc 3 tầng

```
┌─────────────────────┐
│   AUTH SERVICE      │  Login/Register → UserAuthInfo (minimal)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   USER SERVICE      │  /api/v1/user/me → User (full basic info)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  PROFILE SERVICE    │  /api/v1/profile/me → UserProfile (extended info)
└─────────────────────┘
```

## 📦 1. Auth Service (auth.service.ts)

**Chức năng:** Authentication - Login, Register, Logout

**Backend:** `/api/v1/auth/*`

**Types:**
```typescript
interface UserAuthInfo {
  id: string
  email: string
  full_name: string
  display_name?: string
  avatar_url?: string
  role: string
  status: string
  email_verified: boolean
  mfa_enabled: boolean
  created_at: string
  last_login_at?: string
}

interface AuthResponse {
  user: UserAuthInfo    // ← Minimal user info
  token: TokenInfo
}
```

**Methods:**
- `login(credentials)` → AuthResponse
- `register(data)` → AuthResponse
- `loginWithGoogle(token)` → AuthResponse
- `logout()` → void
- `changePassword(old, new)` → void

**Đặc điểm:**
- ✅ Trả về **UserAuthInfo** - thông tin tối thiểu sau login
- ✅ Quản lý JWT token
- ❌ KHÔNG chứa User type đầy đủ
- ❌ KHÔNG có methods getCurrentUser/updateProfile (đã deprecated)

---

## 👤 2. User Service (user.service.ts)

**Chức năng:** Quản lý thông tin user cơ bản

**Backend:** `/api/v1/user/me`

**Types:**
```typescript
interface User {
  // Kế thừa tất cả fields từ UserAuthInfo, plus:
  phone_number?: string
  date_of_birth?: string
  email_verified_at?: string
  last_active_at: string
  updated_at: string
}

interface UpdateUserProfileRequest {
  full_name?: string
  display_name?: string
  phone_number?: string
}
```

**Methods:**
- `getCurrentUser()` → User (GET /user/me)
- `updateProfile(data)` → User (PUT /user/me)
- `changePassword(data)` → void
- `uploadAvatar(file)` → string (TODO)

**Đặc điểm:**
- ✅ Quản lý **User model** từ backend
- ✅ CRUD operations cho basic user info
- ✅ Link với user table trong database
- ❌ KHÔNG chứa financial/preference data

---

## 💼 3. Profile Service (profile.service.ts)

**Chức năng:** Quản lý thông tin mở rộng về tài chính & preferences

**Backend:** `/api/v1/profile/me`

**Types:**
```typescript
interface UserProfile {
  user_id: string
  
  // Personal & Employment
  occupation?: string
  industry?: string
  employer?: string
  marital_status?: string
  dependents_count?: number
  
  // Financial Status
  monthly_income_avg?: number
  emergency_fund_months?: number
  debt_to_income_ratio?: number
  credit_score?: number
  income_stability?: string
  
  // Investment Profile
  risk_tolerance: string
  investment_horizon: string
  investment_experience: string
  
  // Budget & Settings
  budget_method: string
  notification_channels: string[]
  currency_primary: string
  currency_secondary: string
  
  // Onboarding
  onboarding_completed: boolean
  primary_goal?: string
  
  created_at: string
  updated_at: string
}
```

**Methods:**
- `getProfile()` → UserProfile (GET /profile/me)
- `updateProfile(data)` → UserProfile (PUT /profile/me)
- `isOnboardingCompleted()` → boolean
- `completeOnboarding()` → UserProfile

**Đặc điểm:**
- ✅ Quản lý **Profile model** từ backend (bảng riêng)
- ✅ Chứa financial data, preferences, settings
- ✅ Link với user qua user_id
- ❌ KHÔNG duplicate basic user info

---

## 🔄 Flow hoàn chỉnh

### 1. Login Flow

```typescript
// Step 1: Login → nhận UserAuthInfo + token
const authResponse = await authService.login({ email, password })
// authResponse.user = UserAuthInfo (minimal)

// Step 2: Lấy full User info
const user = await userService.getCurrentUser()
// user = User (full basic info)

// Step 3: Lấy extended profile (optional)
const profile = await profileService.getProfile()
// profile = UserProfile (financial + preferences)
```

### 2. Register Flow

```typescript
// Step 1: Register
await authService.register({ email, password, full_name })

// Step 2: Get full user
const user = await userService.getCurrentUser()

// Step 3: Setup profile (lần đầu)
await profileService.updateProfile({
  risk_tolerance: 'moderate',
  budget_method: '50_30_20',
  currency_primary: 'VND',
})
```

### 3. Settings Page

```typescript
const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // Load cả 2 modules song song
    Promise.all([
      userService.getCurrentUser(),
      profileService.getProfile(),
    ]).then(([userData, profileData]) => {
      setUser(userData)
      setProfile(profileData)
    })
  }, [])

  const handleUpdateBasicInfo = async (data) => {
    // Update User module
    const updated = await userService.updateProfile({
      full_name: data.full_name,
      phone_number: data.phone_number,
    })
    setUser(updated)
  }

  const handleUpdateFinancial = async (data) => {
    // Update Profile module
    const updated = await profileService.updateProfile({
      monthly_income_avg: data.income,
      risk_tolerance: data.risk,
    })
    setProfile(updated)
  }

  return (
    <>
      <BasicInfoForm user={user} onSave={handleUpdateBasicInfo} />
      <FinancialInfoForm profile={profile} onSave={handleUpdateFinancial} />
    </>
  )
}
```

---

## 📊 Database Schema

### User Table (users)
```sql
- id (UUID)
- email (string)
- full_name (string)
- display_name (string?)
- phone_number (string?)
- avatar_url (string?)
- role (enum)
- status (enum)
- email_verified (boolean)
- created_at, updated_at
```

### Profile Table (profiles)
```sql
- user_id (UUID FK → users.id)
- occupation (string?)
- industry (string?)
- monthly_income_avg (decimal?)
- risk_tolerance (enum)
- budget_method (enum)
- currency_primary (string)
- onboarding_completed (boolean)
- created_at, updated_at
```

---

## ✅ Best Practices

### DO ✅
- Dùng `userService` cho basic info (name, email, phone)
- Dùng `profileService` cho financial data
- Load cả 2 parallel với `Promise.all()` nếu cần
- Check `onboarding_completed` trước khi vào app

### DON'T ❌
- KHÔNG dùng `authService.getCurrentUser()` (deprecated)
- KHÔNG dùng `authService.updateProfile()` (deprecated)
- KHÔNG mix data giữa User và Profile
- KHÔNG lưu financial data trong User table

---

## 🎯 Type Exports

```typescript
// ✅ ĐÚNG
import type { UserAuthInfo } from '@/services/api'  // từ auth.service
import type { User } from '@/services/api'          // từ user.service
import type { UserProfile } from '@/services/api'   // từ profile.service

// ❌ SAI
import type { User } from '@/services/api/auth.service'  // User không còn ở đây
```

---

## 🔑 Summary

| Service | Backend Endpoint | Type | Purpose |
|---------|-----------------|------|---------|
| **Auth** | `/api/v1/auth/*` | `UserAuthInfo` | Login/Register minimal info |
| **User** | `/api/v1/user/me` | `User` | Full basic user info |
| **Profile** | `/api/v1/profile/me` | `UserProfile` | Extended financial/preferences |

**Remember:** 
- Auth → Login
- User → Basic Info  
- Profile → Financial Data

