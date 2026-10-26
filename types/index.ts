export type Role = "ADMIN" | "USER";
export type TransactionType = "EXPENSE" | "INCOME";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  userId: string | null;
  parentId: string | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  description: string | null;
  date: string;
  isRepeating: boolean;
  endDate: string | null;
  isProjected?: boolean;
  userId: string;
  categoryId: string;
  householdMemberId: string | null;
  category?: Category;
  householdMember?: HouseholdMember;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalExpenses: number;
  totalIncomes: number;
  recentTransactions: Transaction[];
  expensesByCategory: { categoryId: string; categoryName: string; color: string | null; total: number }[];
}

export interface MatrixChildRow {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  dailyTotals: Record<string, number>;
  monthTotal: number;
}

export interface MatrixRow {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  isParent: boolean;
  dailyTotals: Record<string, number>;
  monthTotal: number;
  children: MatrixChildRow[];
}

export interface MatrixColumnTotals {
  expense: Record<string, number>;
  income: Record<string, number>;
}

export interface MatrixGrandTotal {
  expense: number;
  income: number;
  balance: number;
}

export interface MonthlyMatrixResponse {
  year: number;
  month: number;
  daysInMonth: number;
  rows: MatrixRow[];
  columnTotals: MatrixColumnTotals;
  grandTotal: MatrixGrandTotal;
}

export interface YearlyMatrixResponse {
  year: number;
  rows: MatrixRow[];
  columnTotals: MatrixColumnTotals;
  grandTotal: MatrixGrandTotal;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
  isRepeating?: boolean;
  endDate?: string;
  householdMemberId?: string;
}

export interface UpdateTransactionPayload {
  type?: TransactionType;
  amount?: number;
  categoryId?: string;
  description?: string;
  date?: string;
  isRepeating?: boolean;
  endDate?: string | null;
  householdMemberId?: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
}

export interface CreateHouseholdMemberPayload {
  name: string;
}

export interface UpdateHouseholdMemberPayload {
  name: string;
}

export interface UpdateProfilePayload {
  name?: string;
  currency?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}
