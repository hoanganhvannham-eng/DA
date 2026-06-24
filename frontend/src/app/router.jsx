import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from '../pages/landing/LandingPage'
import TermsPage from '../pages/landing/pages/TermsPage'
import PrivacyPage from '../pages/landing/pages/PrivacyPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import OAuth2RedirectPage from '../features/auth/pages/OAuth2RedirectPage'
import ProfilePage from '../features/user/pages/ProfilePage'
import UserManagementPage from '../features/user/pages/UserManagementPage'
import CategoryManagementPage from '../features/book/pages/CategoryManagementPage'
import MoodManagementPage from '../features/mood/pages/MoodManagementPage'
import BookListPage from '../features/book/pages/BookListPage'
import BookDetailPage from '../features/book/pages/BookDetailPage'
import BorrowManagementPage from '../features/borrow/pages/BorrowManagementPage'
import BorrowHistoryPage from '../features/borrow/pages/BorrowHistoryPage'
import FineManagementPage from '../features/fine/pages/FineManagementPage'
import FineListPage from '../features/fine/pages/FineListPage'
import FinePendingConfirmationPage from '../features/fine/pages/FinePendingConfirmationPage'
import DashboardPage from '../features/report/pages/DashboardPage'
import DetailedReportPage from '../features/report/pages/DetailedReportPage'
import WalletPage from '../features/wallet/pages/WalletPage'
import MockPaymentPage from '../features/wallet/pages/MockPaymentPage'
import PendingDepositPage from '../features/borrow/pages/PendingDepositPage'
import PickupScanPage from '../features/borrow/pages/PickupScanPage'

/**
 * Application router configuration.
 *
 * Phase 1 (UC01):
 *   /              → LandingPage
 *   /register      → RegisterPage
 *   /verify-email  → VerifyEmailPage
 *
 * Phase 2 (UC02):
 *   /login         → LoginPage
 *
 * Phase 3 (UC03):
 *   /profile       → ProfilePage (requires auth — redirect to /login if not logged in)
 *
 * Phase 3b (UC03b):
 *   /forgot-password  → ForgotPasswordPage
 *   /reset-password   → ResetPasswordPage
 * Phase 4 (UC04):
 *   /categories    → CategoryManagementPage (requires auth LIBRARIAN)
 * Phase 5 (UC06/UC07):
 *   /books         → BookListPage (public list)
 *   /books/:bookId → BookDetailPage (role-based detail)
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/oauth2/redirect',
    element: <OAuth2RedirectPage />,
  },
  {
    path: '/categories',
    element: <CategoryManagementPage />,
  },
  {
    path: '/moods',
    element: <MoodManagementPage />,
  },
  {
    path: '/books',
    element: <BookListPage />,
  },
  {
    path: '/books/:bookId',
    element: <BookDetailPage />,
  },
  {
    path: '/librarian/borrows',
    element: <BorrowManagementPage />,
  },
  {
    path: '/my-borrows',
    element: <BorrowHistoryPage />,
  },
  {
    path: '/fine-levels',
    element: <FineManagementPage />,
  },
  {
    path: '/admin/users',
    element: <UserManagementPage />,
  },
  {
    path: '/my-fines',
    element: <FineListPage />,
  },
  {
    path: '/librarian/fines/pending',
    element: <FinePendingConfirmationPage />,
  },
  {
    path: '/my-wallet',
    element: <WalletPage />,
  },
  {
    path: '/payment/mock/:paymentCode',
    element: <MockPaymentPage />,
  },
  {
    path: '/librarian/borrows/pending-deposit',
    element: <PendingDepositPage />,
  },
  {
    path: '/librarian/pickup',
    element: <PickupScanPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/reports/detailed',
    element: <DetailedReportPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
