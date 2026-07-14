import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const Navbar = () => {
  return (
   <nav className="bg-gray-800 p-4 text-white">
      <ul className="flex items-center gap-6">
        <li>
          <Link href={ROUTES.PUBLIC.DASHBOARD} className="hover:text-gray-300">
            Dashboard
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
