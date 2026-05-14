'use client';

import { authApi } from '@/api/auth/authApi';
import { AuthMethods } from '@/api/MethodNames';
import {
  useMutation,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/domains/auth/authDomains';

/**
 * POST {@link AuthMethods.Login}
 */
export function useLoginMutation(): UseMutationResult<
  AuthResponse,
  Error,
  LoginRequest
> {
  return useMutation({
    mutationKey: [AuthMethods.Login],
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
  });
}

/**
 * POST {@link AuthMethods.Register}
 */
export function useRegisterMutation(): UseMutationResult<
  AuthResponse,
  Error,
  RegisterRequest
> {
  return useMutation({
    mutationKey: [AuthMethods.Register],
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
  });
}
