import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface RouterContextType {
  pathname: string;
  search: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  search: '',
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
  });

  useEffect(() => {
    const handlePopState = () => {
      setLocation({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    const [pathPart, queryPart] = to.split('?');
    const targetPath = pathPart || '/';
    const targetQuery = queryPart ? `?${queryPart}` : '';

    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }

    setLocation({
      pathname: targetPath,
      search: targetQuery,
    });

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contextValue = useMemo(
    () => ({
      pathname: location.pathname,
      search: location.search,
      navigate,
    }),
    [location.pathname, location.search]
  );

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(RouterContext);
  return {
    pathname: context.pathname,
    search: context.search,
  };
};

export const useNavigate = () => {
  const context = useContext(RouterContext);
  return context.navigate;
};

export const useSearchParams = (): [URLSearchParams, (params: URLSearchParams) => void] => {
  const { search, navigate, pathname } = useContext(RouterContext);
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams = (nextParams: URLSearchParams) => {
    const newQuery = nextParams.toString();
    navigate(`${pathname}${newQuery ? `?${newQuery}` : ''}`);
  };

  return [searchParams, setSearchParams];
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({ to, replace, children, className, onClick, ...rest }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Allow default behavior for modifier clicks (Cmd/Ctrl open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    e.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
