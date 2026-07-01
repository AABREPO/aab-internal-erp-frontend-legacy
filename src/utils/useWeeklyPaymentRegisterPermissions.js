import { useState, useEffect } from 'react';
import axios from 'axios';

export const WEEKLY_PAYMENT_REGISTER_MODULE_NAME = 'Weekly Payment Register';

export function useWeeklyPaymentRegisterPermissions(userRoles = []) {
    const [userPermissions, setUserPermissions] = useState([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuilderDash/api/user_roles/all');
                const allRoles = response.data || [];
                const userRoleNames = (userRoles || []).map((r) => r?.roles).filter(Boolean);
                const matchedRoles = allRoles.filter((role) => userRoleNames.includes(role.userRoles));
                const models = matchedRoles.flatMap((role) => role.userModels || []);
                const matchedModel = models.find((model) => model.models === WEEKLY_PAYMENT_REGISTER_MODULE_NAME);
                setUserPermissions(matchedModel?.permissions?.[0]?.userPermissions || []);
            } catch (error) {
                console.error('Error fetching Weekly Payment Register permissions:', error);
                setUserPermissions([]);
            }
        };

        if (userRoles?.length > 0) {
            fetchPermissions();
        } else {
            setUserPermissions([]);
        }
    }, [userRoles]);

    return {
        userPermissions,
        hasEditPermission: userPermissions.includes('Edit'),
        hasDeletePermission: userPermissions.includes('Delete'),
    };
}
