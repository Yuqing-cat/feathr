import Axios from "axios";
import {
  DataSource,
  Feature,
  FeatureLineage,
  UserRole,
  Role,
} from "../models/model";
import {
  InteractionRequiredAuthError,
  PublicClientApplication,
} from "@azure/msal-browser";
import { getMsalConfig } from "../utils/utils";

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT + "/api/v1";
const msalInstance = getMsalConfig();

export const fetchDataSources = async (project: string) => {
  const token = await getIdToken(msalInstance);
  return Axios.get<DataSource[]>(
    `${API_ENDPOINT}/projects/${project}/datasources?code=${token}`,
    { headers: {} }
  ).then((response) => {
    return response.data;
  });
};

export const fetchProjects = async () => {
  const token = await getIdToken(msalInstance);
  return Axios.get<[]>(`${API_ENDPOINT}/projects?code=${token}`, {
    headers: {},
  }).then((response) => {
    return response.data;
  });
};

export const fetchFeatures = async (
  project: string,
  page: number,
  limit: number,
  keyword: string
) => {
  const token = await getIdToken(msalInstance);
  return Axios.get<Feature[]>(
    `${API_ENDPOINT}/projects/${project}/features?code=${token}`,
    {
      params: { keyword: keyword, page: page, limit: limit },
      headers: {},
    }
  ).then((response) => {
    return response.data;
  });
};

export const fetchFeature = async (project: string, featureId: string) => {
  const token = await getIdToken(msalInstance);
  return Axios.get<Feature>(
    `${API_ENDPOINT}/features/${featureId}?code=${token}`,
    {}
  ).then((response) => {
    return response.data;
  });
};

export const fetchProjectLineages = async (project: string) => {
  const token = await getIdToken(msalInstance);
  return Axios.get<FeatureLineage>(
    `${API_ENDPOINT}/projects/${project}?code=${token}`,
    {}
  ).then((response) => {
    return response.data;
  });
};

export const fetchFeatureLineages = async (project: string) => {
  const token = await getIdToken(msalInstance);
  return Axios.get<FeatureLineage>(
    `${API_ENDPOINT}/features/lineage/${project}?code=${token}`,
    {}
  ).then((response) => {
    return response.data;
  });
};

// Following are place-holder code
export const createFeature = async (feature: Feature) => {
  const token = await getIdToken(msalInstance);
  return Axios.post(`${API_ENDPOINT}/features?code=${token}`, feature, {
    headers: { "Content-Type": "application/json;" },
    params: {},
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

export const updateFeature = async (feature: Feature, id: string) => {
  const token = await getIdToken(msalInstance);
  feature.guid = id;
  return await Axios.put(
    `${API_ENDPOINT}/features/${id}?code=${token}`,
    feature,
    {
      headers: { "Content-Type": "application/json;" },
      params: {},
    }
  )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

export const deleteFeature = async (qualifiedName: string) => {
  const token = await getIdToken(msalInstance);
  return await Axios.delete(
    `${API_ENDPOINT}/features/${qualifiedName}?code=${token}`,
    {
      headers: { "Content-Type": "application/json;" },
      params: {},
    }
  )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

export const listUserRole = async () => {
  const token = await getIdToken(msalInstance);
  return await Axios.get<UserRole[]>(
    `${API_ENDPOINT}/userroles?code=${token}`,
    {}
  ).then((response) => {
    return response.data;
  });
};

export const addUserRole = async (role: Role) => {
  console.log("aaaaa");
  const token = await getIdToken(msalInstance);
  console.log(`token ${token}`);
  return await Axios.post(
    `${API_ENDPOINT}/users/${role.userName}/userroles/add`,
    role,
    {
      headers: { "Content-Type": "application/json;" },
      params: {
        project: role.scope,
        role: role.roleName,
        reason: role.reason,
        code: token,
      },
    }
  )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

export const deleteUserRole = async (userrole: UserRole) => {
  const token = await getIdToken(msalInstance);
  const reason = "Delete from management UI.";
  return await Axios.post(
    `${API_ENDPOINT}/users/${userrole.userName}/userroles/delete?code=${token}`,
    userrole,
    {
      headers: { "Content-Type": "application/json;" },
      params: {
        project: userrole.scope,
        role: userrole.roleName,
        reason: reason,
      },
    }
  )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

export const getIdToken = async (
  msalInstance: PublicClientApplication
): Promise<string> => {
  const activeAccount = msalInstance.getActiveAccount(); // This will only return a non-null value if you have logic somewhere else that calls the setActiveAccount API
  const accounts = msalInstance.getAllAccounts();
  const request = {
    scopes: ["User.Read"],
    account: activeAccount || accounts[0],
  };
  // Silently acquire an token for a given set of scopes. Will use cached token if available, otherwise will attempt to acquire a new token from the network via refresh token.
  const authResult = await msalInstance.acquireTokenSilent(request);
  return authResult.idToken;
};
