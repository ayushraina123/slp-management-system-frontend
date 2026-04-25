import type {
  ApiProblem,
  DashboardSummaryDto,
  DevoteeDto,
  DonationRecordDto,
  DonationType,
  ExpenseDto,
  ExpenseType,
  PagedResponse,
  UserCredentials,
} from '../types';
import {
  ACCESS_DENIED_MESSAGE,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  setUsername,
} from './auth';

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

type UnknownRecord = Record<string, unknown>;

const defaultJsonHeaders = {
  'Content-Type': 'application/json',
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function parseError(response: Response): Promise<Error> {
  if (response.status === 403) {
    return new Error(ACCESS_DENIED_MESSAGE);
  }

  let message = `Request failed with status ${response.status}`;
  try {
    const problem = (await response.json()) as ApiProblem;
    if (problem.detail) {
      message = problem.detail;
    } else if (problem.title) {
      message = problem.title;
    }
    if (problem.errors) {
      const errorText = Array.isArray(problem.errors)
        ? problem.errors.join(', ')
        : Object.values(problem.errors).join(', ');
      if (errorText) {
        message = `${message}: ${errorText}`;
      }
    }
  } catch {
    const text = await response.text();
    if (text) {
      message = text;
    }
  }
  return new Error(message);
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function extractCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (isRecord(payload)) {
    const collection = payload.content ?? payload.data ?? payload.items ?? payload.result;
    if (Array.isArray(collection)) {
      return collection as T[];
    }
  }

  return [];
}

function extractPagedResponse<T>(
  payload: unknown,
  requestedPageNumber: number,
  requestedPageSize: number,
): PagedResponse<T> {
  const content = extractCollection<T>(payload);

  if (!isRecord(payload)) {
    return {
      content,
      pageNumber: requestedPageNumber,
      pageSize: requestedPageSize,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
      first: true,
      last: true,
    };
  }

  const backendPageNumber = extractNumericValue(payload.pageNumber, []);
  const backendPageSize = extractNumericValue(payload.pageSize, []);
  const totalElements = extractNumericValue(payload.totalElements, []);
  const totalPages = extractNumericValue(payload.totalPages, []);

  return {
    content,
    pageNumber: backendPageNumber + 1,
    pageSize: backendPageSize || requestedPageSize,
    totalElements,
    totalPages,
    first: Boolean(payload.first),
    last: Boolean(payload.last),
  };
}

function extractNumericValue(payload: unknown, fallbackKeys: string[] = []) {
  if (typeof payload === 'number') {
    return payload;
  }

  if (typeof payload === 'string') {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (isRecord(payload)) {
    for (const key of fallbackKeys) {
      const value = payload[key];
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
  }

  return 0;
}

function extractMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (isRecord(payload)) {
    const message =
      payload.message ?? payload.detail ?? payload.title ?? payload.result ?? payload.data;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function extractAccessToken(payload: unknown) {
  if (!isRecord(payload)) {
    return '';
  }

  const token =
    payload.accessToken ?? payload.token ?? payload.jwt ?? payload.id_token ?? payload.access_token;

  return typeof token === 'string' ? token : '';
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', defaultJsonHeaders['Content-Type']);
  }
  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
    }
    throw await parseError(response);
  }

  return (await parseResponseBody(response)) as T;
}

function parseAuthHeader(response: Response) {
  const authorization = response.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) {
    return '';
  }
  return authorization.slice('Bearer '.length);
}

export async function login(credentials: UserCredentials) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: defaultJsonHeaders,
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const payload = await parseResponseBody(response);
  const token = parseAuthHeader(response) || extractAccessToken(payload);
  if (!token) {
    throw new Error('Login succeeded but no access token was returned.');
  }
  setAccessToken(token);
  setUsername(credentials.username);
}

export async function signup(credentials: UserCredentials) {
  await request<void>('/api/user', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function logout() {
  try {
    await request('/api/logout', { method: 'POST' });
  } catch {
    await request('/logout', { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}

export async function fetchBalance() {
  const payload = await request<unknown>('/api/balance');
  return extractNumericValue(payload, ['balance', 'amount', 'data']);
}

export async function fetchDashboardSummary() {
  const payload = await request<DashboardSummaryDto>('/api/dashboard/summary');
  return {
    ...payload,
    balance: Number(payload.balance || 0),
    totalDonations: Number(payload.totalDonations || 0),
    totalExpenses: Number(payload.totalExpenses || 0),
    donationBreakdown: payload.donationBreakdown.map((item) => ({
      ...item,
      value: Number(item.value || 0),
    })),
    expenseBreakdown: payload.expenseBreakdown.map((item) => ({
      ...item,
      value: Number(item.value || 0),
    })),
    monthlyTrend: payload.monthlyTrend.map((item) => ({
      ...item,
      donations: Number(item.donations || 0),
      expenses: Number(item.expenses || 0),
    })),
  };
}

export async function fetchDevotees(pageNumber = 1, pageSize = 20) {
  const payload = await request<unknown>(
    `/api/devotees${buildQuery({ pageNumber: pageNumber - 1, pageSize })}`,
  );
  return extractPagedResponse<DevoteeDto>(payload, pageNumber, pageSize);
}

export async function saveDevotees(devotees: DevoteeDto[]) {
  return request<void>('/api/devotees', {
    method: 'PUT',
    body: JSON.stringify(devotees),
  });
}

export async function deleteDevotee(devoteeId: number) {
  return request<void>(`/api/devotees/${devoteeId}`, { method: 'DELETE' });
}

export async function fetchDonations(pageNumber = 1, pageSize = 20, donationType?: DonationType) {
  const payload = await request<unknown>(
    `/api/donation${buildQuery({ pageNumber: pageNumber - 1, pageSize, donationType })}`,
  );
  return extractPagedResponse<DonationRecordDto>(payload, pageNumber, pageSize);
}

export async function deleteDonation(donationId: number) {
  return request<void>(`/api/donation/${donationId}`, { method: 'DELETE' });
}

export async function fetchExpenses(pageNumber = 1, pageSize = 20, expenseType?: ExpenseType) {
  const payload = await request<unknown>(
    `/api/expense${buildQuery({ pageNumber: pageNumber - 1, pageSize, expenseType })}`,
  );
  return extractPagedResponse<ExpenseDto>(payload, pageNumber, pageSize);
}

export async function saveExpenses(expenses: ExpenseDto[]) {
  return request<void>('/api/expense', {
    method: 'POST',
    body: JSON.stringify(expenses),
  });
}

export async function deleteExpense(expenseId: number) {
  return request<void>(`/api/expense/${expenseId}`, { method: 'DELETE' });
}

export async function triggerExport(donationType: DonationType) {
  const payload = await request<unknown>(
    `/api/job/export-data${buildQuery({
      jobName: 'exportDevoteesJob',
      donationType,
    })}`,
    { method: 'POST' },
  );
  return extractMessage(payload, 'Export job triggered successfully.');
}

export async function triggerDeleteBatch() {
  const payload = await request<unknown>(
    `/api/job/delete-data${buildQuery({
      jobName: 'deleteDataJob',
    })}`,
    { method: 'POST' },
  );
  return extractMessage(payload, 'Delete batch job triggered successfully.');
}
