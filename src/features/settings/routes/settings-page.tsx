"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { useTranslation } from "@/contexts/i18n-context"
import { translations } from "@/lib/i18n/translations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageSwitcher } from "@/features/settings/components/language-switcher"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Laptop, Smartphone, Tablet, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { userService, profileService, authService } from "@/services/api"
import type { UserProfile } from "@/services/api"
import { getErrorMessage } from "@/services/api/utils"

const defaultAvatars = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9439775.jpg-4JVJWOjPksd3DtnBYJXoWHA5lc1DU9.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238645_11475210.jpg-lU8bOe6TLt5Rv51hgjg8NT8PsDBmvN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238208_11475222.jpg-poEIzVHAGiIfMFQ7EiF8PUG1u0Zkzz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-4MCwPC2Bec6Ume26Yo1kao3CnONxDg.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334178.jpg-Y74tW6XFO68g7N36SE5MSNDNVKLQ08.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5295.jpg-fLw0wGGZp8wuTzU5dnyfjZDwAHN98a.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9720029.jpg-Yf9h2a3kT7rYyCb648iLIeHThq5wEy.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27470341_7294795.jpg-XE0zf7R8tk4rfA1vm4fAHeZ1QoVEOo.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/799.jpg-0tEi4Xvg5YsFoGoQfQc698q4Dygl1S.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334228.jpg-eOsHCkvVrVAwcPHKYSs5sQwVKsqWpC.jpeg",
]

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings()
  const { t, locale } = useTranslation("settings")
  
  // Get timezones from translations
  const timezones = translations[locale]?.settings?.account?.timezones || {}
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(true)
  
  // Form states
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || settings.avatar)
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [displayName, setDisplayName] = useState(user?.display_name || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "")
  const [email, setEmail] = useState(user?.email || "")
  
  // Profile form states
  const [occupation, setOccupation] = useState("")
  const [industry, setIndustry] = useState("")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [riskTolerance, setRiskTolerance] = useState("moderate")
  const [investmentHorizon, setInvestmentHorizon] = useState("medium")
  const [budgetMethod, setBudgetMethod] = useState("custom")
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactor, setTwoFactor] = useState(false)
  
  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false)

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileService.getProfile()
        setProfile(profileData)
        
        // Update form states
        setOccupation(profileData.occupation || "")
        setIndustry(profileData.industry || "")
        setMonthlyIncome(profileData.monthly_income_avg?.toString() || "")
        setRiskTolerance(profileData.risk_tolerance || "moderate")
        setInvestmentHorizon(profileData.investment_horizon || "medium")
        setBudgetMethod(profileData.budget_method || "custom")
      } catch (error) {
        console.error("Failed to load profile:", getErrorMessage(error))
      } finally {
        setIsLoadingProfileData(false)
      }
    }
    
    loadProfile()
  }, [])

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "")
      setDisplayName(user.display_name || "")
      setPhoneNumber(user.phone_number || "")
      setEmail(user.email || "")
      setSelectedAvatar(user.avatar_url || settings.avatar)
    }
  }, [user, settings.avatar])

  const handleSaveAccount = async () => {
    setIsLoadingProfile(true)
    try {
      await updateProfile({
        full_name: fullName,
        display_name: displayName || undefined,
        phone_number: phoneNumber || undefined,
      })
      
      // Update local settings
      updateSettings({
        avatar: selectedAvatar,
        fullName: fullName,
        email: email,
        phone: phoneNumber,
      })
      
      toast.success(t("account.success"))
    } catch (error) {
      toast.error(t("account.error", { values: { message: getErrorMessage(error) } }))
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("security.validation.fillAllFields"))
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(t("security.validation.passwordMismatch"))
      return
    }
    
    if (newPassword.length < 6) {
      toast.error(t("security.validation.passwordMinLength"))
      return
    }

    setIsLoadingPassword(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      
      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      toast.success(t("security.success"))
    } catch (error) {
      toast.error(t("security.error", { values: { message: getErrorMessage(error) } }))
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleSaveNotifications = () => {
    updateNotificationSettings(settings.notifications)
    toast.success(t("notifications.success"))
  }

  const handleSavePrivacy = () => {
    updatePrivacySettings(settings.privacy)
    toast.success(t("privacy.success"))
  }

  const handleSaveFinancialProfile = async () => {
    setIsLoadingFinancial(true)
    try {
      const updatedProfile = await profileService.updateProfile({
        occupation: occupation || undefined,
        industry: industry || undefined,
        monthly_income_avg: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        risk_tolerance: riskTolerance as any,
        investment_horizon: investmentHorizon as any,
        budget_method: budgetMethod as any,
      })
      
      setProfile(updatedProfile)
      toast.success(t("financial.success"))
    } catch (error) {
      toast.error(t("financial.error", { values: { message: getErrorMessage(error) } }))
    } finally {
      setIsLoadingFinancial(false)
    }
  }

  if (!user || isLoadingProfileData) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("page.loading")}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t("page.title")}</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="account">{t("tabs.account")}</TabsTrigger>
          <TabsTrigger value="financial">{t("tabs.financial")}</TabsTrigger>
          <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("tabs.preferences")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="privacy">{t("tabs.privacy")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t("account.title")}</CardTitle>
              <CardDescription>{t("account.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t("account.currentAvatar")}</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedAvatar} alt={fullName} />
                    <AvatarFallback>
                      {fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("account.id")}: {user.id}</p>
                    <p className="text-sm text-muted-foreground">{t("account.role")}: {user.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("account.status")}: {user.email_verified ? t("account.emailVerified") : t("account.emailNotVerified")}
                    </p>
                  </div>
                </div>
                <Label>{t("account.selectNewAvatar")}</Label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {defaultAvatars.map((avatar, index) => (
                    <Avatar
                      key={index}
                      className={`h-20 w-20 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary shrink-0 ${
                        selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} className="object-cover" />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-avatar">{t("account.uploadCustomAvatar")}</Label>
                  <Input id="custom-avatar" type="file" accept="image/*" className="mt-1" disabled />
                  <p className="text-xs text-muted-foreground mt-1">{t("account.customAvatarHelper")}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">{t("account.fullName")}</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">{t("account.displayName")}</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("account.displayNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("account.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">{t("account.emailCannotChange")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("account.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("account.phonePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("account.timezone")}</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSettings({ timezone: value })}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder={t("account.timezonePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(timezones).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t("account.registeredAt")}: {new Date(user.created_at).toLocaleString("vi-VN")}</p>
                <p>{t("account.lastUpdated")}: {new Date(user.updated_at).toLocaleString("vi-VN")}</p>
                {user.last_login_at && (
                  <p>{t("account.lastLogin")}: {new Date(user.last_login_at).toLocaleString("vi-VN")}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount} disabled={isLoadingProfile}>
                {isLoadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("account.saveAccount")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>{t("financial.title")}</CardTitle>
              <CardDescription>{t("financial.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="occupation">{t("financial.occupation")}</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder={t("financial.occupationPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">{t("financial.industry")}</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder={t("financial.industryPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly-income">{t("financial.monthlyIncome")}</Label>
                <Input
                  id="monthly-income"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder={t("financial.monthlyIncomePlaceholder")}
                />
                {monthlyIncome && (
                  <p className="text-sm text-muted-foreground">
                    {parseFloat(monthlyIncome).toLocaleString("vi-VN")} VND
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-tolerance">{t("financial.riskTolerance")}</Label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                  <SelectTrigger id="risk-tolerance">
                    <SelectValue placeholder={t("financial.riskTolerancePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">{t("financial.riskToleranceOptions.conservative")}</SelectItem>
                    <SelectItem value="moderate">{t("financial.riskToleranceOptions.moderate")}</SelectItem>
                    <SelectItem value="aggressive">{t("financial.riskToleranceOptions.aggressive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-horizon">{t("financial.investmentHorizon")}</Label>
                <Select value={investmentHorizon} onValueChange={setInvestmentHorizon}>
                  <SelectTrigger id="investment-horizon">
                    <SelectValue placeholder={t("financial.investmentHorizonPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t("financial.investmentHorizonOptions.short")}</SelectItem>
                    <SelectItem value="medium">{t("financial.investmentHorizonOptions.medium")}</SelectItem>
                    <SelectItem value="long">{t("financial.investmentHorizonOptions.long")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-method">{t("financial.budgetMethod")}</Label>
                <Select value={budgetMethod} onValueChange={setBudgetMethod}>
                  <SelectTrigger id="budget-method">
                    <SelectValue placeholder={t("financial.budgetMethodPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">{t("financial.budgetMethodOptions.custom")}</SelectItem>
                    <SelectItem value="50_30_20">{t("financial.budgetMethodOptions.50_30_20")}</SelectItem>
                    <SelectItem value="zero_based">{t("financial.budgetMethodOptions.zero_based")}</SelectItem>
                    <SelectItem value="envelope">{t("financial.budgetMethodOptions.envelope")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="font-medium">{t("financial.profileInfo")}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t("financial.primaryCurrency")}: {profile.currency_primary}</p>
                    <p>{t("financial.secondaryCurrency")}: {profile.currency_secondary}</p>
                    <p>{t("financial.onboarding")}: {profile.onboarding_completed ? t("financial.onboardingCompleted") : t("financial.onboardingNotCompleted")}</p>
                    {profile.onboarding_completed_at && (
                      <p>{t("financial.completedAt")}: {new Date(profile.onboarding_completed_at).toLocaleString("vi-VN")}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFinancialProfile} disabled={isLoadingFinancial}>
                {isLoadingFinancial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("financial.saveFinancial")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t("security.title")}</CardTitle>
                <CardDescription>{t("security.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t("security.currentPassword")}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("security.newPassword")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("security.confirmPassword")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="two-factor" checked={twoFactor} onCheckedChange={setTwoFactor} disabled />
                  <Label htmlFor="two-factor">{t("security.twoFactor")}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{t("security.twoFactorHelper")}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleChangePassword} disabled={isLoadingPassword}>
                  {isLoadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("security.changePassword")}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("security.loginHistory.title")}</CardTitle>
                <CardDescription>{t("security.loginHistory.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.last_login_at ? (
                  <div className="text-sm">
                    <p className="font-medium">{t("security.loginHistory.lastLogin")}</p>
                    <p className="text-muted-foreground">{new Date(user.last_login_at).toLocaleString("vi-VN")}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("security.loginHistory.noHistory")}</p>
                )}
                <p className="text-xs text-muted-foreground">{t("security.loginHistory.featureDev")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("security.activeSessions.title")}</CardTitle>
                <CardDescription>{t("security.activeSessions.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Laptop className="mr-2 h-4 w-4" />
                    {t("security.activeSessions.currentSession")}
                  </span>
                  <span className="text-green-600">● {t("security.activeSessions.active")}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("security.activeSessions.featureDev")}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" disabled>{t("security.activeSessions.logoutOthers")}</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t("preferences.title")}</CardTitle>
              <CardDescription>{t("preferences.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("preferences.language")}</Label>
                  <LanguageSwitcher id="language" variant="full" triggerClassName="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("preferences.currency")}</Label>
                  <Select defaultValue="vnd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder={t("preferences.currencyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vnd">{t("preferences.currencies.vnd")}</SelectItem>
                      <SelectItem value="usd">{t("preferences.currencies.usd")}</SelectItem>
                      <SelectItem value="eur">{t("preferences.currencies.eur")}</SelectItem>
                      <SelectItem value="gbp">{t("preferences.currencies.gbp")}</SelectItem>
                      <SelectItem value="jpy">{t("preferences.currencies.jpy")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">{t("preferences.dateFormat")}</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder={t("preferences.dateFormatPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">{t("preferences.dateFormats.dd-mm-yyyy")}</SelectItem>
                      <SelectItem value="mm-dd-yyyy">{t("preferences.dateFormats.mm-dd-yyyy")}</SelectItem>
                      <SelectItem value="yyyy-mm-dd">{t("preferences.dateFormats.yyyy-mm-dd")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">{t("preferences.fontSize")}</Label>
                  <Slider defaultValue={[16]} max={24} min={12} step={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("preferences.theme")}</Label>
                <RadioGroup defaultValue="system">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">{t("preferences.themeOptions.light")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">{t("preferences.themeOptions.dark")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">{t("preferences.themeOptions.system")}</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{t("preferences.dashboardLayout")}</Label>
                <RadioGroup defaultValue="default">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="layout-default" />
                    <Label htmlFor="layout-default">{t("preferences.layoutOptions.default")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="layout-compact" />
                    <Label htmlFor="layout-compact">{t("preferences.layoutOptions.compact")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expanded" id="layout-expanded" />
                    <Label htmlFor="layout-expanded">{t("preferences.layoutOptions.expanded")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t("preferences.savePreferences")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("notifications.title")}</CardTitle>
              <CardDescription>{t("notifications.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("notifications.channels")}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, email: checked as boolean })
                      }
                    />
                    <Label htmlFor="email-notifications">{t("notifications.emailNotifications")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, push: checked as boolean })
                      }
                    />
                    <Label htmlFor="push-notifications">{t("notifications.pushNotifications")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, sms: checked as boolean })
                      }
                    />
                    <Label htmlFor="sms-notifications">{t("notifications.smsNotifications")}</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("notifications.types")}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="account-activity"
                      checked={settings.notifications.accountActivity}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, accountActivity: checked as boolean })
                      }
                    />
                    <Label htmlFor="account-activity">{t("notifications.accountActivity")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-features"
                      checked={settings.notifications.newFeatures}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, newFeatures: checked as boolean })
                      }
                    />
                    <Label htmlFor="new-features">{t("notifications.newFeatures")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={settings.notifications.marketing}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ ...settings.notifications, marketing: checked as boolean })
                      }
                    />
                    <Label htmlFor="marketing">{t("notifications.marketing")}</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">{t("notifications.frequency")}</Label>
                <Select
                  value={settings.notifications.frequency}
                  onValueChange={(value) =>
                    updateNotificationSettings({ ...settings.notifications, frequency: value as any })
                  }
                >
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder={t("notifications.frequencyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">{t("notifications.frequencies.real-time")}</SelectItem>
                    <SelectItem value="daily">{t("notifications.frequencies.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("notifications.frequencies.weekly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-hours-start">{t("notifications.quietHours")}</Label>
                <div className="flex items-center space-x-2">
                  <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
                  <span>{t("notifications.quietHoursFrom")}</span>
                  <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>{t("notifications.saveNotifications")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.title")}</CardTitle>
              <CardDescription>{t("privacy.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("privacy.dataSharing")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-sharing">{t("privacy.analyticsSharing")}</Label>
                      <Switch
                        id="analytics-sharing"
                        checked={settings.privacy.analyticsSharing}
                        onCheckedChange={(checked) =>
                          updatePrivacySettings({ ...settings.privacy, analyticsSharing: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalized-ads">{t("privacy.personalizedAds")}</Label>
                      <Switch
                        id="personalized-ads"
                        checked={settings.privacy.personalizedAds}
                        onCheckedChange={(checked) =>
                          updatePrivacySettings({ ...settings.privacy, personalizedAds: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("privacy.accountVisibility")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={settings.privacy.visibility}
                      onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, visibility: value as any })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="visibility-public" />
                        <Label htmlFor="visibility-public">{t("privacy.public")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="visibility-private" />
                        <Label htmlFor="visibility-private">{t("privacy.private")}</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("privacy.dataRetention")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={settings.privacy.dataRetention}
                      onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, dataRetention: value as any })}
                    >
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder={t("privacy.dataRetentionPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-months">{t("privacy.retentionOptions.6-months")}</SelectItem>
                        <SelectItem value="1-year">{t("privacy.retentionOptions.1-year")}</SelectItem>
                        <SelectItem value="2-years">{t("privacy.retentionOptions.2-years")}</SelectItem>
                        <SelectItem value="indefinite">{t("privacy.retentionOptions.indefinite")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("privacy.thirdPartyIntegrations")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t("privacy.noIntegrations")}</p>
                    <Button variant="outline" disabled>{t("privacy.manageIntegrations")}</Button>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" disabled>{t("privacy.downloadData")}</Button>
                <Button variant="destructive" disabled>{t("privacy.deleteAccount")}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("privacy.featuresDev")}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePrivacy}>{t("privacy.savePrivacy")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
