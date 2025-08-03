export interface User {
  id: number;
  name: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phoneNumber: string;
  status: "Available" | "On Trip" | "Unavailable" | "Disabled";
  role: "admin" | "driver";
  license: string;
  profilePicture: string;
  registrationDate: string;
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  lastName: string
  secondLastName?: string
  email: string
  password: string
  phoneNumber: string
  status?: "Available" | "On Trip" | "Unavailable" | "Disabled"
  role?: "admin" | "driver" // Opcional, pero restringido a estos valores
  license?: File // Si tu backend permite opcional, déjalo así; si es obligatorio, quita el "?"
  profilePicture?: File // Igual que arriba
}
