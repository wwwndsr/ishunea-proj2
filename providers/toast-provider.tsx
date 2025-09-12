"use client";

import { Toaster } from "react-hot-toast";

export const ToasterProvider = () => {
    return <Toaster  containerStyle={{
        top: 16,
        right: 16,
        zIndex: 9999, // <-- вот это делает toast поверх модалки
      }}/>;
};