import { prisma } from "../prisma.js";
export const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};
