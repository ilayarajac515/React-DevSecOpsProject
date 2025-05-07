import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface LoginCandidateInput {
  email: string;
  password: string;
}

export interface LoginCandidateResponse {
  message: string;
  email: string;
  accessToken: string;
}

export const candidateSlice = createApi({
  reducerPath: 'candidate_api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/candidate',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    loginCandidate: builder.mutation<LoginCandidateResponse, LoginCandidateInput>({
      query: ({ email, password }) => ({
        url: '/login',
        method: 'POST',
        body: { email, password },
      }),
    }),
  }),
});

export const { useLoginCandidateMutation } = candidateSlice;
