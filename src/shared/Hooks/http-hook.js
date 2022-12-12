import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpResquests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortctrl = new AbortController();
      activeHttpResquests.current.push(httpAbortctrl);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortctrl.signal,
        });

        const responseData = await response.json();

        activeHttpResquests.current = activeHttpResquests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortctrl
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpResquests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
