import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { EditSubmissionInput, EditSubmissionResponse } from "./candidate_slice";

export interface Field {
  fieldId: string;
  type?: string;
  label: string;
  placeholder?: string;
  options?: any;
  rta?: any;
}
interface Candidate {
  candidates: any[];
}

interface Submission {
  responseId: string;
  formId?: string;
  value?: any;
  userEmail?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  score?: string;
  status?: string;
  warnings?: number;
  termsAccepted?: string;
}
export interface Form {
  formId: string;
  label: string;
  manager: string;
  description?: string;
  duration: string;
  status?: string;
  startContent?: string;
  branch?: string;
}

export interface RegistrationForm {
  formId: string;
  branch: string;
  label: string;
  description: string;
  manager: string;
  status?: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api/mock_form",
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<any, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn("Unauthorized. Redirecting to /");
    window.location.href = "/";
    return result;
  }

  return result;
};

export const formSlice = createApi({
  reducerPath: "form_api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Forms", "Fields", "Submissions", "RegisterForms", "Selected"],
  endpoints: (builder) => ({
    getForms: builder.query<Form[], void>({
      query: () => "forms",
      providesTags: ["Forms"],
    }),

    addForm: builder.mutation<
      { message: string; formId: string },
      Omit<Form, "createdAt">
    >({
      query: (formData) => ({
        url: "form",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Forms"],
    }),

    cloneForm: builder.mutation<
      { message: string; newFormId: string },
      { form: Form; fields: Field[] }
    >({
      query: (body) => ({
        url: "form/clone",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Forms", "Fields"],
    }),

    updateForm: builder.mutation<
      { message: string },
      { data: Omit<Form, "createdAt"> }
    >({
      query: ({ data }) => ({
        url: `form/${data.formId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Forms"],
    }),

    deleteForm: builder.mutation<{ message: string }, string>({
      query: (formId) => ({
        url: `form/${formId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Forms"],
    }),

    getFieldsByFormId: builder.query<Field[], string>({
      query: (formId) => `form/${formId}/fields`,
      providesTags: (_result, _error, formId) => [
        { type: "Fields", id: formId },
      ],
    }),

    addField: builder.mutation<
      { message: string; fieldId: string },
      { formId: string; data: Field }
    >({
      query: ({ formId, data }) => ({
        url: `form/${formId}/field`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Fields", id: formId },
      ],
    }),

    editField: builder.mutation<Field, { formId: string; data: Field }>({
      query: ({ formId, data }) => ({
        url: `form/${formId}/field/${data.fieldId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Fields", id: formId },
      ],
    }),

    deleteField: builder.mutation<void, { formId: string; fieldId: string }>({
      query: ({ formId, fieldId }) => ({
        url: `form/${formId}/field/${fieldId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Fields", id: formId },
      ],
    }),

    getSubmissionsByFormId: builder.query<Submission[], string>({
      query: (formId) => `form/${formId}/submissions`,
      providesTags: (_result, _error, formId) => [
        { type: "Submissions", id: formId },
      ],
    }),

    getSubmissionByEmail: builder.query<
      Submission,
      { formId: string; email: string }
    >({
      query: ({ formId, email }) => `forms/${formId}/submission/${email}`,
    }),

    getSubmittedCount: builder.query<{ submittedCount: number }, string>({
      query: (formId) => `form/${formId}/submitted-count`,
      providesTags: (_result, _error, formId) => [
        { type: "Submissions", id: formId },
      ],
    }),

    updateSubmission: builder.mutation<
      EditSubmissionResponse,
      EditSubmissionInput
    >({
      query: ({ formId, ...body }) => ({
        url: `form/${formId}/submission`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Submissions", id: formId },
      ],
    }),

    registerAddForm: builder.mutation<
      { message: string; formId: string },
      RegistrationForm
    >({
      query: (formData) => ({
        url: "register/form",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["RegisterForms"],
    }),

    registerUpdateForm: builder.mutation<
      { message: string },
      { data: RegistrationForm }
    >({
      query: ({ data }) => ({
        url: `register/form/${data.formId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RegisterForms"],
    }),

    registerDeleteForm: builder.mutation<{ message: string }, string>({
      query: (formId) => ({
        url: `register/form/${formId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RegisterForms"],
    }),

    getAllRegistrationForms: builder.query<RegistrationForm[], void>({
      query: () => "register/forms",
      providesTags: ["RegisterForms"],
    }),

    getRegistrationForm: builder.query<RegistrationForm, string>({
      query: (formId) => `form/${formId}/registration`,
      providesTags: ["RegisterForms"],
    }),

    replaceFields: builder.mutation<
      { message: string },
      { formId: string; fields: Field[] }
    >({
      query: ({ formId, fields }) => ({
        url: `form/${formId}/fields`,
        method: "PUT",
        body: { fields },
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Fields", id: formId },
      ],
    }),

    addSelectedCandidates: builder.mutation<
      { message: string; insertedCount: number },
      { formId: string; candidates: any[] }
    >({
      query: ({ formId, candidates }) => ({
        url: `selected-candidates/${formId}`,
        method: "POST",
        body: { candidates },
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Selected", id: formId },
      ],
    }),

    deleteSelectedCandidateByEmail: builder.mutation<
      { message: string; affectedRows: number },
      { formId: string; email: string[] }
    >({
      query: ({ formId, email }) => ({
        url: `selected-candidates/${formId}/${email}`,
        method: "DELETE",
        body: { email },
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Selected", id: formId },
      ],
    }),

    getSelectedCandidatesByFormId: builder.query<Candidate, string>({
      query: (formId) => `selected-candidates/${formId}`,
      providesTags: (_result, _error, formId) => [
        { type: "Selected", id: formId },
      ],
    }),

    insertCandidates: builder.mutation<
      { message: string; insertedCount?: number },
      { tableType: string; formId: string; candidates: any[] }
    >({
      query: ({ tableType, formId, candidates }) => ({
        url: `candidates/${tableType}/${formId}`,
        method: "POST",
        body: { formId, tableType, candidates },
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Selected", id: formId },
      ],
    }),

    deleteCandidate: builder.mutation<
      { message: string; affectedRows?: number },
      { tableType: string; formId: string; email: string[] }
    >({
      query: ({ tableType, formId, email }) => ({
        url: `candidates/${tableType}/${formId}/${email}`,
        method: "DELETE",
        body: { formId, tableType, email },
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Selected", id: formId },
      ],
    }),

    getCandidates: builder.query<
      Candidate,
      { tableType: string; formId: string }
    >({
      query: ({ tableType, formId }) => `candidates/${tableType}/${formId}`,
      providesTags: (_result, _error, { formId }) => [
        { type: "Selected", id: formId },
      ],
    }),

    getCandidateCount: builder.query<
      { count: number },
      { tableType: string; formId: string }
    >({
      query: ({ tableType, formId }) =>
        `candidates/count/${formId}/${tableType}`,
    }),

    uploadImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: "/upload-image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetFormsQuery,
  useAddFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useGetFieldsByFormIdQuery,
  useLazyGetFieldsByFormIdQuery,
  useAddFieldMutation,
  useEditFieldMutation,
  useDeleteFieldMutation,
  useGetSubmissionsByFormIdQuery,
  useCloneFormMutation,
  useGetSubmissionByEmailQuery,
  useUpdateSubmissionMutation,
  useLazyGetSubmittedCountQuery,
  useReplaceFieldsMutation,
  useRegisterAddFormMutation,
  useRegisterUpdateFormMutation,
  useAddSelectedCandidatesMutation,
  useDeleteSelectedCandidateByEmailMutation,
  useGetSelectedCandidatesByFormIdQuery,
  useRegisterDeleteFormMutation,
  useGetAllRegistrationFormsQuery,
  useInsertCandidatesMutation,
  useDeleteCandidateMutation,
  useGetCandidatesQuery,
  useLazyGetCandidateCountQuery,
  useGetRegistrationFormQuery,
  useUploadImageMutation,
} = formSlice;
