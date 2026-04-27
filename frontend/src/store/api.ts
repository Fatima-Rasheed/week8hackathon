import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://week8hackkathon.vercel.app/api'
  }),
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<{ documentId: string; filename: string }, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),

    analyzeDocument: builder.mutation<{ result: any }, string>({
      query: (documentId) => ({
        url: `/agents/analyze/${documentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Document'],
    }),

    chatWithDocument: builder.mutation<
      { result: any },
      { documentId: string; query: string }
    >({
      query: ({ documentId, query }) => ({
        url: `/agents/chat/${documentId}`,
        method: 'POST',
        body: { query },
      }),
    }),

    getDocuments: builder.query<any[], void>({
      query: () => '/documents',
      providesTags: ['Document'],
    }),

    getDocument: builder.query<any, string>({
      query: (id) => `/documents/${id}`,
      providesTags: ['Document'],
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useAnalyzeDocumentMutation,
  useChatWithDocumentMutation,
  useGetDocumentsQuery,
  useGetDocumentQuery,
} = api;
