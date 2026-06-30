import axios from 'axios';

// Resolves backend module permissions (Create/Edit/Delete) from a user's roles.
// Mirrors the permission-resolution approach used by `src/Components/MasterData/MasterData.js`.
export async function fetchUserModulePermissions(userRoles, moduleName) {
  const roleNames = (userRoles || [])
    .flatMap((r) => {
      if (typeof r === 'string') return [r];
      const rr = r?.roles;
      if (!rr) return [];
      return Array.isArray(rr) ? rr : [rr];
    })
    .filter(Boolean);

  if (!roleNames.length) return [];

  const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/user_roles/all');
  const allRoles = response.data || [];

  // userRoles values are matched against backend `role.userRoles`
  const matchedRoles = allRoles.filter((role) => roleNames.includes(role.userRoles));
  const models = matchedRoles.flatMap((role) => role.userModels || []);
  const matchedModel = models.find((model) => model.models === moduleName);

  return matchedModel?.permissions?.[0]?.userPermissions || [];
}