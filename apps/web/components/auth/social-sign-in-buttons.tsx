"use client";

import { Button } from "@/components/ui/button";

type Provider = "google" | "microsoft";

type SocialSignInButtonsProps = {
  onSignIn: (provider: Provider) => void;
  loadingProvider: Provider | null;
};

export function SocialSignInButtons({ onSignIn, loadingProvider }: SocialSignInButtonsProps) {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium"
        onClick={() => onSignIn("google")}
        disabled={loadingProvider !== null}
      >
        {/* Google "G" logo */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
        </svg>
        {loadingProvider === "google" ? "Bezig..." : "Verder met Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium"
        onClick={() => onSignIn("microsoft")}
        disabled={loadingProvider !== null}
      >
        {/* Microsoft four-squares logo */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <rect x="0" y="0" width="8.5" height="8.5" fill="#F35325"/>
          <rect x="9.5" y="0" width="8.5" height="8.5" fill="#81BC06"/>
          <rect x="0" y="9.5" width="8.5" height="8.5" fill="#05A6F0"/>
          <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFBA08"/>
        </svg>
        {loadingProvider === "microsoft" ? "Bezig..." : "Verder met Microsoft"}
      </Button>
    </div>
  );
}
