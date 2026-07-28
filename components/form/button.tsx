"use client";
import type { ButtonProps } from '../../types/auth'
const variants = {
  primary: "bg-blue-600 hover:bg-blue-700",
  secondary: "bg-slate-600 hover:bg-slate-700",
  danger: "bg-red-600 hover:bg-red-700",
};

function Button({children, onClick, variant= "primary"}:ButtonProps) {
  return (
    <> 
    <button 
      className={`
        inline-flex items-center justify-center
        rounded-md
        px-4 py-2
        text-sm font-medium text-white
        transition-colors duration-200
        hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:scale-95
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        `
     }
        onClick={onClick}>
        {children}
    </button>
    </>
  )
}

export default Button