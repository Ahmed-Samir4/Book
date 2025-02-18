import { systemRoles } from "../../utils/system-roles.js";



export const endPointsRoles = {
    ADD_BOOK: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.AUTHOR],
}