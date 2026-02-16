import { Request, Response } from 'express';
import  {getSettings,updateSettings} from '../services/settings.service.js';

export const getSettingsController = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch settings" });
    }
};

export const updateSettingsController = async (req: Request, res: Response) => {
    try {
        const updatedSettings = await updateSettings(req.body);
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: "Failed to update settings" });
    }
};
