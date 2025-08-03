"use client";

import type { AxiosError } from "axios";
import { ArrowLeft, TruckIcon } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
        if (axiosError.response?.status === 403) {
          navigate("/disabled", { replace: true });
          return;
        }
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
    <div className="min-h-screen bg-white relative flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 z-10">
          <Link to="/landing">
            <button>
              <ArrowLeft className="bg-blue-500 rounded-md text-white hover:bg-blue-700 duration-900"/>
            </button>
          </Link>
          <div className="text-center mb-8">
            <div className=" flex justify-center items-center ">
              <div className="bg-blue-500 rounded-md m-1.5 p-3 h-9 flex justify-center items-center ">
                <TruckIcon className='text-white h-10 w-10'/>
              </div>
              <h2 className="text-3xl text-gray-600 mt-2 font-extrabold pb-2">ColdTruck</h2>
            </div>
            <p className="text-gray-500">
              Refrigerated transport monitoring
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleInputChange("email")}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ColdTruck@email.com"
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
                Password
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
                  Logging in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account? Contact your administrator to gain access.
            </p>
          </div>
        </div>
    </div>
  );
};

export default LoginForm;

