// 🧠 Login
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    userName: string;
  };
};

// 🧠 Register
export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  token: string;
  refreshToken: string;
};

// 🧠 Refresh Token
export type RefreshRequest = {
  refreshToken: string;
};

export type RefreshResponse = {
  token: string;
  refreshToken: string;
};
