// ============================================================
// backend/utils/homeRoute.js
// Single place that decides where a user lands after auth.
// Must stay in sync with frontend/src/utils/homeRoute.js and
// the routes declared in frontend/src/app/App.jsx.
// ============================================================

export const ONBOARDING_ROUTE = "/admin/school-setup/onboard";

// Roles that use the school-admin console
const ADMIN_ROLES = ["superadmin", "admin", "principal", "accountant", "staff"];

export const getHomeRoute = (role, onboardingCompleted) => {
    if (role === "teacher") return "/teacher/dashboard";
    if (role === "parent") return "/parent";

    if (ADMIN_ROLES.includes(role)) {
        // Only the school owner/admin has to run the setup wizard.
        if (role === "admin" && !onboardingCompleted) {
            return ONBOARDING_ROUTE;
        }
        return "/dashboard";
    }

    return "/login";
};

export default getHomeRoute;
