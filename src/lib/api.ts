export type ApiError = {
  status: number;
  message: string;
  code?: string;
  messageKey?: string;
};

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
  monthlyAmount: number;
  myTurn: number;
  currentMonth: number;
  status: string;
  totalValue: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AnalyticsSummary = {
  totalActiveDebt: number;
  collectedThisMonth: number;
  overdueAmount: number;
  activeCustomers: number;
  currency: string;
};

export type AnalyticsMonthly = {
  items: Array<{ year: number; month: number; debts: number; collected: number }>;
  currency: string;
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  // Also set cookie for middleware auth guard
  document.cookie = `accessToken=${token}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  // Clear cookie too
  document.cookie = "accessToken=; path=/; max-age=0";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...init, headers });
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
    throw { status: res.status, message, messageKey, code } satisfies ApiError;
  }

  return data as T;
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

export async function sendReminder(input: { installmentId: string; channel: "whatsapp" | "sms" }) {
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
