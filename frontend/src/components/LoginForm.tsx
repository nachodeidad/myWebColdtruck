"use client";

import type { AxiosError } from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "../hooks/useForm";
import type { ApiError, LoginCredentials } from "../types";
import { validateLoginForm } from "../utils/validation";

const initialValues: LoginCredentials = {
  email: "",
  password: "",
};

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    values,
    errors,
    isSubmitting,
    updateField,
    setError,
    handleSubmit,
  } = useForm({
    initialValues,
    validate: validateLoginForm,
    onSubmit: async (data) => {
      try {
        await login(data);
        navigate("/main", { replace: true });
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        const message =
          axiosError.response?.data?.msg || "Error al iniciar sesión";
        setError("email", message);
      }
    },
  });

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField(field, e.target.value);
    };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestión</h1>
          <h2 className="text-xl text-gray-600 mt-2">ColdTruck</h2>
          <p className="text-gray-500 mt-4">
            Inicia sesión para acceder al sistema
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleInputChange("email")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleInputChange("password")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta? Contacta a tu administrador para obtener acceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

