import { BadgeIcon, CalendarIcon, MailIcon, PhoneIcon, UserIcon, EditIcon, ShieldIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon, ClockIcon, KeyIcon, ImageIcon, FileTextIcon } from "lucide-react"
import type React from "react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import type { User } from "../../types"
import { authService } from "../../services/authService"

const Profile: React.FC = () => {
    const { user } = useAuth()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [changing, setChanging] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'security'>('overview')

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                    </div>
                    <p className="mt-6 text-gray-600 text-lg">Loading your profile...</p>
                </div>
            </div>
        )
    }

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getRoleLabel = (role: User["role"]): string => {
        const roleLabels = {
            admin: "Administrator",
            driver: "Driver",
        }
        return roleLabels[role]
    }

    const getRoleColor = (role: User["role"]): string => {
        return role === "admin" 
            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg" 
            : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
    }

    const getStatusColor = (status: string): string => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'unavailable':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return <CheckCircleIcon className="h-4 w-4" />
            case 'unavailable':
                return <XCircleIcon className="h-4 w-4" />
            default:
                return <ClockIcon className="h-4 w-4" />
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long")
            return
        }
        try {
            setChanging(true)
            await authService.changePassword(currentPassword, newPassword)
            toast.success("Password updated successfully")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            const message = err.response?.data?.msg || "Error updating password"
            toast.error(message)
        } finally {
            setChanging(false)
        }
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: UserIcon },
        { id: 'documents', label: 'Documents', icon: FileTextIcon },
        { id: 'security', label: 'Security', icon: ShieldIcon }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Hero Section */}
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700"></div>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Content */}
                    <div className="relative px-8 py-12">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                            {/* Profile Picture */}
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-full ring-4 ring-white/30 ring-offset-4 ring-offset-transparent overflow-hidden bg-white/20 backdrop-blur-sm">
                                    <img
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        src={user.profilePicture || "/placeholder.svg"}
                                        alt={`${user.name} ${user.lastName}`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = "/placeholder.svg"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center lg:text-left">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {user.name} {user.lastName} {user.secondLastName}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}>
                                        <BadgeIcon className="h-4 w-4" />
                                        {getRoleLabel(user.role)}
                                    </span>
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(user.status)}`}>
                                        {getStatusIcon(user.status)}
                                        {user.status || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" />
                                        <span className="text-sm">ID: {user.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span className="text-sm">Joined {formatDate(user.registrationDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                            isActive
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500 rounded-lg">
                                                    <MailIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600">Email Address</p>
                                                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-500 rounded-lg">
                                                    <PhoneIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-600">Phone Number</p>
                                                    <p className="text-lg font-semibold text-gray-900">{user.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-purple-500 rounded-lg">
                                                    <CalendarIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-purple-600">Member Since</p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {new Date(user.registrationDate).toLocaleDateString("es-ES")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & Images</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* Driver License */}
                                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileTextIcon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">Driver License</h3>
                                            </div>
                                            
                                            {user.license ? (
                                                <div className="space-y-4">
                                                    <div className="relative group overflow-hidden rounded-xl">
                                                        <img
                                                            src={user.license}
                                                            alt="Driver License"
                                                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                            <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={user.license}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        View Full Size
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                                                        <FileTextIcon className="h-full w-full" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No license uploaded</p>
                                                    <p className="text-gray-400 text-sm mt-1">Upload your driver license</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ImageIcon className="h-5 w-5 text-green-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                                            </div>
                                            
                                            {user.profilePicture ? (
                                                <div className="space-y-4">
                                                    <div className="relative group">
                                                        <img
                                                            src={user.profilePicture}
                                                            alt="Profile Picture"
                                                            className="mx-auto h-48 w-48 rounded-full object-cover border-4 border-gray-100 shadow-lg transition-transform group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                            <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <a
                                                            href={user.profilePicture}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                            View Full Size
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <UserIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No profile picture</p>
                                                    <p className="text-gray-400 text-sm mt-1">Upload your profile photo</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
                                    <p className="text-gray-600">Manage your account security and password</p>
                                </div>

                                {/* Password Change Form */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-500 rounded-lg">
                                            <KeyIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                                            <p className="text-gray-600">Update your password to keep your account secure</p>
                                        </div>
                                    </div>

                                    {user.status === "Unavailable" && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <XCircleIcon className="h-5 w-5 text-red-500" />
                                                <p className="text-red-800 font-medium">Account Unavailable</p>
                                            </div>
                                            <p className="text-red-700 text-sm mt-1">
                                                Your account is marked as unavailable. Password changes are disabled.
                                            </p>
                                        </div>
                                    )}

                                    <form className="space-y-6" onSubmit={handleChangePassword}>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                    disabled={user.status === "Unavailable"}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    disabled={user.status === "Unavailable"}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Password must be at least 6 characters long
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    disabled={user.status === "Unavailable"}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={changing || user.status === "Unavailable"}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {changing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    Updating Password...
                                                </>
                                            ) : (
                                                <>
                                                    <KeyIcon className="h-4 w-4" />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile