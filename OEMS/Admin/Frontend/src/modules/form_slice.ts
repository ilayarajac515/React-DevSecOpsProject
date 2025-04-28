import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

interface Field {
  fieldId: string;
  formId: string;
  type?: string;
  label: string;
  placeholder: string;
  textArea: string;
  options: any;
  questions: any;
  rta: string;
}

interface Submission {
  responseId: string;
  formId: string;
  value: any;
  ip: string;
  submittedAt: string;
  userEmail: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
}

interface Form {
  formId?: string;
  label: string;
  manager: string;
  description?: string;
  duration: string;
  startContent?: string;
  endContent?: string;
  createdAt?: string;
}

type RefreshResponse = {
  accessToken: string;
};

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/mock_form',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<any, unknown, unknown> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: "form/refresh-token", method: 'POST' },
      api,
      extraOptions
    );


    const data = refreshResult.data as RefreshResponse;

    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const formSlice = createApi({
  reducerPath: 'form_api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Forms', 'Fields', 'Submissions'],
  endpoints: (builder) => ({
    getForms: builder.query<Form[], void>({
      query: () => 'forms',
      providesTags: ['Forms'],
    }),

    addForm: builder.mutation<{ message: string; formId: string }, Omit<Form, 'formId' | 'createdAt'>>({
      query: (formData) => ({
        url: 'form',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Forms'],
    }),

    updateForm: builder.mutation<{ message: string }, { formId: string; data: Omit<Form, 'formId' | 'createdAt'> }>({
      query: ({ formId, data }) => ({
        url: `form/${formId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Forms'],
    }),

    deleteForm: builder.mutation<{ message: string }, string>({
      query: (formId) => ({
        url: `form/${formId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Forms'],
    }),

    getFieldsByFormId: builder.query<Field[], string>({
      query: (formId) => `form/${formId}/fields`,
      providesTags: (_result, _error, formId) => [{ type: 'Fields', id: formId }],
    }),

    addField: builder.mutation<{ message: string; fieldId: string }, { formId: string; data: Field }>({
      query: ({ formId, data }) => ({
        url: `form/${formId}/field`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { formId }) => [{ type: 'Fields', id: formId }],
    }),

    editField: builder.mutation<Field, { formId: string; fieldId: string; data: Field }>({
      query: ({ formId, fieldId, data }) => ({
        url: `form/${formId}/field/${fieldId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { formId }) => [{ type: 'Fields', id: formId }],
    }),

    deleteField: builder.mutation<void, { formId: string; fieldId: string }>({
      query: ({ formId, fieldId }) => ({
        url: `form/${formId}/field/${fieldId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { formId }) => [{ type: 'Fields', id: formId }],
    }),

    getSubmissionsByFormId: builder.query<Submission[], string>({
      query: (formId) => `form/${formId}/submissions`,
      providesTags: (_result, _error, formId) => [{ type: 'Submissions', id: formId }],
    }),

    addSubmission: builder.mutation<{ message: string; responseId: string },
      { formId: string; data: Omit<Submission, 'responseId' | 'submittedAt'> }>({
        query: ({ formId, data }) => ({
          url: `form/${formId}/submit`,
          method: 'POST',
          body: data,
        }),
        invalidatesTags: (_result, _error, { formId }) => [{ type: 'Submissions', id: formId }],
      }),
  }),
});

export const {
  useGetFormsQuery,
  useAddFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useGetFieldsByFormIdQuery,
  useAddFieldMutation,
  useEditFieldMutation,
  useDeleteFieldMutation,
  useGetSubmissionsByFormIdQuery,
  useAddSubmissionMutation,
} = formSlice;
