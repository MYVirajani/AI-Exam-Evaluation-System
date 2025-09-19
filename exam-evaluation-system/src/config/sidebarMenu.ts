// Define role-based menu items
export const sidebarMenuConfig: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/users" },
    { label: "Courses", href: "/courses" },
    { label: "Settings", href: "/settings" },
  ],
  educator: [
    { label: "Dashboard", href: "/educator/dashboard" },
    { label: "My Courses", href: "/courses" },
    { label: "Pricing Plans", href: "/pricing-plans" },
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "My Courses", href: "/courses" },
    { label: "Grades", href: "/grades" },
  ],
  guest: [
    { label: "Home", href: "/" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
  ],
};
