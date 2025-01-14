import { useState, useEffect } from "react";

interface DataLoaderProps {
  fetchData: () => Promise<any>;
  timeout?: number;
  children: (data: any) => React.ReactNode;
}

const DataLoader: React.FC<DataLoaderProps> = ({
  fetchData,
  timeout = 5000,
  children,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMouted = true;
    const timer = setTimeout(() => {
      if (isMouted) {
        setError("Timeout, Please try again later");
        setLoading(false);
      }
    }, timeout);

    const loadData = async () => {
      try {
        const result = await fetchData();
        if (isMouted) {
          setData(result);
          setLoading(false);
        }
      } catch (error) {
        if (isMouted) {
          setError("Failed to fetch data");
          setLoading(false);
        }
      }
    };
    loadData();

    return () => {
      isMouted = false;
      clearTimeout(timer);
    };
  }, [fetchData, timeout]);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  return <>{children(data)}</>;
};

export default DataLoader;
