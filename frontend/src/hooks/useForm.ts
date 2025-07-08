"use client"

import type React from "react"

import { useState, useCallback } from "react"
import type { FormState } from "../types"

interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void>
}

export function useForm<T extends Record<string, any>>({ initialValues, validate, onSubmit }: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    data: initialValues,
    errors: {},
    isSubmitting: false,
  })

  const updateField = useCallback((field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
    }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }))
  }, [])

  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
    }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      setState((prev) => ({ ...prev, isSubmitting: true, errors: {} }))

      try {
        // Validate if validation function is provided
        if (validate) {
          const validationErrors = validate(state.data)
          if (Object.keys(validationErrors).length > 0) {
            setState((prev) => ({
              ...prev,
              errors: validationErrors,
              isSubmitting: false,
            }))
            return
          }
        }

        await onSubmit(state.data)
      } catch (error) {
        console.error("Form submission error:", error)
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }))
      }
    },
    [state.data, validate, onSubmit],
  )

  const reset = useCallback(() => {
    setState({
      data: initialValues,
      errors: {},
      isSubmitting: false,
    })
  }, [initialValues])

  return {
    values: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    updateField,
    setError,
    setErrors,
    handleSubmit,
    reset,
  }
}
