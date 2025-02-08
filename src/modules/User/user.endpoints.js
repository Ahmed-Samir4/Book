import { systemRoles } from "../../utils/system-roles.js";




export const endPointsRoles  = {
    UPDATE_USER:[systemRoles.SUPER_ADMIN , systemRoles.ADMIN, systemRoles.USER],
    DELETE_USER:[systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
    GET_USER:[systemRoles.SUPER_ADMIN , systemRoles.ADMIN, systemRoles.USER],
    SOFT_DELETE_USER:[systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
    UPDATE_PASSWORD:[systemRoles.SUPER_ADMIN , systemRoles.ADMIN, systemRoles.USER],
}