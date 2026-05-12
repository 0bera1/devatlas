interface NestHttpExceptionBody {
  message?: string | string[];
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as NestHttpExceptionBody;
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    /* yanıt gövdesi JSON değil */
  }
  return response.statusText || 'Bir hata oluştu';
}
