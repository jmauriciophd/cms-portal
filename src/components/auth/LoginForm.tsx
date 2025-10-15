import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";
import { Lock, Mail, Shield } from "lucide-react";
import { usePermissions } from "./PermissionsContext";
import { toast } from "sonner@2.0.3";

interface LoginFormProps {
  onLogin: (user: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const { setCurrentUser: setPermUser } = usePermissions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock users database
  const mockUsers = [
    {
      id: 1,
      email: "admin@portal.com",
      password: "admin123",
      name: "Administrador",
      role: "admin",
      status: "active",
      twoFactorEnabled: false,
    },
    {
      id: 2,
      email: "editor@portal.com",
      password: "editor123",
      name: "Editor",
      role: "editor",
      status: "active",
      twoFactorEnabled: false,
    },
    {
      id: 3,
      email: "viewer@portal.com",
      password: "viewer123",
      name: "Visualizador",
      role: "viewer",
      status: "active",
      twoFactorEnabled: false,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Verificar usuários do localStorage
      const storedUsers = JSON.parse(
        localStorage.getItem("users") || "[]",
      );
      let user = storedUsers.find(
        (u: any) =>
          u.email === email && u.password === password,
      );

      // Se não encontrou no localStorage, busca nos mockUsers
      if (!user) {
        user = mockUsers.find(
          (u) => u.email === email && u.password === password,
        );
      }

      if (user) {
        // ✅ VERIFICAR STATUS DA CONTA
        if (
          user.status === "inactive" ||
          user.status === "suspended"
        ) {
          toast.error(
            "Conta desativada. Entre em contato com o administrador.",
          );
          setLoading(false);
          return;
        }

        // Verificar se conta está bloqueada por tentativas
        if (user.status === "blocked") {
          toast.error(
            "Conta bloqueada por múltiplas tentativas de login. Entre em contato com o administrador.",
          );
          setLoading(false);
          return;
        }

        if (user.twoFactorEnabled) {
          setShowOTP(true);
          toast.success("Código 2FA enviado para seu email");
        } else {
          completeLogin(user);
        }
      } else {
        toast.error("Email ou senha incorretos");
      }
      setLoading(false);
    }, 1000);
  };

  const handleOTPVerify = () => {
    setLoading(true);
    setTimeout(() => {
      // Mock OTP verification (any 6 digits work for demo)
      if (otpCode.length === 6) {
        // Verificar usuários do localStorage
        const storedUsers = JSON.parse(
          localStorage.getItem("users") || "[]",
        );
        let user = storedUsers.find(
          (u: any) => u.email === email,
        );

        // Se não encontrou no localStorage, busca nos mockUsers
        if (!user) {
          user = mockUsers.find((u) => u.email === email);
        }

        if (user) {
          // ✅ VERIFICAR STATUS DA CONTA novamente
          if (
            user.status === "inactive" ||
            user.status === "suspended" ||
            user.status === "blocked"
          ) {
            toast.error(
              "Conta desativada. Entre em contato com o administrador.",
            );
            setLoading(false);
            setShowOTP(false);
            return;
          }

          completeLogin(user);
        }
      } else {
        toast.error("Código OTP inválido");
        setLoading(false);
      }
    }, 800);
  };

  const completeLogin = (user: any) => {
    const token = `token_${Date.now()}_${Math.random().toString(36)}`;
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Set permissions context
    setPermUser({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    toast.success(`Bem-vindo, ${user.name}!`);
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">
            Portal CMS
          </CardTitle>
          <CardDescription className="text-center">
            {showOTP
              ? "Autenticação de Dois Fatores"
              : "Sistema de Gerenciamento de Conteúdo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOTP ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Autenticando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-center block">
                  Digite o código de 6 dígitos
                </Label>
                <p className="text-xs text-center text-gray-500 mb-4">
                  Use qualquer combinação de 6 números para
                  demonstração
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={setOtpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleOTPVerify}
                  className="w-full"
                  disabled={otpCode.length !== 6 || loading}
                >
                  {loading
                    ? "Verificando..."
                    : "Verificar Código"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOTP(false)}
                  className="w-full"
                  disabled={loading}
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}