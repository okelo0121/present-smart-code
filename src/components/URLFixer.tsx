import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const URLFixer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for the specific malformed pattern: /?/auth
        // The browser sees this as pathname="/" and search="?/?/auth..."
        const search = window.location.search;
        const pathname = window.location.pathname;

        // Case 1: URL is like https://domain.com/?/auth&email=...
        if (search.includes('?/auth')) {
            console.log('[URLFixer] Detected malformed URL pattern "?/auth"');

            // Extract the query parameters part
            // Remove the leading '?' and the '/?/auth' or '?/auth' prefix
            let cleanSearch = search;
            if (cleanSearch.startsWith('?/?/auth')) {
                cleanSearch = cleanSearch.replace('?/?/auth', '');
            } else if (cleanSearch.startsWith('??/auth')) {
                cleanSearch = cleanSearch.replace('??/auth', '');
            } else if (cleanSearch.startsWith('?/auth')) {
                cleanSearch = cleanSearch.replace('?/auth', '');
            }

            // If it starts with '&', change it to '?' for the new query string
            if (cleanSearch.startsWith('&')) {
                cleanSearch = '?' + cleanSearch.substring(1);
            } else if (!cleanSearch.startsWith('?')) {
                cleanSearch = '?' + cleanSearch;
            }

            // Fix the separators
            if (cleanSearch.includes('~and~')) {
                console.log('[URLFixer] Replacing "~and~" with "&"');
                cleanSearch = cleanSearch.replace(/~and~/g, '&');
            }

            const newPath = `/auth${cleanSearch}`;
            console.log('[URLFixer] Redirecting to:', newPath);
            navigate(newPath, { replace: true });
            return;
        }

        // Case 2: URL is correct path but has ~and~ separators
        // e.g. /auth?email=...~and~type=...
        if (search.includes('~and~')) {
            console.log('[URLFixer] Detected "~and~" separators');
            const newSearch = search.replace(/~and~/g, '&');
            navigate(`${pathname}${newSearch}`, { replace: true });
        }

    }, [location, navigate]);

    return null;
};
