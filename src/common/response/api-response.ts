export interface IPaginationMeta {
  next_cursor: string | null;
  has_more: boolean;
  total?: number;
}

export class ApiResponse {
  static success<T>(data: T, message = 'Success', meta?: Record<string, any>) {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static paginated<T>(data: T[], pagination: IPaginationMeta, message = 'Success') {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  static error(errorCode: string, message: string, details?: any, requestId?: string) {
    return {
      success: false,
      error: {
        code: errorCode,
        message,
        details: details || null,
        request_id: requestId || null,
      },
    };
  }
}
export type ApiResponseStructure = ReturnType<typeof ApiResponse.success>;
