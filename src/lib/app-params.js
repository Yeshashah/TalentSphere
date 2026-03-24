const isNode = typeof window === 'undefined';

const windowObj = isNode
  ? { localStorage: new Map() }
  : window;

const storage = windowObj.localStorage;

/**
 * TTL configuration (in milliseconds)
 */
const TTL = {
  TOKEN: 60 * 60 * 1000, // 1 hour
  DEFAULT: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Convert camelCase to snake_case
 */
const toSnakeCase = (str) => {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase();
};

/**
 * Store value with TTL
 */
const setWithTTL = (
  key,
  value,
  ttl = TTL.DEFAULT
) => {
  try {
    const payload = {
      value,
      timestamp: Date.now(),
      ttl
    };

    storage.setItem(
      key,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error(
      "Storage write failed:",
      error
    );
  }
};

/**
 * Read value with TTL validation
 */
const getWithTTL = (key) => {
  try {
    const itemStr =
      storage.getItem(key);

    if (!itemStr) return null;

    const item =
      JSON.parse(itemStr);

    const now = Date.now();

    const isExpired =
      now - item.timestamp >
      item.ttl;

    if (isExpired) {
      storage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    storage.removeItem(key);
    return null;
  }
};

/**
 * Main parameter reader
 */
const getAppParamValue = (
  paramName,
  {
    defaultValue = undefined,
    removeFromUrl = false,
    ttl = TTL.DEFAULT
  } = {}
) => {
  if (isNode) {
    return defaultValue;
  }

  const storageKey =
    `base44_${toSnakeCase(paramName)}`;

  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const searchParam =
    urlParams.get(paramName);

  /**
   * Remove sensitive params from URL
   */
  if (removeFromUrl) {
    urlParams.delete(paramName);

    const newUrl =
      `${window.location.pathname}${
        urlParams.toString()
          ? `?${urlParams.toString()}`
          : ""
      }${window.location.hash}`;

    window.history.replaceState(
      {},
      document.title,
      newUrl
    );
  }

  /**
   * 1) URL value exists
   */
  if (searchParam) {
    setWithTTL(
      storageKey,
      searchParam,
      ttl
    );

    return searchParam;
  }

  /**
   * 2) Default value
   */
  if (defaultValue) {
    setWithTTL(
      storageKey,
      defaultValue,
      ttl
    );

    return defaultValue;
  }

  /**
   * 3) Stored value
   */
  const storedValue =
    getWithTTL(storageKey);

  if (storedValue) {
    return storedValue;
  }

  return null;
};

/**
 * Collect all app params
 */
const getAppParams = () => {
  /**
   * Clear token if requested
   */
  if (
    getAppParamValue(
      "clear_access_token"
    ) === "true"
  ) {
    storage.removeItem(
      "base44_access_token"
    );

    storage.removeItem("token");
  }

  return {
    appId: getAppParamValue(
      "app_id",
      {
        defaultValue: import.meta.env.VITE_BASE44_APP_ID,
        ttl: TTL.DEFAULT
      }
    ),

    token: getAppParamValue(
      "access_token",
      {
        removeFromUrl: true,
        ttl: TTL.TOKEN
      }
    ),

    fromUrl: getAppParamValue(
      "from_url",
      {
        defaultValue:
          window.location.href,
        ttl: TTL.DEFAULT
      }
    ),

    functionsVersion:
      getAppParamValue(
        "functions_version",
        {
          defaultValue:
            import.meta.env
              .VITE_BASE44_FUNCTIONS_VERSION,
          ttl: TTL.DEFAULT
        }
      ),

    appBaseUrl:
      getAppParamValue(
        "app_base_url",
        {
          defaultValue:
            import.meta.env
              .VITE_BASE44_APP_BASE_URL,
          ttl: TTL.DEFAULT
        }
      )
  };
};

/**
 * Export final params
 */
export const appParams = {
  ...getAppParams()
};