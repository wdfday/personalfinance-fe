## Redux Actions/Slices Usage Guide

Hướng dẫn sử dụng Redux với User & Profile modules.

## 📦 Structure

```
features/
├── auth/
│   └── authSlice.ts       # Authentication (login, register)
├── user/
│   └── userSlice.ts       # User basic info
├── profile/
│   └── profileSlice.ts    # User financial profile
└── ...

hooks/
├── use-auth-redux.ts      # Auth hooks
├── use-user.ts            # User hooks
└── use-profile.ts         # Profile hooks
```

## 🎯 1. Auth Actions (authSlice)

### State Structure
```typescript
interface AuthState {
  authInfo: UserAuthInfo | null  // Minimal info từ login
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}
```

### Actions
- `loginUser(credentials)` - Login
- `registerUser(userData)` - Register
- `checkAuth()` - Check authentication
- `logout()` - Logout
- `clearAuthError()` - Clear error

### Usage with Hook
```typescript
import { useAuthRedux } from '@/hooks/use-auth-redux'

const LoginPage = () => {
  const { login, isLoading, error, isAuthenticated } = useAuthRedux()

  const handleLogin = async () => {
    try {
      await login({ 
        email: 'user@example.com', 
        password: 'password' 
      })
      // Login success
      router.push('/dashboard')
    } catch (err) {
      console.error('Login failed')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <p>{error}</p>}
      <button disabled={isLoading}>Login</button>
    </form>
  )
}
```

## 👤 2. User Actions (userSlice)

### State Structure
```typescript
interface UserState {
  currentUser: User | null
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
}
```

### Actions
- `fetchCurrentUser()` - GET /user/me
- `updateUserProfile(data)` - PUT /user/me
- `changePassword(data)` - Change password
- `clearUserError()` - Clear error
- `setUser(user)` - Set user manually
- `clearUser()` - Clear user state

### Usage with Hook
```typescript
import { useUser } from '@/hooks/use-user'

const SettingsPage = () => {
  const { 
    user, 
    isLoading, 
    error,
    fetchUser,
    updateProfile,
    updatePassword 
  } = useUser()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        full_name: 'Nguyễn Văn A',
        phone_number: '+84912345678',
      })
      toast.success('Updated successfully')
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const handleChangePassword = async () => {
    try {
      await updatePassword('oldPassword', 'newPassword')
      toast.success('Password changed')
    } catch (err) {
      toast.error('Password change failed')
    }
  }

  if (isLoading) return <Loading />
  if (error) return <Error message={error} />

  return (
    <div>
      <h2>{user?.full_name}</h2>
      <p>{user?.email}</p>
      <button onClick={handleUpdateProfile}>Update Profile</button>
      <button onClick={handleChangePassword}>Change Password</button>
    </div>
  )
}
```

## 💼 3. Profile Actions (profileSlice)

### State Structure
```typescript
interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
  isOnboardingCompleted: boolean
}
```

### Actions
- `fetchProfile()` - GET /profile/me
- `updateProfile(data)` - PUT /profile/me
- `completeOnboarding()` - Mark onboarding complete
- `checkOnboardingStatus()` - Check onboarding status
- `clearProfileError()` - Clear error
- `setProfile(profile)` - Set profile manually
- `clearProfile()` - Clear profile state
- `updateProfileField(data)` - Update specific fields

### Usage with Hook
```typescript
import { useProfile } from '@/hooks/use-profile'

const ProfileSettingsPage = () => {
  const {
    profile,
    isLoading,
    error,
    isOnboardingCompleted,
    fetchProfile,
    updateProfile,
    completeOnboarding,
  } = useProfile()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleUpdateFinancialInfo = async () => {
    try {
      await updateProfile({
        monthly_income_avg: 50000000,
        risk_tolerance: 'moderate',
        investment_horizon: 'long',
        budget_method: '50_30_20',
      })
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding()
      router.push('/dashboard')
    } catch (err) {
      toast.error('Failed to complete onboarding')
    }
  }

  return (
    <div>
      <h2>Financial Profile</h2>
      <p>Income: {profile?.monthly_income_avg}</p>
      <p>Risk Tolerance: {profile?.risk_tolerance}</p>
      <button onClick={handleUpdateFinancialInfo}>Update</button>
      
      {!isOnboardingCompleted && (
        <button onClick={handleCompleteOnboarding}>
          Complete Onboarding
        </button>
      )}
    </div>
  )
}
```

## 🔄 Complete Flow Example

### Login → Load User & Profile

```typescript
import { useAuthRedux } from '@/hooks/use-auth-redux'
import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/hooks/use-profile'

const App = () => {
  const { login, isAuthenticated } = useAuthRedux()
  const { fetchUser, user } = useUser()
  const { fetchProfile, profile } = useProfile()

  const handleLogin = async (credentials) => {
    // Step 1: Login
    await login(credentials)
    
    // Step 2: Load user info
    await fetchUser()
    
    // Step 3: Load profile
    await fetchProfile()
    
    // Now you have all data
    console.log('User:', user)
    console.log('Profile:', profile)
  }

  return <LoginForm onSubmit={handleLogin} />
}
```

### Settings Page with Both Modules

```typescript
import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/hooks/use-profile'

const SettingsPage = () => {
  const { user, updateProfile: updateUser } = useUser()
  const { profile, updateProfile: updateUserProfile } = useProfile()

  useEffect(() => {
    // Load cả 2 modules song song
    Promise.all([
      dispatch(fetchCurrentUser()),
      dispatch(fetchProfile()),
    ])
  }, [])

  // Update basic info (User module)
  const handleUpdateBasic = async (data) => {
    await updateUser({
      full_name: data.name,
      phone_number: data.phone,
    })
  }

  // Update financial info (Profile module)
  const handleUpdateFinancial = async (data) => {
    await updateUserProfile({
      monthly_income_avg: data.income,
      risk_tolerance: data.risk,
    })
  }

  return (
    <div>
      <BasicInfoForm 
        user={user} 
        onSave={handleUpdateBasic} 
      />
      
      <FinancialInfoForm 
        profile={profile} 
        onSave={handleUpdateFinancial} 
      />
    </div>
  )
}
```

## 🎛️ Direct Redux Usage (without hooks)

```typescript
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '@/features/user/userSlice'
import { fetchProfile } from '@/features/profile/profileSlice'
import type { RootState, AppDispatch } from '@/lib/store'

const Component = () => {
  const dispatch = useDispatch<AppDispatch>()
  
  // Selectors
  const user = useSelector((state: RootState) => state.user.currentUser)
  const profile = useSelector((state: RootState) => state.profile.profile)
  const isLoading = useSelector((state: RootState) => 
    state.user.isLoading || state.profile.isLoading
  )

  // Dispatch actions
  useEffect(() => {
    dispatch(fetchCurrentUser())
    dispatch(fetchProfile())
  }, [dispatch])

  return <div>{user?.full_name}</div>
}
```

## 🔐 Protected Routes Example

```typescript
import { useAuthRedux } from '@/hooks/use-auth-redux'
import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/hooks/use-profile'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthRedux()
  const { fetchUser } = useUser()
  const { isOnboardingCompleted, checkOnboardingStatus } = useProfile()

  useEffect(() => {
    const init = async () => {
      // Check auth
      await checkAuth()
      
      // Load user
      await fetchUser()
      
      // Check onboarding
      await checkOnboardingStatus()
      
      // Redirect if needed
      if (!isOnboardingCompleted) {
        router.push('/onboarding')
      }
    }
    
    init()
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}
```

## 📊 Selectors

```typescript
// Custom selectors
export const selectUserFullName = (state: RootState) => 
  state.user.currentUser?.full_name

export const selectProfileIncome = (state: RootState) => 
  state.profile.profile?.monthly_income_avg

export const selectIsProfileComplete = (state: RootState) => {
  const profile = state.profile.profile
  return !!(
    profile?.occupation &&
    profile?.monthly_income_avg &&
    profile?.risk_tolerance
  )
}

// Usage
const fullName = useSelector(selectUserFullName)
const income = useSelector(selectProfileIncome)
const isComplete = useSelector(selectIsProfileComplete)
```

## ⚡ Performance Tips

1. **Use selectors for derived data**
2. **Memoize expensive computations** with `createSelector`
3. **Load data on mount** with `useEffect`
4. **Clear error states** after displaying
5. **Use `lastUpdated`** to avoid unnecessary re-fetches

## 🎯 Best Practices

✅ **DO:**
- Use hooks for component logic
- Load user + profile together on login
- Clear errors after showing to user
- Check `lastUpdated` before re-fetching
- Use `isOnboardingCompleted` to guard routes

❌ **DON'T:**
- Don't mix User and Profile data
- Don't forget to handle loading states
- Don't ignore error states
- Don't fetch data on every render

