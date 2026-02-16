import { prisma } from '../prisma.js';

export const getSettings = async () => {
    try {
        let settings = await prisma.siteSettings.findFirst();

        if (!settings) {
            // Create default settings if none exist
            settings = await prisma.siteSettings.create({
                data: {
                    storeName: "Glamora",
                    storeEmail: "contact@glamora.com",
                    storePhone: "+1 234 567 890",
                    storeAddress: "123 Fashion Street, New York, NY 10001",
                    currency: "USD",
                    timezone: "America/New_York"
                }
            });
        }

        return settings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        throw error;
    }
};

export const updateSettings = async (newSettings: any) => {
    try {
        // Find the first record to update
        const existingconfig = await prisma.siteSettings.findFirst();

        if (existingconfig) {
            return await prisma.siteSettings.update({
                where: { id: existingconfig.id },
                data: newSettings
            });
        } else {
            // Fallback if somehow no record exists (should be handled by getSettings logic mostly)
            return await prisma.siteSettings.create({
                data: newSettings
            });
        }
    } catch (error) {
        console.error("Error updating settings:", error);
        throw error;
    }
};
