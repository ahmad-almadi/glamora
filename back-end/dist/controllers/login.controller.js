import { findUserByEmail } from "../services/user.service.js";
export default async function (req, res) {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (user) {
        return res.status(200).json({ message: "login successfully", user });
    }
}
