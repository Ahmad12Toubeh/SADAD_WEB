export type ApiError = {
  status: number;
  message: string;
  code?: string;
  messageKey?: string;
};

const GET_CACHE_TTL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 10_000;
const getCache = new Map<string, { expiresAt: number; data: unknown }>();
const inFlightGetRequests = new Map<string, Promise<unknown>>();

export type CustomerType = "individual" | "company";
export type CustomerStatus = "regular" | "late" | "defaulting";

export type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cr?: string;
  notes?: string;
  status: CustomerStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type DebtPlanType = "one_time" | "installments";
export type DebtStatus = "active" | "paid" | "late" | "bad";

export type Debt = {
  id: string;
  customerId: string;
  customerName?: string;
  type: "invoice" | "loan" | "other";
  principalAmount: number;
  currency: string;
  planType: DebtPlanType;
  dueDate: string;
  category?: string;
  notes?: string;
  status: DebtStatus;
  hasGuarantor: boolean;
  guarantorActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type InstallmentStatus = "pending" | "paid" | "late";

export type Installment = {
  id: string;
  debtId: string;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GuarantorStatus = "inactive" | "active";

export type Guarantor = {
  id: string;
  debtId: string;
  name: string;
  phone: string;
  notes?: string;
  status: GuarantorStatus;
  activatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Association = {
  id: string;
  name: string;
  members: number;
  membersList?: Array<{
    id?: string;
    name?: string;
    phone?: string;
    turnOrder?: number;
    isPaid?: boolean;
    isReceiver?: boolean;
  }>;
  monthlyAmount: number;
  currentMonth: number;
  status: string;
  totalValue: number;
  associationKind?: "rotating" | "family";
  lockOrder?: boolean;
  cycleHistory?: Array<{
    month: number;
    receiverId?: string;
    receiverName?: string;
    paidMemberIds?: string[];
    paidCount?: number;
    totalCollected?: number;
    createdAt?: string;
  }>;
  fundBalance?: number;
  fundTransactions?: Array<{
    id?: string;
    type: "in" | "out";
    amount: number;
    note?: string;
    memberId?: string;
    status?: "pending" | "approved";
    approvals?: string[];
    createdAt?: string;
  }>;
  fundGuarantorMemberId?: string | null;
  paymentLogs?: Array<{
    id?: string;
    memberId?: string;
    memberName?: string;
    amount?: number;
    note?: string;
    month?: number;
    paidAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type AnalyticsSummary = {
  totalActiveDebt: number;
  activeDebtCount?: number;
  collectedThisMonth: number;
  newDebtsThisMonth?: number;
  overdueAmount: number;
  activeCustomers: number;
  avgDebtAmount?: number;
  collectionRate?: number;
  statusDistribution?: {
    paid?: number;
    active?: number;
    late?: number;
    bad?: number;
  };
  currency: string;
};

export type AnalyticsMonthly = {
  items: Array<{ year: number; month: number; debts: number; collected: number }>;
  currency: string;
};

function getBaseUrl() {
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn("WARNING: NEXT_PUBLIC_API_BASE_URL is missing in production. Falling back to relative path.");
    return "/api"; 
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  // Deprecated: token is now stored in HttpOnly cookie set by the API.
  localStorage.removeItem("accessToken");
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAccessToken();
  const method = (init.method ?? "GET").toUpperCase();
  const requestKey = `${method}:${url}:${token ?? ""}`;
  const isGet = method === "GET";

  if (isGet) {
    const cached = getCache.get(requestKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    const inFlight = inFlightGetRequests.get(requestKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const runRequest = async () => {
    const res = await fetch(url, { ...init, headers, signal: controller.signal, credentials: "include" });
    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const message = (data && (data.message || data.error)) || res.statusText || "Request failed";
      const messageKey = data?.messageKey;
      const code = data?.code;
      if (res.status === 401) {
        handleUnauthorizedRedirect();
      }
      throw { status: res.status, message, messageKey, code } satisfies ApiError;
    }

    return data as T;
  };

  const requestPromise = runRequest()
    .then((data) => {
      if (isGet) {
        getCache.set(requestKey, { data, expiresAt: Date.now() + GET_CACHE_TTL_MS });
      } else {
        // Mutations can invalidate stale cached lists/details.
        getCache.clear();
      }
      return data;
    })
    .catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw { status: 408, message: "Request timed out" } satisfies ApiError;
      }
      throw error;
    })
    .finally(() => {
      clearTimeout(timeout);
      if (isGet) inFlightGetRequests.delete(requestKey);
    });

  if (isGet) inFlightGetRequests.set(requestKey, requestPromise as Promise<unknown>);
  return requestPromise;
}

function handleUnauthorizedRedirect() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname + window.location.search;
  if (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/forgot-password") || path.startsWith("/reset-password")) {
    return;
  }
  const loginUrl = `/login?redirect=${encodeURIComponent(path)}`;
  if (window.location.href.endsWith(loginUrl)) return;
  window.location.href = loginUrl;
}

// Auth
export async function login(input: { email: string; password: string }) {
  return apiFetch<{ accessToken: string; user: { id: string; email: string; fullName: string; role: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function register(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  storeName?: string;
}) {
  return apiFetch<{ id?: string; email: string; fullName: string }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function logout() {
  return apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" });
}

export async function forgotPassword(input: { email: string }) {
  return apiFetch<{ success: boolean; resetToken?: string; expiresAt?: string; message?: string }>(
    "/auth/forgot-password",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  return apiFetch<{ success: boolean; message?: string }>(
    "/auth/reset-password",
    { method: "POST", body: JSON.stringify(input) },
  );
}

// Customers
export async function listCustomers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}&page=1&limit=50` : `?page=1&limit=50`;
  return apiFetch<{ items: Customer[] }>(`/customers${qs}`);
}

export async function createCustomer(input: Partial<Customer>) {
  return apiFetch<Customer>("/customers", { method: "POST", body: JSON.stringify(input) });
}

export async function getCustomer(id: string) {
  return apiFetch<Customer>(`/customers/${id}`);
}

export async function updateCustomer(id: string, input: Partial<Customer>) {
  return apiFetch<Customer>(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteCustomer(id: string) {
  return apiFetch<any>(`/customers/${id}`, { method: "DELETE" });
}

export async function getCustomerDebts(id: string) {
  return apiFetch<{ items: Debt[] }>(`/customers/${id}/debts`);
}

// Debts
export async function createDebt(input: any) {
  return apiFetch<{ debt: Debt; installments: Installment[] }>(`/debts`, { method: "POST", body: JSON.stringify(input) });
}

export async function getDebt(id: string) {
  return apiFetch<{ debt: Debt; installments: Installment[]; guarantor: Guarantor | null }>(`/debts/${id}`);
}

export async function updateDebt(id: string, input: any) {
  return apiFetch<Debt>(`/debts/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteDebt(id: string) {
  return apiFetch<any>(`/debts/${id}`, { method: "DELETE" });
}

export async function listDebtInstallments(id: string) {
  return apiFetch<Installment[]>(`/debts/${id}/installments`);
}

// Guarantors
export async function listGuarantors(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<{ items: Guarantor[] }>(`/guarantors${qs}`);
}

export async function activateGuarantor(debtId: string) {
  return apiFetch<any>(`/debts/${debtId}/guarantor/activate`, { method: "POST" });
}

// Installments & Payments
export async function payInstallment(installmentId: string, input: any = {}) {
  return apiFetch<any>(`/installments/${installmentId}/payments`, { method: "POST", body: JSON.stringify(input) });
}

// Reminders
export async function getRemindersUpcoming(days = 7) {
  const n = Number.isFinite(days) ? days : 7;
  return apiFetch<{ items: any[] }>(`/reminders/upcoming?days=${n}`);
}

export async function getRemindersOverdue() {
  return apiFetch<{ items: any[] }>(`/reminders/overdue`);
}

export async function getRemindersSent() {
  return apiFetch<{ items: any[] }>(`/reminders/sent`);
}

export async function sendReminder(input: {
  channel: "whatsapp" | "email";
  installmentId?: string;
  debtId?: string;
  message?: string;
}) {
  return apiFetch<any>("/reminders/send", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Analytics
export async function getAnalyticsSummary() {
  return apiFetch<AnalyticsSummary>(`/analytics/summary`);
}

export async function getAnalyticsMonthly(months = 6) {
  const n = Number.isFinite(months) ? months : 6;
  return apiFetch<AnalyticsMonthly>(`/analytics/monthly?months=${n}`);
}

export async function getRecentActivity(limit = 5): Promise<Debt[]> {
  const res = await apiFetch<any>(`/debts?limit=${limit}`);
  return res.items ?? [];
}

// Settings
export async function getSettingsProfile() {
  return apiFetch<any>(`/settings/profile`);
}

export async function patchSettingsProfile(input: { fullName?: string; phone?: string }) {
  return apiFetch<any>(`/settings/profile`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function getSettingsStore() {
  return apiFetch<any>(`/settings/store`);
}

export async function patchSettingsStore(input: any) {
  return apiFetch<any>(`/settings/store`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function getSettingsNotifications() {
  return apiFetch<any>(`/settings/notifications`);
}

export async function patchSettingsNotifications(input: any) {
  return apiFetch<any>(`/settings/notifications`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiFetch<any>(`/settings/security/password`, { method: "PATCH", body: JSON.stringify(input) });
}

// Associations
export async function listAssociations() {
  return apiFetch<{ items: Association[] }>(`/associations`);
}

export async function createAssociation(input: Partial<Association>) {
  return apiFetch<Association>(`/associations`, { method: "POST", body: JSON.stringify(input) });
}

export async function getAssociation(id: string) {
  return apiFetch<Association>(`/associations/${id}`);
}

export async function patchAssociation(id: string, input: Partial<Association>) {
  return apiFetch<Association>(`/associations/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteAssociation(id: string) {
  return apiFetch<{ ok: boolean }>(`/associations/${id}`, { method: "DELETE" });
}

export async function closeAssociationMonth(id: string) {
  return apiFetch<Association>(`/associations/${id}/close-month`, { method: "POST" });
}

export async function addAssociationFundTransaction(id: string, input: { type: "in" | "out"; amount: number; note?: string; memberId?: string }) {
  return apiFetch<Association>(`/associations/${id}/fund-transaction`, { method: "POST", body: JSON.stringify(input) });
}

export async function approveAssociationFundTransaction(id: string, input: { transactionId: string; memberId: string }) {
  return apiFetch<Association>(`/associations/${id}/fund-transaction/approve`, { method: "POST", body: JSON.stringify(input) });
}

export async function reopenAssociationCycle(id: string) {
  return apiFetch<Association>(`/associations/${id}/reopen-cycle`, { method: "POST" });
}
