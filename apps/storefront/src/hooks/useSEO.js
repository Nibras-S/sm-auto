import { useEffect } from "react";

const DEFAULT_TITLE =
  "Spare Mec Auto Spare Parts | Genuine & OEM Parts in UAE & GCC";

export default function useSEO({ title, description } = {}) {
  useEffect(() => {
    document.title = title
      ? `${title} | Spare Mec Auto Spare Parts`
      : DEFAULT_TITLE;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}
