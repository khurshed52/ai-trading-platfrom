import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const Navbar = () => {
  return (
   <nav className="bg-gray-800 p-4 text-white">
      <ul className="flex items-center gap-6">
        <li>
          <Link href={ROUTES.PUBLIC.HOME} className="hover:text-gray-300">
            Home
          </Link>
        </li>

        <li>
          <Link href={ROUTES.PUBLIC.ABOUT} className="hover:text-gray-300">
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
