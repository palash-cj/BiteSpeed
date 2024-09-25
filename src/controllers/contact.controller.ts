import { Request, Response } from 'express';
import { identifyContact } from '../services/contact.service';
import { Contact } from '../models/contact.model';

export const identifyContactController = async (req: Request, res: Response) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Email or phoneNumber is required' });
    }

    try {
        const response = await identifyContact(email, phoneNumber);
        res.json({
            contact: {
                primaryContactId: response.primaryContactId,
                emails: response.emails,
                phoneNumbers: response.phoneNumbers,
                secondaryContactIds: response.secondaryContactIds,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
};
