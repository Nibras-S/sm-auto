import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function GoogleButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    function init() {
      if (!window.google?.accounts?.id || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (resp) => {
          try {
            await loginWithGoogle(resp.credential);
            navigate("/account");
          } catch {
            /* ignore */
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", width: 300 });
    }
    if (window.google?.accounts?.id) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = init;
      document.body.appendChild(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;
  return <div ref={ref} className="flex justify-center" />;
}
