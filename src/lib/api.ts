export type ApiError = {
  status: number;
  message: string;
  code?: string;
  messageKey?: string;
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
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
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

export type Customer = {
  id: string;
  type: "individual" | "company";
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  cr: string | null;
  notes: string | null;
  status: "regular" | "late" | "defaulting";
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

export async function createCustomer(input: {
  type: "individual" | "company";
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cr?: string;
  notes?: string;
}) {
  return apiFetch<Customer>("/customers", { method: "POST", body: JSON.stringify(input) });
}

export async function getCustomer(id: string) {
  return apiFetch<Customer>(`/customers/${id}`);
}

export async function getCustomerDebts(id: string) {
  return apiFetch<{ items: any[] }>(`/customers/${id}/debts`);
}

export async function listGuarantors(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<{ items: any[] }>(`/guarantors${qs}`);
}

export async function getRemindersUpcoming(days = 7) {
  return apiFetch<{ items: any[] }>(`/reminders/upcoming?days=${days}`);
}

export async function getRemindersOverdue() {
  return apiFetch<{ items: any[] }>(`/reminders/overdue`);
}

export async function getRemindersSent() {
  return apiFetch<{ items: any[] }>(`/reminders/sent`);
}

export async function getAnalyticsSummary() {
  return apiFetch<{ totalActiveDebt: number; collectedThisMonth: number; overdueAmount: number; activeCustomers: number; currency: string }>(
    `/analytics/summary`,
  );
}

export async function getAnalyticsMonthly(months = 6) {
  return apiFetch<{ items: Array<{ year: number; month: number; debts: number; collected: number }>; currency: string }>(
    `/analytics/monthly?months=${months}`,
  );
}

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

export async function listCustomers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}&page=1&limit=20` : `?page=1&limit=20`;
  return apiFetch<{ items: Customer[] }>(`/customers${qs}`);
}

export async function createDebt(input: any) {
  return apiFetch<{ debt: any; installments: any[] }>(`/debts`, { method: "POST", body: JSON.stringify(input) });
}

export async function getDebt(id: string) {
  return apiFetch<{ debt: any; installments: any[] }>(`/debts/${id}`);
}

export async function payInstallment(installmentId: string, input: any = {}) {
  return apiFetch<any>(`/installments/${installmentId}/payments`, { method: "POST", body: JSON.stringify(input) });
}

export async function activateGuarantor(debtId: string) {
  return apiFetch<any>(`/debts/${debtId}/guarantor/activate`, { method: "POST" });
}

export async function listAssociations() {
  return apiFetch<{ items: Association[] }>(`/associations`);
}

export async function createAssociation(input: {
  name: string;
  members: number;
  monthlyAmount: number;
  myTurn: number;
}) {
  return apiFetch<Association>(`/associations`, { method: "POST", body: JSON.stringify(input) });
}

export async function getAssociation(id: string) {
  return apiFetch<Association>(`/associations/${id}`);
}

export async function patchAssociation(
  id: string,
  input: Partial<{
    name: string;
    members: number;
    monthlyAmount: number;
    myTurn: number;
  }>,
) {
  return apiFetch<Association>(`/associations/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

