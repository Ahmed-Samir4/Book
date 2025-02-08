import { systemRoles } from "../../utils/system-roles.js";


export const endPointsRoles  = {
    ADD_REVIEW: [systemRoles.USER],
    DELETE_REVIEW: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN , systemRoles.USER],
}