import axios from "axios";

export const fetchPermissions = async (token: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/permissions/view_permission`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
export const updatePermission = async (
  token: string,
  permissionData: {
    id: number;
    name: string;
    code: string;
    parentId: number;
    description: string;
  }
) => {
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/permissions/update_permission/${permissionData.id}`,
    permissionData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
export const deletePermission = async (token: string, permissionId: number) => {
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/permissions/delete_permission/${permissionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const addPermission = async (
  token: string,
  permissionData: {
    name: string;
    code: string;
    parentId: number;
    description: string;
  }
) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/permissions/add_permission`,
    permissionData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
