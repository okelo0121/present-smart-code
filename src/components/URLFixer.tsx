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

        // Generic handler for all deep links using /?/pattern
        if (search.startsWith('?/')) {
            console.log('[URLFixer] Detected generic malformed URL pattern');

            let cleanSearch = search;

            // Handle different variations of the prefix
            if (cleanSearch.startsWith('?/?/')) {
                cleanSearch = cleanSearch.replace('?/?/', '/');
            } else if (cleanSearch.startsWith('??/')) {
                cleanSearch = cleanSearch.replace('??/', '/');
            } else if (cleanSearch.startsWith('?/')) {
                cleanSearch = cleanSearch.replace('?/', '/');
            }

            // cleanSearch now looks like "auth&email=..." or "reset-password&token=..."
            // We need to split the path from the query params

            // If it contains & or ?, split there
            let path = cleanSearch;
            let query = "";

            const firstAmp = cleanSearch.indexOf('&');
            const firstQ = cleanSearch.indexOf('?');

            let splitIndex = -1;
            if (firstAmp !== -1 && firstQ !== -1) splitIndex = Math.min(firstAmp, firstQ);
            else if (firstAmp !== -1) splitIndex = firstAmp;
            else if (firstQ !== -1) splitIndex = firstQ;

            if (splitIndex !== -1) {
                path = cleanSearch.substring(0, splitIndex);
                query = cleanSearch.substring(splitIndex);

                // If the separator was &, change it to ? for the first param
                if (query.startsWith('&')) {
                    query = '?' + query.substring(1);
                }
            }

            // Fix ~and~ separators in the query part
            if (query.includes('~and~')) {
                query = query.replace(/~and~/g, '&');
            }

            const newPath = `/${path}${query}`;
            console.log('[URLFixer] Redirecting to:', newPath);
            navigate(newPath, { replace: true });
            return;
        }

        // Keep the legacy specific check just in case, or remove if confident. 
        // For now, I'll rely on the generic one above which covers ?/auth too.

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
