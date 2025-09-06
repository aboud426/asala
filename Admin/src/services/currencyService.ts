// Currency API Service
// Based on the CurrencyController endpoints

// Currency Types
export interface CurrencyLocalized {
  id: number;
  currencyId: number;
  languageId: number;
  name: string;
  code: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
  language?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  localizations: CurrencyLocalized[];
}

export interface CreateCurrencyLocalizedDto {
  languageId: number;
  name: string;
  code: string;
  symbol: string;
}

export interface CreateCurrencyDto {
  name: string;
  code: string;
  symbol: string;
  localizations: CreateCurrencyLocalizedDto[];
}

export interface UpdateCurrencyLocalizedDto {
  id?: number; // Optional (null for new translations)
  languageId: number;
  name: string;
  code: string;
  symbol: string;
}

export interface UpdateCurrencyDto {
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
  localizations: UpdateCurrencyLocalizedDto[];
}

export interface CurrencyDropdownDto {
  id: number;
  name: string;
  code: string;
  symbol: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  messageCode: string;
  data?: T;
}

export interface GetCurrenciesParams {
  page?: number;
  pageSize?: number;
  activeOnly?: boolean;
}

// Currency Service
class CurrencyService {
  private readonly baseUrl = '/api/currencies';

  private request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      // Handle non-200 HTTP status codes (network/server errors)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error('Currency API Request Error:', error);
      throw error;
    }
  };

  getCurrencies = async (params: GetCurrenciesParams = {}): Promise<PaginatedResult<Currency>> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

    const endpoint = searchParams.toString() ? `?${searchParams}` : '';
    const response = await this.request<PaginatedResult<Currency>>(endpoint);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch currencies');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;
  };

  getCurrencyById = async (id: number): Promise<Currency | null> => {
    const response = await this.request<Currency | null>(`/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch currency');
    }

    return response.data || null;
  };

  getCurrencyByName = async (name: string): Promise<Currency | null> => {
    const response = await this.request<Currency | null>(`/name/${encodeURIComponent(name)}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch currency');
    }

    return response.data || null;
  };

  getCurrencyByCode = async (code: string): Promise<Currency | null> => {
    const response = await this.request<Currency | null>(`/code/${encodeURIComponent(code)}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch currency');
    }

    return response.data || null;
  };

  getCurrenciesDropdown = async (activeOnly: boolean = true): Promise<CurrencyDropdownDto[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append('activeOnly', activeOnly.toString());

    const endpoint = `/dropdown?${searchParams.toString()}`;
    const response = await this.request<CurrencyDropdownDto[]>(endpoint);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch currencies dropdown');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;
  };

  createCurrency = async (data: CreateCurrencyDto): Promise<Currency> => {
    const response = await this.request<Currency>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to create currency');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;
  };

  updateCurrency = async (id: number, data: UpdateCurrencyDto): Promise<Currency | null> => {
    const response = await this.request<Currency | null>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update currency');
    }

    return response.data || null;
  };

  toggleCurrencyActivation = async (id: number): Promise<void> => {
    const response = await this.request<void>(`/${id}/toggle-activation`, {
      method: 'PUT',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to toggle currency activation');
    }
  };

  deleteCurrency = async (id: number): Promise<void> => {
    const response = await this.request<void>(`/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete currency');
    }
  };

  getCurrenciesMissingTranslations = async (): Promise<number[]> => {
    const response = await this.request<number[]>('/missing-translations');

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch currencies missing translations');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;
  };
}

const currencyService = new CurrencyService();
export default currencyService;
